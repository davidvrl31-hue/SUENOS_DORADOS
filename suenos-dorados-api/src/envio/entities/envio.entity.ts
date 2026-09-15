import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('envio')
export class Envio {
  @PrimaryGeneratedColumn({ name: 'id_envio' })
  idEnvio!: number;

  @Column({ name: 'id_pedido', type: 'int' })
  idPedido!: number;

  @Column({ name: 'id_estado_envio', type: 'int' })
  idEstadoEnvio!: number;

  @Column({ name: 'numero_guia', type: 'varchar', length: 100, nullable: true })
  numeroGuia!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  transportadora!: string | null;

  @Column({ name: 'fecha_envio', type: 'timestamp without time zone', nullable: true })
  fechaEnvio!: Date | null;

  @Column({ name: 'fecha_entrega_estimada', type: 'timestamp without time zone', nullable: true })
  fechaEntregaEstimada!: Date | null;

  @Column({ name: 'fecha_entrega_real', type: 'timestamp without time zone', nullable: true })
  fechaEntregaReal!: Date | null;
}
