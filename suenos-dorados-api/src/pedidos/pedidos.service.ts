import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detallesRepo: Repository<DetallePedido>,
  ) {}

  async crear(idUsuario: number, dto: CreatePedidoDto): Promise<Pedido> {
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.precioUnitario * item.cantidad,
      0,
    );
    const descuento = dto.descuento ?? 0;
    const costoEnvio = dto.costoEnvio ?? (subtotal >= 100000 ? 0 : 15000);
    const total = subtotal - descuento + costoEnvio;

    // Crear pedido con la estructura real del DDL
    const pedido = this.pedidosRepo.create({
      idUsuario,
      idDireccion: dto.idDireccion,
      idEstadoPedido: 1, // 1 = 'Pendiente' según tus datos iniciales
      subtotal,
      descuento,
      costoEnvio,
      total,
    });

    const pedidoGuardado = await this.pedidosRepo.save(pedido);

    // Crear detalles — tabla real: detalle_pedido
    const detalles = dto.items.map((item) =>
      this.detallesRepo.create({
        idPedido: pedidoGuardado.idPedido,
        idVariante: item.idVariante,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      }),
    );

    await this.detallesRepo.save(detalles);

    return this.pedidosRepo.findOne({
      where: { idPedido: pedidoGuardado.idPedido },
      relations: { detalles: true },
    }) as Promise<Pedido>;
  }

  async findByUsuario(idUsuario: number): Promise<Pedido[]> {
    return this.pedidosRepo.find({
      where: { idUsuario },
      relations: { detalles: true },
      order: { fechaPedido: 'DESC' },
    });
  }

  async findOne(idPedido: number, idUsuario: number): Promise<Pedido> {
    const pedido = await this.pedidosRepo.findOne({
      where: { idPedido, idUsuario },
      relations: { detalles: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }
}
