import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colores')
export class Color {
  @PrimaryGeneratedColumn({ name: 'id_color' })
  idColor!: number;

  @Column({ name: 'nombre_color', type: 'varchar', length: 60 })
  nombreColor!: string;

  @Column({ name: 'codigo_hex', type: 'varchar', length: 7, nullable: true }) // ◄--- Tipo e intenciones explícitas
  codigoHex!: string;
}