import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('categorias')
@Unique(['slug'])
export class Categoria {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  idCategoria!: number; // El signo ! elimina la advertencia de TypeScript

  @Column({ name: 'nombre_categoria', length: 80 })
  nombreCategoria!: string;

  @Column({ name: 'descripcion_categoria', type: 'text', nullable: true })
  descripcionCategoria!: string | null; // Al ser nullable en tu DDL, puede ser string o null

  @Column({ length: 100 })
  slug!: string;
}