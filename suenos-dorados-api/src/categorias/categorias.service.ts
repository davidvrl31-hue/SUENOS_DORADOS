import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriasRepository.find({ order: { idCategoria: 'ASC' } });
  }

  async findOne(id: number): Promise<Categoria> {
    const cat = await this.categoriasRepository.findOne({ where: { idCategoria: id } });
    if (!cat) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return cat;
  }

  async crear(dto: CreateCategoriaDto): Promise<Categoria> {
    const cat = this.categoriasRepository.create(dto);
    return this.categoriasRepository.save(cat);
  }

  async actualizar(id: number, dto: UpdateCategoriaDto): Promise<Categoria> {
    await this.findOne(id);
    await this.categoriasRepository.update(id, dto);
    return this.findOne(id);
  }

  async eliminar(id: number): Promise<Categoria> {
    const cat = await this.findOne(id);
    await this.categoriasRepository.delete(id);
    return cat;
  }
}
