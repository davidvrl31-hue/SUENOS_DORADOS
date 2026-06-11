import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medida } from './entities/medida.entity';
import { CreateMedidaDto } from './dto/create-medida.dto';
import { UpdateMedidaDto } from './dto/update-medida.dto';

@Injectable()
export class MedidasService {
  constructor(
    @InjectRepository(Medida)
    private readonly medidasRepository: Repository<Medida>,
  ) {}

  async findAll(): Promise<Medida[]> {
    return this.medidasRepository.find({ order: { idMedida: 'ASC' } });
  }

  async findOne(id: number): Promise<Medida> {
    const medida = await this.medidasRepository.findOne({ where: { idMedida: id } });
    if (!medida) throw new NotFoundException(`Medida ${id} no encontrada`);
    return medida;
  }

  async crear(dto: CreateMedidaDto): Promise<Medida> {
    const medida = this.medidasRepository.create(dto);
    return this.medidasRepository.save(medida);
  }

  async actualizar(id: number, dto: UpdateMedidaDto): Promise<Medida> {
    await this.findOne(id);
    await this.medidasRepository.update(id, dto);
    return this.findOne(id);
  }

  async eliminar(id: number): Promise<Medida> {
    const medida = await this.findOne(id);
    await this.medidasRepository.delete(id);
    return medida;
  }
}
