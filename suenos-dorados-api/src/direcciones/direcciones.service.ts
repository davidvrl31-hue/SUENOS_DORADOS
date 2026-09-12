import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direccion } from './entities/direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';

@Injectable()
export class DireccionesService {
  constructor(
    @InjectRepository(Direccion)
    private readonly repo: Repository<Direccion>,
  ) {}

  async findByUsuario(idUsuario: number): Promise<Direccion[]> {
    return this.repo.find({ where: { idUsuario }, order: { esPrincipal: 'DESC' } });
  }

  async crear(idUsuario: number, dto: CreateDireccionDto): Promise<Direccion> {
    // Si no hay ninguna dirección del usuario, la primera es principal automáticamente
    const existentes = await this.repo.count({ where: { idUsuario } });
    const esPrincipal = dto.esPrincipal ?? existentes === 0;

    if (esPrincipal) {
      await this.repo.update({ idUsuario }, { esPrincipal: false });
    }

    const dir = this.repo.create({
      ...dto,
      idUsuario,
      pais: dto.pais ?? 'Colombia',
      etiqueta: dto.etiqueta ?? 'Casa',
      esPrincipal,
    });
    return this.repo.save(dir);
  }

  async actualizar(
    idDireccion: number,
    idUsuario: number,
    dto: Partial<CreateDireccionDto>,
  ): Promise<Direccion> {
    const dir = await this.repo.findOne({ where: { idDireccion, idUsuario } });
    if (!dir) throw new NotFoundException('Dirección no encontrada');

    // Si se marca como principal, quitar principal a las demás
    if (dto.esPrincipal) {
      await this.repo.update({ idUsuario }, { esPrincipal: false });
    }

    Object.assign(dir, dto);
    return this.repo.save(dir);
  }

  async eliminar(idDireccion: number, idUsuario: number): Promise<void> {
    const dir = await this.repo.findOne({ where: { idDireccion, idUsuario } });
    if (!dir) throw new NotFoundException('Dirección no encontrada');
    await this.repo.remove(dir);
  }

  async getPrincipal(idUsuario: number): Promise<Direccion | null> {
    return (
      (await this.repo.findOne({ where: { idUsuario, esPrincipal: true } })) ??
      (await this.repo.findOne({ where: { idUsuario } }))
    );
  }
}
