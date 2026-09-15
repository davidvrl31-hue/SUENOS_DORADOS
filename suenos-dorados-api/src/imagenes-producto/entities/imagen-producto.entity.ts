import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('imagenes_producto')
export class ImagenProducto {
  @PrimaryGeneratedColumn({ name: 'id_imagen' })
  idImagen!: number;

  @Column({ name: 'id_producto', type: 'int' })
  idProducto!: number;

  @Column({ name: 'id_color', type: 'int', nullable: true })
  idColor!: number | null;

  @Column({ name: 'url_imagen', type: 'varchar', length: 500 })
  urlImagen!: string;

  @Column({ type: 'int', default: 1 })
  orden!: number;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;
}
