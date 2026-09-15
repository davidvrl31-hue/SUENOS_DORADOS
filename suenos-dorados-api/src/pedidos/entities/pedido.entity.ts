import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DetallePedido } from './detalle-pedido.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  idPedido!: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @Column({ name: 'id_direccion', type: 'int' })
  idDireccion!: number;

  @Column({ name: 'id_estado_pedido', type: 'int', default: 1 })
  idEstadoPedido!: number;

  @CreateDateColumn({ name: 'fecha_pedido', type: 'timestamp without time zone' })
  fechaPedido!: Date;

  @Column({ name: 'subtotal', type: 'numeric', precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ name: 'descuento', type: 'numeric', precision: 12, scale: 2, default: 0 })
  descuento!: number;

  @Column({ name: 'costo_envio', type: 'numeric', precision: 12, scale: 2, default: 0 })
  costoEnvio!: number;

  @Column({ name: 'total', type: 'numeric', precision: 12, scale: 2 })
  total!: number;

  @Column({ name: 'base_imponible', type: 'numeric', precision: 12, scale: 2, default: 0 })
  baseImponible!: number;

  @Column({ name: 'iva', type: 'numeric', precision: 12, scale: 2, default: 0 })
  iva!: number;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, { cascade: true, eager: true })
  detalles!: DetallePedido[];
}
