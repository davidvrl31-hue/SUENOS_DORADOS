import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coleccion } from './entities/coleccion.entity';
import { CreateColeccionDto } from './dto/create-coleccion.dto';
import { UpdateColeccionDto } from './dto/update-coleccion.dto';

@Injectable()
export class ColeccionesService {
  constructor(
    @InjectRepository(Coleccion)
    private readonly repo: Repository<Coleccion>,
  ) {}

  findAll(): Promise<Coleccion[]> {
    return this.repo.find({ order: { nombreColeccion: 'ASC' } });
  }

  findByCategoria(idCategoria: number): Promise<Coleccion[]> {
    return this.repo.find({
      where: { idCategoria },
      order: { nombreColeccion: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Coleccion> {
    const col = await this.repo.findOne({ where: { idColeccion: id } });
    if (!col) throw new NotFoundException(`Colección ${id} no encontrada`);
    return col;
  }

  async crear(dto: CreateColeccionDto): Promise<Coleccion> {
    const col = this.repo.create({ ...dto, estado: dto.estado ?? true });
    return this.repo.save(col);
  }

  async actualizar(id: number, dto: UpdateColeccionDto): Promise<Coleccion> {
    const col = await this.findOne(id);
    Object.assign(col, dto);
    return this.repo.save(col);
  }

  async eliminar(id: number): Promise<void> {
    const col = await this.findOne(id);
    await this.repo.remove(col);
  }
}
