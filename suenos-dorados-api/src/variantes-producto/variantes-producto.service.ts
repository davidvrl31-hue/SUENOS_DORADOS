import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { VariantesProducto } from './entities/variantes-producto.entity';
import { CreateVariantesProductoDto } from './dto/create-variantes-producto.dto';
import { UpdateVariantesProductoDto } from './dto/update-variantes-producto.dto';
import { NotFoundException } from '@nestjs/common';
import { MovimientosInventarioService } from '../movimientos-inventario/movimientos-inventario.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class VariantesProductoService {
  constructor(
    @InjectRepository(VariantesProducto)
    private readonly variantesRepository: Repository<VariantesProducto>,
    private readonly movimientosService: MovimientosInventarioService,
    private readonly eventsGateway: EventsGateway,
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

  async ajustarStock(
    id: number,
    delta: number,
    referencia?: string,
    observacion?: string,
  ): Promise<VariantesProducto> {
    const variante    = await this.findOne(id);
    const stockNuevo  = variante.stock + delta;

    if (stockNuevo < 0)
      throw new BadRequestException(`Stock insuficiente. Stock actual: ${variante.stock}`);

    await this.variantesRepository.update(id, { stock: stockNuevo });

    // Registrar movimiento de inventario automáticamente
    const tipo = delta > 0 ? 'ENTRADA' : delta < 0 ? 'SALIDA' : 'AJUSTE';
    await this.movimientosService.registrar({
      idVariante:          id,
      tipo,
      cantidad:            Math.abs(delta),
      referenciaDocumento: referencia ?? (tipo === 'ENTRADA' ? 'AJUSTE-ADMIN' : 'AJUSTE-ADMIN'),
      observacion:         observacion ?? `Ajuste manual de stock (${delta > 0 ? '+' : ''}${delta})`,
    });

    // Emitir evento WebSocket a Web y Móvil
    const actualizada = await this.findOne(id);
    this.eventsGateway.emitVarianteStock({
      idVariante: id,
      idProducto: actualizada.idProducto,
      stockNuevo,
      sku:        actualizada.sku,
    });

    return actualizada;
  }

  async eliminar(id: number): Promise<VariantesProducto> {
    const variante = await this.findOne(id);
    await this.variantesRepository.delete(id);
    return variante;
  }
}
