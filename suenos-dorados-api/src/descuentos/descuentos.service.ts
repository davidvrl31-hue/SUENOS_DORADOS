import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Descuento } from './entities/descuento.entity';
import { CreateDescuentoDto } from './dto/create-descuento.dto';
import { UpdateDescuentoDto } from './dto/update-descuento.dto';

@Injectable()
export class DescuentosService {
  constructor(
    @InjectRepository(Descuento)
    private readonly repo: Repository<Descuento>,
  ) {}

  findAll(): Promise<Descuento[]> {
    return this.repo.find({ order: { fechaFin: 'DESC' } });
  }

  async findOne(id: number): Promise<Descuento> {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Descuento ${id} no encontrado`);
    return d;
  }

  async crear(dto: CreateDescuentoDto): Promise<Descuento> {
    const existe = await this.repo.findOne({ where: { codigo: dto.codigo.toUpperCase() } });
    if (existe) throw new ConflictException(`El código ${dto.codigo} ya existe`);

    if (dto.fechaFin < dto.fechaInicio) {
      throw new BadRequestException('La fecha fin debe ser posterior a la fecha inicio');
    }

    const desc = this.repo.create({
      ...dto,
      codigo: dto.codigo.toUpperCase(),
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(desc);
  }

  async actualizar(id: number, dto: UpdateDescuentoDto): Promise<Descuento> {
    const desc = await this.findOne(id);
    if (dto.fechaInicio && dto.fechaFin && dto.fechaFin < dto.fechaInicio) {
      throw new BadRequestException('La fecha fin debe ser posterior a la fecha inicio');
    }
    Object.assign(desc, dto);
    return this.repo.save(desc);
  }

  async eliminar(id: number): Promise<void> {
    const desc = await this.findOne(id);
    await this.repo.remove(desc);
  }

  /**
   * Retorna el descuento activo y vigente para un producto específico, si existe.
   * Usado por web y móvil para mostrar el precio con descuento en las tarjetas.
   */
  async findActivoByProducto(idProducto: number): Promise<{
    tieneDescuento: boolean;
    porcentaje: number;
    codigo: string;
  } | null> {
    const hoy = new Date().toISOString().split('T')[0];
    const desc = await this.repo.findOne({
      where: {
        idProducto,
        isActive: true,
      },
    });

    if (!desc) return null;
    if (hoy < desc.fechaInicio || hoy > desc.fechaFin) return null;

    return {
      tieneDescuento: true,
      porcentaje: Number(desc.porcentajeDescuento),
      codigo: desc.codigo,
    };
  }

  /**
   * Valida un cupón y retorna el monto de descuento.
   * Si el cupón tiene id_producto, valida que al menos uno de los ítems
   * del carrito sea de ese producto.
   * Usado en el checkout para aplicar el descuento al subtotal.
   */
  async validarCupon(
    codigo: string,
    subtotal: number,
    idProductos?: number[],
  ): Promise<{
    valido: boolean;
    porcentaje: number;
    montoDescuento: number;
    mensaje: string;
    descuento?: Descuento;
  }> {
    const hoy = new Date().toISOString().split('T')[0];
    const desc = await this.repo.findOne({
      where: { codigo: codigo.toUpperCase() },
    });

    if (!desc) {
      return { valido: false, porcentaje: 0, montoDescuento: 0, mensaje: 'Cupón no encontrado' };
    }
    if (!desc.isActive) {
      return { valido: false, porcentaje: 0, montoDescuento: 0, mensaje: 'Cupón inactivo' };
    }
    if (hoy < desc.fechaInicio) {
      return { valido: false, porcentaje: 0, montoDescuento: 0, mensaje: 'El cupón aún no está vigente' };
    }
    if (hoy > desc.fechaFin) {
      return { valido: false, porcentaje: 0, montoDescuento: 0, mensaje: 'El cupón ha expirado' };
    }

    // ── Validar que el cupón aplique al producto si es específico ─────────────
    if (desc.idProducto !== null && desc.idProducto !== undefined) {
      const productosCarrito = idProductos ?? [];
      if (!productosCarrito.includes(desc.idProducto)) {
        return {
          valido: false,
          porcentaje: 0,
          montoDescuento: 0,
          mensaje: 'Este cupón no aplica para los productos de tu carrito',
        };
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    const porcentaje     = Number(desc.porcentajeDescuento);
    const montoDescuento = Math.round((subtotal * porcentaje) / 100);

    return {
      valido: true,
      porcentaje,
      montoDescuento,
      mensaje: `Cupón válido — ${porcentaje}% de descuento`,
      descuento: desc,
    };
  }
}
