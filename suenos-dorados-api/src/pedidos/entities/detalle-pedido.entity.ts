import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';

// Nombre real de la tabla en tu DDL: detalle_pedido (sin "s")
@Entity('detalle_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn({ name: 'id_detalle_pedido' })
  idDetallePedido!: number;

  @Column({ name: 'id_pedido', type: 'int' })
  idPedido!: number;

  @Column({ name: 'id_variante', type: 'int' })
  idVariante!: number;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'precio_unitario', type: 'numeric', precision: 12, scale: 2 })
  precioUnitario!: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles)
  @JoinColumn({ name: 'id_pedido' })
  pedido!: Pedido;
}
