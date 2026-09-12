import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
    private readonly dataSource: DataSource,
  ) {}

  private async populateImages(data: Producto | Producto[]) {
    const prods = Array.isArray(data) ? data : [data];
    if (prods.length === 0) return;

    const ids = prods.map(p => p.idProducto);
    const query = `
      SELECT id_producto, url_imagen
      FROM imagenes_producto
      WHERE es_principal = true AND id_producto IN (${ids.join(',')})
    `;
    try {
      const images = await this.dataSource.query(query);
      const imgMap = new Map<number, string>();
      for (const img of images) {
        imgMap.set(img.id_producto, img.url_imagen);
      }

      for (const p of prods) {
        p.imagenUrl = imgMap.get(p.idProducto) || null;
      }
    } catch (e) {
      // Si la consulta falla o no hay imágenes, poner null
      for (const p of prods) {
        p.imagenUrl = null;
      }
    }
  }

  async findAll(): Promise<Producto[]> {
    const productos = await this.productosRepository.find({ order: { idProducto: 'ASC' } });
    await this.populateImages(productos);
    return productos;
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({ where: { idProducto: id } });
    if (!producto) throw new NotFoundException(`Producto con id ${id} no encontrado`);
    await this.populateImages(producto);
    return producto;
  }

  async findByCategoria(idCategoria: number): Promise<Producto[]> {
    const productos = await this.productosRepository.find({ where: { idCategoria } });
    await this.populateImages(productos);
    return productos;
  }

  async crear(dto: CreateProductoDto): Promise<Producto> {
    const producto = this.productosRepository.create(dto);
    const saved = await this.productosRepository.save(producto);
    await this.populateImages(saved);
    return saved;
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
