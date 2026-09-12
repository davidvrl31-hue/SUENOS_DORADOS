import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estado_pedido')
export class EstadoPedido {
  @PrimaryGeneratedColumn({ name: 'id_estado_pedido' })
  idEstadoPedido: number;

  @Column({ name: 'descripcion_estado', length: 60 })
  descripcionEstado: string;
}
