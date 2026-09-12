import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';

// Subquery reutilizable: imagen principal del producto
// (la columna imagen_url NO existe en la tabla productos — está en imagenes_producto)
const IMG_SUBQ = `(
  SELECT url_imagen
  FROM imagenes_producto
  WHERE id_producto = pr.id_producto AND es_principal = true
  LIMIT 1
)`;

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detallesRepo: Repository<DetallePedido>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Crear pedido ───────────────────────────────────────────────────────
  async crear(idUsuario: number, dto: CreatePedidoDto): Promise<Pedido> {
    const subtotal   = dto.items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
    const descuento  = dto.descuento ?? 0;
    const costoEnvio = dto.costoEnvio ?? (subtotal >= 100_000 ? 0 : 15_000);
    const total      = subtotal - descuento + costoEnvio;

    const pedido = this.pedidosRepo.create({
      idUsuario,
      idDireccion:    dto.idDireccion,
      idEstadoPedido: 1, // Pendiente
      subtotal,
      descuento,
      costoEnvio,
      total,
    });

    const pedidoGuardado = await this.pedidosRepo.save(pedido);

    const detalles = dto.items.map((item) =>
      this.detallesRepo.create({
        idPedido:       pedidoGuardado.idPedido,
        idVariante:     item.idVariante,
        cantidad:       item.cantidad,
        precioUnitario: item.precioUnitario,
      }),
    );
    await this.detallesRepo.save(detalles);

    // Descontar stock
    for (const item of dto.items) {
      await this.dataSource.query(`
        UPDATE variantes_producto
        SET stock = GREATEST(0, stock - $1)
        WHERE id_variante = $2
      `, [item.cantidad, item.idVariante]);
    }

    return this.pedidosRepo.findOne({
      where:     { idPedido: pedidoGuardado.idPedido },
      relations: { detalles: true },
    }) as Promise<Pedido>;
  }

  // ── Listar pedidos del usuario con datos enriquecidos ─────────────────
  async findByUsuario(idUsuario: number) {
    const rows = await this.dataSource.query(`
      SELECT
        p.id_pedido,
        p.id_direccion,
        p.id_estado_pedido,
        p.fecha_pedido,
        p.subtotal,
        p.descuento,
        p.costo_envio,
        p.total,
        ep.descripcion_estado,

        d.descripcion_direccion,
        d.descripcion_barrio,
        d.descripcion_municipio,
        d.descripcion_departamento,
        COALESCE(d.pais, 'Colombia')         AS pais,
        d.codigo_postal,
        d.complemento,
        d.indicaciones,
        d.nombre_destinatario,
        d.telefono_contacto,
        d.documento_identidad,
        COALESCE(d.etiqueta, 'Casa')         AS etiqueta,

        COALESCE(
          json_agg(
            json_build_object(
              'idDetallePedido', dp.id_detalle_pedido,
              'idVariante',      dp.id_variante,
              'cantidad',        dp.cantidad,
              'precioUnitario',  dp.precio_unitario,
              'subtotalItem',    (dp.cantidad * dp.precio_unitario),
              'sku',             vp.sku,
              'referencia',      vp.referencia,
              'color',           c.nombre_color,
              'medida',          m.nombre_medida,
              'nombreProducto',  pr.nombre_producto,
              'imagenProducto',  ${IMG_SUBQ}
            )
          ) FILTER (WHERE dp.id_detalle_pedido IS NOT NULL),
          '[]'
        ) AS detalles

      FROM pedidos p
      LEFT JOIN estado_pedido      ep ON ep.id_estado_pedido = p.id_estado_pedido
      LEFT JOIN direcciones        d  ON d.id_direccion      = p.id_direccion
      LEFT JOIN detalle_pedido     dp ON dp.id_pedido        = p.id_pedido
      LEFT JOIN variantes_producto vp ON vp.id_variante      = dp.id_variante
      LEFT JOIN colores            c  ON c.id_color          = vp.id_color
      LEFT JOIN medidas            m  ON m.id_medida         = vp.id_medida
      LEFT JOIN productos          pr ON pr.id_producto      = vp.id_producto

      WHERE p.id_usuario = $1
      GROUP BY p.id_pedido, ep.id_estado_pedido, d.id_direccion
      ORDER BY p.fecha_pedido DESC
    `, [idUsuario]);

    return rows;
  }

  // ── Detalle completo de un pedido ─────────────────────────────────────
  async findOne(idPedido: number, idUsuario: number) {
    const rows = await this.dataSource.query(`
      SELECT
        p.id_pedido,
        p.id_direccion,
        p.id_estado_pedido,
        p.fecha_pedido,
        p.subtotal,
        p.descuento,
        p.costo_envio,
        p.total,
        ep.descripcion_estado,

        d.descripcion_direccion,
        d.descripcion_barrio,
        d.descripcion_municipio,
        d.descripcion_departamento,
        COALESCE(d.pais, 'Colombia')         AS pais,
        d.codigo_postal,
        d.complemento,
        d.indicaciones,
        d.nombre_destinatario,
        d.telefono_contacto,
        d.documento_identidad,
        COALESCE(d.etiqueta, 'Casa')         AS etiqueta,

        COALESCE(
          json_agg(
            json_build_object(
              'idDetallePedido', dp.id_detalle_pedido,
              'idVariante',      dp.id_variante,
              'cantidad',        dp.cantidad,
              'precioUnitario',  dp.precio_unitario,
              'subtotalItem',    (dp.cantidad * dp.precio_unitario),
              'sku',             vp.sku,
              'referencia',      vp.referencia,
              'color',           c.nombre_color,
              'codigoHexColor',  c.codigo_hex,
              'medida',          m.nombre_medida,
              'nombreProducto',  pr.nombre_producto,
              'imagenProducto',  ${IMG_SUBQ},
              'slugProducto',    pr.slug
            )
          ) FILTER (WHERE dp.id_detalle_pedido IS NOT NULL),
          '[]'
        ) AS detalles

      FROM pedidos p
      LEFT JOIN estado_pedido      ep ON ep.id_estado_pedido = p.id_estado_pedido
      LEFT JOIN direcciones        d  ON d.id_direccion      = p.id_direccion
      LEFT JOIN detalle_pedido     dp ON dp.id_pedido        = p.id_pedido
      LEFT JOIN variantes_producto vp ON vp.id_variante      = dp.id_variante
      LEFT JOIN colores            c  ON c.id_color          = vp.id_color
      LEFT JOIN medidas            m  ON m.id_medida         = vp.id_medida
      LEFT JOIN productos          pr ON pr.id_producto      = vp.id_producto

      WHERE p.id_pedido = $1 AND p.id_usuario = $2
      GROUP BY p.id_pedido, ep.id_estado_pedido, d.id_direccion
    `, [idPedido, idUsuario]);

    if (!rows.length) throw new NotFoundException(`Pedido ${idPedido} no encontrado`);
    return rows[0];
  }
}
