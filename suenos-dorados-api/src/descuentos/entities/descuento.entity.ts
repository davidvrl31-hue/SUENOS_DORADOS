import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('descuentos')
export class Descuento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_producto', type: 'int', nullable: true })
  idProducto!: number | null;

  @Column({ type: 'varchar', length: 40, unique: true })
  codigo!: string;

  @Column({ name: 'porcentaje_descuento', type: 'numeric', precision: 5, scale: 2 })
  porcentajeDescuento!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
