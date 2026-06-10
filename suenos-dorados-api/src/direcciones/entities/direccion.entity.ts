import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'id_direccion' })
  idDireccion!: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @Column({ name: 'descripcion_direccion', type: 'varchar', length: 200 })
  descripcionDireccion!: string;

  @Column({ name: 'descripcion_barrio', type: 'varchar', length: 100, nullable: true })
  descripcionBarrio!: string | null;

  @Column({ name: 'descripcion_municipio', type: 'varchar', length: 100 })
  descripcionMunicipio!: string;

  @Column({ name: 'descripcion_departamento', type: 'varchar', length: 100 })
  descripcionDepartamento!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;
}
