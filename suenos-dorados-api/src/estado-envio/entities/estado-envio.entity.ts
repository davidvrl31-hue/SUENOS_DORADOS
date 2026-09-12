import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estado_envio')
export class EstadoEnvio {
  @PrimaryGeneratedColumn({ name: 'id_estado_envio' })
  idEstadoEnvio: number;

  @Column({ name: 'descripcion_estado', length: 60 })
  descripcionEstado: string;
}
