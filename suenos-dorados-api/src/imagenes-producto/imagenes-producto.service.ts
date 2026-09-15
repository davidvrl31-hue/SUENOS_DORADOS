import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagenProducto } from './entities/imagen-producto.entity';
import { CreateImagenDto } from './dto/create-imagen.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagenesProductoService {
  constructor(
    @InjectRepository(ImagenProducto)
    private readonly repo: Repository<ImagenProducto>,
  ) {}

  findByProducto(idProducto: number): Promise<ImagenProducto[]> {
    return this.repo.find({
      where: { idProducto },
      order: { esPrincipal: 'DESC', orden: 'ASC' },
    });
  }

  async crear(
    dto: CreateImagenDto,
    urlImagen: string,
  ): Promise<ImagenProducto> {
    // Si se marca como principal, quitarle el flag a las demás del producto
    if (dto.esPrincipal) {
      await this.repo.update({ idProducto: dto.idProducto }, { esPrincipal: false });
    }

    // Si es la primera imagen del producto, es principal automáticamente
    const existentes = await this.repo.count({ where: { idProducto: dto.idProducto } });
    const esPrincipal = dto.esPrincipal ?? existentes === 0;

    const imagen = this.repo.create({
      idProducto: dto.idProducto,
      idColor: dto.idColor ?? null,
      urlImagen,
      orden: dto.orden ?? existentes + 1,
      esPrincipal,
    });
    return this.repo.save(imagen);
  }

  async marcarPrincipal(idImagen: number): Promise<ImagenProducto> {
    const imagen = await this.repo.findOne({ where: { idImagen } });
    if (!imagen) throw new NotFoundException(`Imagen ${idImagen} no encontrada`);

    // Quitar principal a las demás del mismo producto
    await this.repo.update({ idProducto: imagen.idProducto }, { esPrincipal: false });
    imagen.esPrincipal = true;
    return this.repo.save(imagen);
  }

  async eliminar(idImagen: number, apiBaseUrl: string): Promise<void> {
    const imagen = await this.repo.findOne({ where: { idImagen } });
    if (!imagen) throw new NotFoundException(`Imagen ${idImagen} no encontrada`);

    // Intentar borrar el archivo físico del servidor
    try {
      const relPath = imagen.urlImagen.replace(apiBaseUrl, '');
      const filePath = path.join(process.cwd(), relPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {
      // Si falla el borrado físico, igual eliminamos el registro
    }

    await this.repo.remove(imagen);

    // Si era principal, promover la siguiente
    const resto = await this.repo.find({
      where: { idProducto: imagen.idProducto },
      order: { orden: 'ASC' },
    });
    if (resto.length > 0 && !resto.some(i => i.esPrincipal)) {
      resto[0].esPrincipal = true;
      await this.repo.save(resto[0]);
    }
  }
}
