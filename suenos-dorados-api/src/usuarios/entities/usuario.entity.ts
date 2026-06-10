import { Entity, Column, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
@Unique(['correoElectronico'])
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ name: 'id_rol' })
  idRol!: number;

  @Column({ name: 'nombre_usuario', length: 80 })
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', length: 80 })
  apellidoUsuario!: string;

  @Column({ name: 'correo_electronico', length: 120 })
  correoElectronico!: string;

  @Column({ type: 'varchar', length: 20, nullable: true }) // ◄--- Tipo explícito añadido
  telefono!: string | null;

  @Column({ name: 'contrasena_hash', length: 255 })
  contrasenaHash!: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp without time zone' })
  fechaRegistro!: Date;

  @Column({ type: 'boolean' })
  estado!: boolean;
}