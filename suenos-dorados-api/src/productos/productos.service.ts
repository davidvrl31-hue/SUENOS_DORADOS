import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({ order: { idProducto: 'ASC' } });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({ where: { idProducto: id } });
    if (!producto) throw new NotFoundException(`Producto con id ${id} no encontrado`);
    return producto;
  }

  async findByCategoria(idCategoria: number): Promise<Producto[]> {
    return this.productosRepository.find({ where: { idCategoria } });
  }

  async crear(dto: CreateProductoDto): Promise<Producto> {
    const producto = this.productosRepository.create(dto);
    return this.productosRepository.save(producto);
  }

  async actualizar(id: number, dto: UpdateProductoDto): Promise<Producto> {
    await this.findOne(id);
    await this.productosRepository.update(id, dto);
    return this.findOne(id);
  }

  async eliminar(id: number): Promise<Producto> {
    const producto = await this.findOne(id);
    await this.productosRepository.delete(id);
    return producto;
  }
}
