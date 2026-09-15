import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colecciones')
export class Coleccion {
  @PrimaryGeneratedColumn({ name: 'id_coleccion' })
  idColeccion!: number;

  @Column({ name: 'id_categoria', type: 'int' })
  idCategoria!: number;

  @Column({ name: 'nombre_coleccion', type: 'varchar', length: 100 })
  nombreColeccion!: string;

  @Column({ name: 'descripcion_coleccion', type: 'text', nullable: true })
  descripcionColeccion!: string | null;

  @Column({ type: 'boolean', default: true })
  estado!: boolean;
}
