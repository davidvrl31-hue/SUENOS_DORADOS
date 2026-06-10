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
    // Si la nueva es principal, quitar principal a las demás
    if (dto.esPrincipal) {
      await this.repo.update({ idUsuario }, { esPrincipal: false });
    }
    const dir = this.repo.create({ ...dto, idUsuario, esPrincipal: dto.esPrincipal ?? false });
    return this.repo.save(dir);
  }

  async eliminar(idDireccion: number, idUsuario: number): Promise<void> {
    const dir = await this.repo.findOne({ where: { idDireccion, idUsuario } });
    if (!dir) throw new NotFoundException('Dirección no encontrada');
    await this.repo.remove(dir);
  }

  async getPrincipal(idUsuario: number): Promise<Direccion | null> {
    return this.repo.findOne({ where: { idUsuario, esPrincipal: true } })
      ?? this.repo.findOne({ where: { idUsuario } });
  }
}
