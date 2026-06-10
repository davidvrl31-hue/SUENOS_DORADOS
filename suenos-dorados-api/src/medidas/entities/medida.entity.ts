import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medidas')
export class Medida {
  @PrimaryGeneratedColumn({ name: 'id_medida' })
  idMedida!: number;

  @Column({ name: 'nombre_medida', length: 50 })
  nombreMedida!: string;

  @Column({ name: 'ancho_cm', type: 'numeric', precision: 6, scale: 2, nullable: true })
  anchoCm!: number | null;

  @Column({ name: 'largo_cm', type: 'numeric', precision: 6, scale: 2, nullable: true })
  largoCm!: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true }) // ◄--- Tipo explícito añadido
  descripcion!: string | null;
}