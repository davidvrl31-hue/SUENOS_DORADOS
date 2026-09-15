import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MovimientoInventario, TipoMovimiento } from './entities/movimiento-inventario.entity';

export interface RegistrarMovimientoDto {
  idVariante: number;
  tipo: TipoMovimiento;
  cantidad: number;
  referenciaDocumento?: string;
  observacion?: string;
}

@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly repo: Repository<MovimientoInventario>,
    private readonly dataSource: DataSource,
  ) {}

  /** Registra un movimiento y actualiza el stock de la variante */
  async registrar(dto: RegistrarMovimientoDto): Promise<MovimientoInventario> {
    // Obtener stock actual
    const rows = await this.dataSource.query(
      `SELECT stock FROM variantes_producto WHERE id_variante = $1`,
      [dto.idVariante],
    );
    if (!rows.length) throw new NotFoundException(`Variante ${dto.idVariante} no encontrada`);

    const stockAnterior = Number(rows[0].stock);
    let stockNuevo: number;

    switch (dto.tipo) {
      case 'ENTRADA':
      case 'DEVOLUCION':
        stockNuevo = stockAnterior + dto.cantidad;
        break;
      case 'SALIDA':
        stockNuevo = Math.max(0, stockAnterior - dto.cantidad);
        break;
      case 'AJUSTE':
        // En ajuste, cantidad es el stock nuevo absoluto
        stockNuevo = dto.cantidad;
        break;
    }

    // Actualizar stock
    await this.dataSource.query(
      `UPDATE variantes_producto SET stock = $1 WHERE id_variante = $2`,
      [stockNuevo, dto.idVariante],
    );

    const mov = this.repo.create({
      idVariante: dto.idVariante,
      tipoMovimiento: dto.tipo,
      cantidad: dto.tipo === 'AJUSTE' ? Math.abs(stockNuevo - stockAnterior) : dto.cantidad,
      stockAnterior,
      stockNuevo,
      referenciaDocumento: dto.referenciaDocumento ?? null,
      observacion: dto.observacion ?? null,
    });

    return this.repo.save(mov);
  }

  findByVariante(idVariante: number): Promise<MovimientoInventario[]> {
    return this.repo.find({
      where: { idVariante },
      order: { fechaMovimiento: 'DESC' },
    });
  }

  findAll(limit = 100): Promise<MovimientoInventario[]> {
    return this.repo.find({
      order: { fechaMovimiento: 'DESC' },
      take: limit,
    });
  }

  /** Reporte con nombre de producto y variante */
  async reporte(limit = 200) {
    return this.dataSource.query(`
      SELECT
        mi.id_movimiento,
        mi.tipo_movimiento,
        mi.cantidad,
        mi.stock_anterior,
        mi.stock_nuevo,
        mi.referencia_documento,
        mi.observacion,
        mi.fecha_movimiento,
        vp.sku,
        vp.referencia,
        pr.nombre_producto,
        m.nombre_medida,
        c.nombre_color
      FROM movimientos_inventario mi
      LEFT JOIN variantes_producto vp ON vp.id_variante = mi.id_variante
      LEFT JOIN productos pr ON pr.id_producto = vp.id_producto
      LEFT JOIN medidas m ON m.id_medida = vp.id_medida
      LEFT JOIN colores c ON c.id_color = vp.id_color
      ORDER BY mi.fecha_movimiento DESC
      LIMIT $1
    `, [limit]);
  }
}
