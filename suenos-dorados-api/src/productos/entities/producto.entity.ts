import { Entity, Column, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';

@Entity('productos')
@Unique(['slug'])
export class Producto {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  idProducto!: number;

  @Column({ name: 'id_categoria' })
  idCategoria!: number;

  @Column({ name: 'id_coleccion', type: 'int', nullable: true }) // ◄--- Corregido con type: 'int'
  idColeccion!: number | null;

  @Column({ name: 'nombre_producto', length: 150 })
  nombreProducto!: string;

  @Column({ name: 'descripcion_producto', type: 'text', nullable: true }) // ◄--- Corregido con type: 'text'
  descripcionProducto!: string | null;

  @Column({ length: 180 })
  slug!: string;

  @Column({ name: 'estado_producto', type: 'boolean' })
  estadoProducto!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp without time zone' })
  fechaCreacion!: Date;
}