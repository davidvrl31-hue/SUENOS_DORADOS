import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoPedido } from './entities/estado-pedido.entity';

@Injectable()
export class EstadoPedidoService {
  constructor(
    @InjectRepository(EstadoPedido)
    private readonly estadoPedidoRepo: Repository<EstadoPedido>,
  ) {}

  async findAll(): Promise<EstadoPedido[]> {
    return this.estadoPedidoRepo.find({
      order: { idEstadoPedido: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoPedido> {
    const estado = await this.estadoPedidoRepo.findOneBy({ idEstadoPedido: id });
    if (!estado) throw new NotFoundException(`Estado de pedido #${id} no encontrado`);
    return estado;
  }
}
