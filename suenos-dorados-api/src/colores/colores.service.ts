import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entities/colore.entity';
import { CreateColoreDto } from './dto/create-colore.dto';
import { UpdateColoreDto } from './dto/update-colore.dto';

@Injectable()
export class ColoresService {
  constructor(
    @InjectRepository(Color)
    private readonly coloresRepository: Repository<Color>,
  ) {}

  async findAll(): Promise<Color[]> {
    return this.coloresRepository.find({ order: { idColor: 'ASC' } });
  }

  async findOne(id: number): Promise<Color> {
    const color = await this.coloresRepository.findOne({ where: { idColor: id } });
    if (!color) throw new NotFoundException(`Color ${id} no encontrado`);
    return color;
  }

  async crear(dto: CreateColoreDto): Promise<Color> {
    const color = this.coloresRepository.create({
      nombreColor: dto.nombreColor,
      codigoHex: dto.codigoHex ?? undefined,
    });
    return this.coloresRepository.save(color);
  }

  async actualizar(id: number, dto: UpdateColoreDto): Promise<Color> {
    await this.findOne(id);
    await this.coloresRepository.update(id, {
      nombreColor: dto.nombreColor,
      codigoHex: dto.codigoHex ?? undefined,
    });
    return this.findOne(id);
  }

  async eliminar(id: number): Promise<Color> {
    const color = await this.findOne(id);
    await this.coloresRepository.delete(id);
    return color;
  }
}
