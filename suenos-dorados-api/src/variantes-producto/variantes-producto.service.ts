import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariantesProducto } from './entities/variantes-producto.entity';

@Injectable()
export class VariantesProductoService {
  constructor(
    @InjectRepository(VariantesProducto)
    private readonly variantesRepository: Repository<VariantesProducto>,
  ) {}

  async findAll(): Promise<VariantesProducto[]> {
    return await this.variantesRepository.find();
  }

  // Filtrar variantes por producto
  async findByProducto(idProducto: number): Promise<VariantesProducto[]> {
    return await this.variantesRepository.find({ where: { idProducto } });
  }
}