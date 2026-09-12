import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoEnvio } from './entities/estado-envio.entity';

@Injectable()
export class EstadoEnvioService {
  constructor(
    @InjectRepository(EstadoEnvio)
    private readonly estadoEnvioRepo: Repository<EstadoEnvio>,
  ) {}

  async findAll(): Promise<EstadoEnvio[]> {
    return this.estadoEnvioRepo.find({
      order: { idEstadoEnvio: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoEnvio> {
    const estado = await this.estadoEnvioRepo.findOneBy({ idEstadoEnvio: id });
    if (!estado) throw new NotFoundException(`Estado de envío #${id} no encontrado`);
    return estado;
  }
}
