import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { VariantesProducto } from '../variantes-producto/entities/variantes-producto.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepo: Repository<Pedido>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(VariantesProducto)
    private readonly variantesRepo: Repository<VariantesProducto>,
    @InjectRepository(Producto)
    private readonly productosRepo: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriasRepo: Repository<Categoria>,
    private readonly dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async dashboardStats() {
    const [
      totalUsuarios,
      totalProductos,
      totalCategorias,
      totalVariantes,
      stockTotal,
      stockBajo,
      agotados,
      totalPedidos,
      ventasHoy,
    ] = await Promise.all([
      this.usuariosRepo.count(),
      this.productosRepo.count({ where: { estadoProducto: true } }),
      this.categoriasRepo.count(),
      this.variantesRepo.count({ where: { estado: true } }),
      this.dataSource.query(`
        SELECT COALESCE(SUM(stock), 0) AS total
        FROM variantes_producto WHERE estado = true
      `),
      this.dataSource.query(`
        SELECT COUNT(*) AS total FROM variantes_producto
        WHERE estado = true AND stock > 0 AND stock <= 3
      `),
      this.dataSource.query(`
        SELECT COUNT(*) AS total FROM variantes_producto
        WHERE estado = true AND stock <= 0
      `),
      this.pedidosRepo.count(),
      this.dataSource.query(`
        SELECT COALESCE(SUM(p.total), 0) AS total
        FROM pedidos p
        JOIN estado_pedido ep ON ep.id_estado_pedido = p.id_estado_pedido
        WHERE DATE(p.fecha_pedido) = CURRENT_DATE
          AND ep.descripcion_estado IN ('Pagado', 'En preparación', 'Despachado', 'Entregado')
      `),
    ]);

    return {
      usuarios: totalUsuarios,
      productos: totalProductos,
      categorias: totalCategorias,
      variantes: totalVariantes,
      stockTotal: Number(stockTotal[0]?.total ?? 0),
      stockBajo: Number(stockBajo[0]?.total ?? 0),
      agotados: Number(agotados[0]?.total ?? 0),
      pedidos: totalPedidos,
      ventasHoy: Number(ventasHoy[0]?.total ?? 0),
    };
  }

  async listarPedidos(estado?: string, limit = 50) {
    const query = this.dataSource.query(`
      SELECT
        p.id_pedido, p.id_usuario, p.id_direccion, p.id_estado_pedido,
        p.fecha_pedido, p.subtotal, p.descuento, p.costo_envio, p.total,
        u.nombre_usuario, u.apellido_usuario, u.correo_electronico,
        ep.descripcion_estado
      FROM pedidos p
      LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario
      LEFT JOIN estado_pedido ep ON ep.id_estado_pedido = p.id_estado_pedido
      ${estado ? `WHERE ep.descripcion_estado = '${estado.replace(/'/g, "''")}'` : ''}
      ORDER BY p.fecha_pedido DESC
      LIMIT ${limit}
    `);
    return query;
  }

  async obtenerPedido(id: number) {
    const rows = await this.dataSource.query(`
      SELECT
        p.id_pedido, p.id_usuario, p.id_direccion, p.id_estado_pedido,
        p.fecha_pedido, p.subtotal, p.descuento, p.costo_envio, p.total,
        u.nombre_usuario, u.apellido_usuario, u.correo_electronico,
        ep.descripcion_estado,
        json_agg(json_build_object(
          'id_detalle_pedido', dp.id_detalle_pedido,
          'id_variante', dp.id_variante,
          'cantidad', dp.cantidad,
          'precio_unitario', dp.precio_unitario,
          'sku', v.sku,
          'referencia', v.referencia,
          'nombre_producto', pr.nombre_producto
        )) AS detalles
      FROM pedidos p
      LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario
      LEFT JOIN estado_pedido ep ON ep.id_estado_pedido = p.id_estado_pedido
      LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
      LEFT JOIN variantes_producto v ON v.id_variante = dp.id_variante
      LEFT JOIN productos pr ON pr.id_producto = v.id_producto
      WHERE p.id_pedido = $1
      GROUP BY p.id_pedido, u.id_usuario, ep.id_estado_pedido
    `, [id]);

    if (!rows.length) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return rows[0];
  }

  async cambiarEstadoPedido(id: number, idEstadoPedido: number) {
    const pedido = await this.pedidosRepo.findOne({ where: { idPedido: id } });
    if (!pedido) throw new NotFoundException(`Pedido ${id} no encontrado`);
    await this.pedidosRepo.update(id, { idEstadoPedido });

    // Obtener descripción del estado para el evento WS
    const estadoRows = await this.dataSource.query(
      `SELECT descripcion_estado FROM estado_pedido WHERE id_estado_pedido = $1`,
      [idEstadoPedido],
    );
    const descripcionEstado = estadoRows[0]?.descripcion_estado ?? 'Actualizado';

    // Emitir evento en tiempo real a Web y Móvil
    this.eventsGateway.emitPedidoEstado({
      idPedido: id,
      idEstadoPedido,
      descripcionEstado,
    });

    return this.obtenerPedido(id);
  }

  async listarUsuarios() {
    return this.usuariosRepo.find({
      select: {
        idUsuario: true,
        nombreUsuario: true,
        apellidoUsuario: true,
        correoElectronico: true,
        telefono: true,
        idRol: true,
        estado: true,
        fechaRegistro: true,
      },
      order: { idUsuario: 'ASC' },
    });
  }

  async toggleEstadoUsuario(id: number, estado: boolean) {
    const usuario = await this.usuariosRepo.findOne({ where: { idUsuario: id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    await this.usuariosRepo.update(id, { estado });
    return this.usuariosRepo.findOne({
      where: { idUsuario: id },
      select: {
        idUsuario: true,
        nombreUsuario: true,
        apellidoUsuario: true,
        correoElectronico: true,
        estado: true,
      },
    });
  }

  async resumenInventario() {
    const rows = await this.dataSource.query(`
      SELECT
        v.id_variante, v.sku, v.referencia, v.precio, v.stock, v.estado,
        p.nombre_producto,
        m.nombre_medida,
        c.nombre_color,
        CASE
          WHEN v.stock <= 0 THEN 'Agotado'
          WHEN v.stock <= 3 THEN 'Stock bajo'
          ELSE 'Normal'
        END AS estado_stock
      FROM variantes_producto v
      LEFT JOIN productos p ON p.id_producto = v.id_producto
      LEFT JOIN medidas m ON m.id_medida = v.id_medida
      LEFT JOIN colores c ON c.id_color = v.id_color
      WHERE v.estado = true
      ORDER BY v.stock ASC, v.sku ASC
    `);
    return rows;
  }

  async stockBajo() {
    const rows = await this.dataSource.query(`
      SELECT
        v.id_variante, v.sku, v.referencia, v.stock,
        p.nombre_producto
      FROM variantes_producto v
      LEFT JOIN productos p ON p.id_producto = v.id_producto
      WHERE v.estado = true AND v.stock <= 3
      ORDER BY v.stock ASC
    `);
    return rows;
  }

  async ventasUltimos7Dias() {
    const rows = await this.dataSource.query(`
      SELECT TO_CHAR(day::date, 'DD/MM') AS label,
             COALESCE(SUM(p.total), 0) AS value
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS day
      LEFT JOIN pedidos p ON DATE(p.fecha_pedido) = day::date
      GROUP BY day
      ORDER BY day
    `);
    return rows.map((r: any) => ({ label: r.label, value: Number(r.value) }));
  }

  async usuariosUltimos6Meses() {
    const rows = await this.dataSource.query(`
      SELECT TO_CHAR(month::date, 'MM/YYYY') AS label,
             COALESCE(COUNT(u.id_usuario), 0) AS value
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month
      LEFT JOIN usuarios u ON date_trunc('month', u.fecha_registro) = month
      GROUP BY month
      ORDER BY month
    `);
    return rows.map((r: any) => ({ label: r.label, value: Number(r.value) }));
  }

  async pedidosPorEstado() {
    const rows = await this.dataSource.query(`
      SELECT ep.descripcion_estado AS label,
             COUNT(p.id_pedido) AS value
      FROM estado_pedido ep
      LEFT JOIN pedidos p ON p.id_estado_pedido = ep.id_estado_pedido
      GROUP BY ep.descripcion_estado
      ORDER BY value DESC, ep.descripcion_estado ASC
      LIMIT 6
    `);
    return rows.map((r: any) => ({ label: r.label, value: Number(r.value) }));
  }

  // ── Endpoints genéricos para soporte de PyFlet Desktop ──
  async listarTablaGenerica(table: string) {
    if (!ALLOWED_TABLES.has(table)) {
      throw new BadRequestException(`Acceso denegado a la tabla ${table}`);
    }
    const query = `SELECT * FROM ${table}`;
    try {
      const rows = await this.dataSource.query(query);
      return rows.map(r => convertKeysToCamel(r));
    } catch (e: any) {
      throw new BadRequestException(`Error al listar de ${table}: ${e.message}`);
    }
  }

  async crearRegistroGenerico(table: string, body: any) {
    if (!ALLOWED_TABLES.has(table)) {
      throw new BadRequestException(`Acceso denegado a la tabla ${table}`);
    }
    const snakeBody = convertKeysToSnake(body);
    const keys = Object.keys(snakeBody);
    if (keys.length === 0) {
      throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
    }

    const columns = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => snakeBody[k]);

    const pk = PK_MAP[table] || 'id';

    const query = `
      INSERT INTO ${table} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    try {
      const rows = await this.dataSource.query(query, values);
      return convertKeysToCamel(rows[0]);
    } catch (e: any) {
      throw new BadRequestException(`Error al insertar en ${table}: ${e.message}`);
    }
  }

  async actualizarRegistroGenerico(table: string, id: string, body: any) {
    if (!ALLOWED_TABLES.has(table)) {
      throw new BadRequestException(`Acceso denegado a la tabla ${table}`);
    }
    const snakeBody = convertKeysToSnake(body);
    const keys = Object.keys(snakeBody);
    if (keys.length === 0) {
      throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
    }

    const pk = PK_MAP[table] || 'id';

    // Filtramos la PK del cuerpo para que no se actualice a sí misma
    const keysToSet = keys.filter(k => k !== pk);
    if (keysToSet.length === 0) {
      throw new BadRequestException('No hay campos para actualizar');
    }

    const setClause = keysToSet.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...keysToSet.map(k => snakeBody[k])];

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${pk} = $1
      RETURNING *
    `;

    try {
      const rows = await this.dataSource.query(query, values);
      if (rows.length === 0) {
        throw new NotFoundException(`Registro con ${pk} = ${id} no encontrado en ${table}`);
      }
      return convertKeysToCamel(rows[0]);
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(`Error al actualizar en ${table}: ${e.message}`);
    }
  }

  async eliminarRegistroGenerico(table: string, id: string) {
    if (!ALLOWED_TABLES.has(table)) {
      throw new BadRequestException(`Acceso denegado a la tabla ${table}`);
    }
    const pk = PK_MAP[table] || 'id';
    const query = `
      DELETE FROM ${table}
      WHERE ${pk} = $1
      RETURNING *
    `;
    try {
      const rows = await this.dataSource.query(query, [id]);
      if (rows.length === 0) {
        throw new NotFoundException(`Registro con ${pk} = ${id} no encontrado en ${table}`);
      }
      return convertKeysToCamel(rows[0]);
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(`Error al eliminar de ${table}: ${e.message}`);
    }
  }
}

// ── Tablas y PKs permitidas para el endpoint genérico ──
const PK_MAP: Record<string, string> = {
  categorias: 'id_categoria',
  colores: 'id_color',
  medidas: 'id_medida',
  colecciones: 'id_coleccion',
  usuarios: 'id_usuario',
  direcciones: 'id_direccion',
  productos: 'id_producto',
  descuentos: 'id',
  imagenes_producto: 'id_imagen',
  pedidos: 'id_pedido',
  variantes_producto: 'id_variante',
  detalle_pedido: 'id_detalle_pedido',
  envio: 'id_envio',
  movimientos_inventario: 'id_movimiento',
  pagos: 'id_pago',
};

const ALLOWED_TABLES = new Set([
  'categorias',
  'colores',
  'medidas',
  'colecciones',
  'usuarios',
  'direcciones',
  'productos',
  'descuentos',
  'imagenes_producto',
  'pedidos',
  'variantes_producto',
  'detalle_pedido',
  'envio',
  'movimientos_inventario',
  'pagos',
  'estado_pedido',
  'estado_envio',
  'configuracion_empresa',
  'roles',
]);

// ── Utilidades de conversión camelCase <-> snake_case ──
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnake(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  const res: any = {};
  for (const key of Object.keys(obj)) {
    res[camelToSnake(key)] = obj[key];
  }
  return res;
}

function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', ''),
  );
}

function convertKeysToCamel(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  const res: any = {};
  for (const key of Object.keys(obj)) {
    res[snakeToCamel(key)] = obj[key];
  }
  return res;
}
