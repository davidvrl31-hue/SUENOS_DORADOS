import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('variantes_producto')
@Unique(['sku'])
export class VariantesProducto {
  @PrimaryGeneratedColumn({ name: 'id_variante' })
  idVariante!: number;

  @Column({ name: 'id_producto', type: 'int' })
  idProducto!: number;

  @Column({ name: 'id_medida', type: 'int' })
  idMedida!: number;

  @Column({ name: 'id_color', type: 'int' })
  idColor!: number;

  @Column({ type: 'varchar', length: 60 })
  sku!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precio!: number;

  @Column({ type: 'varchar', length: 100 })
  referencia!: string;

  @Column({ type: 'int' })
  stock!: number;

  @Column({ type: 'boolean' })
  estado!: boolean;
}