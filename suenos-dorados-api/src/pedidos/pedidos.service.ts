import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { MovimientosInventarioService } from '../movimientos-inventario/movimientos-inventario.service';
import { DescuentosService } from '../descuentos/descuentos.service';
import { EventsGateway } from '../events/events.gateway';

// IVA Colombia por defecto
const IVA_DEFAULT = 19;

// Subquery reutilizable: imagen principal del producto
const IMG_SUBQ = `(
  SELECT url_imagen
  FROM imagenes_producto
  WHERE id_producto = pr.id_producto AND es_principal = true
  LIMIT 1
)`;

/**
 * Calcula base imponible e IVA a partir del precio con IVA incluido.
 * En Colombia los precios al consumidor ya incluyen IVA.
 *   base = precio / (1 + iva/100)
 *   iva  = precio - base
 */
function desglosarIva(precioConIva: number, ivaPct: number) {
  const base = precioConIva / (1 + ivaPct / 100);
  const iva  = precioConIva - base;
  return {
    baseUnitario: Math.round(base * 100) / 100,
    ivaUnitario:  Math.round(iva  * 100) / 100,
  };
}

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detallesRepo: Repository<DetallePedido>,
    private readonly dataSource: DataSource,
    private readonly movimientosService: MovimientosInventarioService,
    private readonly descuentosService: DescuentosService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // ── Crear pedido ───────────────────────────────────────────────────────
  async crear(idUsuario: number, dto: CreatePedidoDto): Promise<Pedido> {

    // 1. Verificar stock disponible antes de procesar
    for (const item of dto.items) {
      const rows = await this.dataSource.query(
        `SELECT stock, iva_porcentaje FROM variantes_producto WHERE id_variante = $1 AND estado = true`,
        [item.idVariante],
      );
      if (!rows.length) {
        throw new BadRequestException(`La variante ${item.idVariante} no existe o está inactiva`);
      }
      if (rows[0].stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para la variante ${item.idVariante}. Disponible: ${rows[0].stock}`,
        );
      }
    }

    // 2. Calcular subtotal e IVA por ítem
    let subtotal      = 0;
    let totalBase     = 0;
    let totalIva      = 0;

    const itemsConIva: Array<{
      idVariante: number;
      cantidad: number;
      precioUnitario: number;
      ivaPorcentaje: number;
      baseUnitario: number;
      ivaUnitario: number;
    }> = [];

    for (const item of dto.items) {
      const rows = await this.dataSource.query(
        `SELECT iva_porcentaje FROM variantes_producto WHERE id_variante = $1`,
        [item.idVariante],
      );
      const ivaPct = Number(rows[0]?.iva_porcentaje ?? IVA_DEFAULT);
      const { baseUnitario, ivaUnitario } = desglosarIva(item.precioUnitario, ivaPct);

      const subtotalItem = item.precioUnitario * item.cantidad;
      subtotal   += subtotalItem;
      totalBase  += baseUnitario * item.cantidad;
      totalIva   += ivaUnitario  * item.cantidad;

      itemsConIva.push({ ...item, ivaPorcentaje: ivaPct, baseUnitario, ivaUnitario });
    }

    // 3. Aplicar cupón si viene
    let descuento = dto.descuento ?? 0;
    if (dto.codigoCupon) {
      // Extraer idProducto de cada variante para validar si el cupón aplica
      const idProductosRows = await this.dataSource.query(
        `SELECT DISTINCT id_producto FROM variantes_producto WHERE id_variante = ANY($1)`,
        [dto.items.map((i) => i.idVariante)],
      );
      const idProductos = idProductosRows.map((r: any) => Number(r.id_producto));
      const resultado = await this.descuentosService.validarCupon(dto.codigoCupon, subtotal, idProductos);
      if (!resultado.valido) {
        throw new BadRequestException(resultado.mensaje);
      }
      descuento = resultado.montoDescuento;
    }

    // 4. Calcular costo de envío (gratis si subtotal >= $100.000)
    const costoEnvio = dto.costoEnvio ?? (subtotal >= 100_000 ? 0 : 15_000);
    const total      = subtotal - descuento + costoEnvio;

    // Redondear para evitar decimales de punto flotante
    const round2 = (n: number) => Math.round(n * 100) / 100;

    // 5. Guardar pedido
    const pedido = this.pedidosRepo.create({
      idUsuario,
      idDireccion:    dto.idDireccion,
      idEstadoPedido: 1, // Pendiente
      subtotal:       round2(subtotal),
      descuento:      round2(descuento),
      costoEnvio:     round2(costoEnvio),
      total:          round2(total),
      baseImponible:  round2(totalBase),
      iva:            round2(totalIva),
    });

    const pedidoGuardado = await this.pedidosRepo.save(pedido);

    // 6. Guardar detalles con IVA discriminado
    const detalles = itemsConIva.map((item) =>
      this.detallesRepo.create({
        idPedido:       pedidoGuardado.idPedido,
        idVariante:     item.idVariante,
        cantidad:       item.cantidad,
        precioUnitario: item.precioUnitario,
        ivaPorcentaje:  item.ivaPorcentaje,
        baseUnitario:   item.baseUnitario,
        ivaUnitario:    item.ivaUnitario,
      }),
    );
    await this.detallesRepo.save(detalles);

    // 7. Descontar inventario y registrar movimiento + emitir evento WS
    for (const item of dto.items) {
      await this.movimientosService.registrar({
        idVariante:          item.idVariante,
        tipo:                'SALIDA',
        cantidad:            item.cantidad,
        referenciaDocumento: `PEDIDO-${pedidoGuardado.idPedido}`,
        observacion:         `Venta — Pedido #${pedidoGuardado.idPedido}`,
      });

      // Obtener stock actualizado y emitir en tiempo real
      const stockRows = await this.dataSource.query(
        `SELECT stock, id_producto, sku FROM variantes_producto WHERE id_variante = $1`,
        [item.idVariante],
      );
      if (stockRows.length > 0) {
        this.eventsGateway.emitVarianteStock({
          idVariante: item.idVariante,
          idProducto: stockRows[0].id_producto,
          stockNuevo: Number(stockRows[0].stock),
          sku:        stockRows[0].sku,
        });
      }
    }

    return this.pedidosRepo.findOne({
      where:     { idPedido: pedidoGuardado.idPedido },
      relations: { detalles: true },
    }) as Promise<Pedido>;
  }

  // ── Listar pedidos del usuario ─────────────────────────────────────────
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
        p.base_imponible,
        p.iva,
        ep.descripcion_estado,

        d.descripcion_direccion,
        d.descripcion_barrio,
        d.descripcion_municipio,
        d.descripcion_departamento,
        COALESCE(d.pais, 'Colombia')   AS pais,
        d.codigo_postal,
        d.complemento,
        d.indicaciones,
        d.nombre_destinatario,
        d.telefono_contacto,
        d.documento_identidad,
        COALESCE(d.etiqueta, 'Casa')   AS etiqueta,

        COALESCE(
          json_agg(
            json_build_object(
              'idDetallePedido', dp.id_detalle_pedido,
              'idVariante',      dp.id_variante,
              'cantidad',        dp.cantidad,
              'precioUnitario',  dp.precio_unitario,
              'subtotalItem',    (dp.cantidad * dp.precio_unitario),
              'ivaPorcentaje',   dp.iva_porcentaje,
              'baseUnitario',    dp.base_unitario,
              'ivaUnitario',     dp.iva_unitario,
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
        p.base_imponible,
        p.iva,
        ep.descripcion_estado,

        d.descripcion_direccion,
        d.descripcion_barrio,
        d.descripcion_municipio,
        d.descripcion_departamento,
        COALESCE(d.pais, 'Colombia')   AS pais,
        d.codigo_postal,
        d.complemento,
        d.indicaciones,
        d.nombre_destinatario,
        d.telefono_contacto,
        d.documento_identidad,
        COALESCE(d.etiqueta, 'Casa')   AS etiqueta,

        COALESCE(
          json_agg(
            json_build_object(
              'idDetallePedido', dp.id_detalle_pedido,
              'idVariante',      dp.id_variante,
              'cantidad',        dp.cantidad,
              'precioUnitario',  dp.precio_unitario,
              'subtotalItem',    (dp.cantidad * dp.precio_unitario),
              'ivaPorcentaje',   dp.iva_porcentaje,
              'baseUnitario',    dp.base_unitario,
              'ivaUnitario',     dp.iva_unitario,
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
