import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariantesProducto } from './entities/variantes-producto.entity';
import { CreateVariantesProductoDto } from './dto/create-variantes-producto.dto';
import { UpdateVariantesProductoDto } from './dto/update-variantes-producto.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class VariantesProductoService {
  constructor(
    @InjectRepository(VariantesProducto)
    private readonly variantesRepository: Repository<VariantesProducto>,
  ) {}

  async findAll(): Promise<VariantesProducto[]> {
    return this.variantesRepository.find({ order: { idVariante: 'ASC' } });
  }

  async findByProducto(idProducto: number): Promise<VariantesProducto[]> {
    return this.variantesRepository.find({ where: { idProducto } });
  }

  async findOne(id: number): Promise<VariantesProducto> {
    const v = await this.variantesRepository.findOne({ where: { idVariante: id } });
    if (!v) throw new NotFoundException(`Variante ${id} no encontrada`);
    return v;
  }

  async crear(dto: CreateVariantesProductoDto): Promise<VariantesProducto> {
    const variante = this.variantesRepository.create({
      ...dto,
      stock: dto.stock ?? 0,
      estado: dto.estado ?? true,
    });
    return this.variantesRepository.save(variante);
  }

  async actualizar(id: number, dto: UpdateVariantesProductoDto): Promise<VariantesProducto> {
    await this.findOne(id);
    await this.variantesRepository.update(id, dto);
    return this.findOne(id);
  }

  async ajustarStock(id: number, delta: number): Promise<VariantesProducto> {
    const variante = await this.findOne(id);
    const nuevoStock = variante.stock + delta;
    if (nuevoStock < 0)
      throw new BadRequestException(`Stock insuficiente. Stock actual: ${variante.stock}`);
    await this.variantesRepository.update(id, { stock: nuevoStock });
    return this.findOne(id);
  }

  async eliminar(id: number): Promise<VariantesProducto> {
    const variante = await this.findOne(id);
    await this.variantesRepository.delete(id);
    return variante;
  }
}
