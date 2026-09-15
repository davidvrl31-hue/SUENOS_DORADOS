import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/** Tipos de movimiento permitidos */
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn({ name: 'id_movimiento' })
  idMovimiento!: number;

  @Column({ name: 'id_variante', type: 'int' })
  idVariante!: number;

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 20 })
  tipoMovimiento!: TipoMovimiento;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ name: 'stock_anterior', type: 'int' })
  stockAnterior!: number;

  @Column({ name: 'stock_nuevo', type: 'int' })
  stockNuevo!: number;

  @Column({ name: 'referencia_documento', type: 'varchar', length: 100, nullable: true })
  referenciaDocumento!: string | null;

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  @CreateDateColumn({ name: 'fecha_movimiento', type: 'timestamp without time zone' })
  fechaMovimiento!: Date;
}
