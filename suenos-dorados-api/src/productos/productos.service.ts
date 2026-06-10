import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>, // Inyectamos el repositorio de Postgres
  ) {}

  // Este método traerá la lista completa de productos para Next.js, Expo o Python
  async findAll(): Promise<Producto[]> {
    return await this.productosRepository.find();
  }

  // Buscar un producto por su ID
  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({ where: { idProducto: id } });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return producto;
  }

  // Buscar productos por categoría
  async findByCategoria(idCategoria: number): Promise<Producto[]> {
    return await this.productosRepository.find({ where: { idCategoria } });
  }
}