import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  idRol!: number;

  @Column({ name: 'descripcion_rol', type: 'varchar', length: 50 })
  descripcionRol!: string;
}