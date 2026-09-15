import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { TipoMovimiento } from './entities/movimiento-inventario.entity';
import { Type } from 'class-transformer';

class RegistrarMovimientoBody {
  @Type(() => Number) @IsInt() @Min(1)
  idVariante!: number;

  @IsEnum(['ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION'])
  tipo!: TipoMovimiento;

  @Type(() => Number) @IsInt() @Min(1)
  cantidad!: number;

  @IsOptional() @IsString()
  referenciaDocumento?: string;

  @IsOptional() @IsString()
  observacion?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(private readonly service: MovimientosInventarioService) {}

  /** GET /movimientos-inventario — últimos 100 movimientos */
  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.service.findAll(limit ? Number(limit) : 100);
  }

  /** GET /movimientos-inventario/reporte — con nombres de producto */
  @Get('reporte')
  reporte(@Query('limit') limit?: string) {
    return this.service.reporte(limit ? Number(limit) : 200);
  }

  /** GET /movimientos-inventario/variante/:id */
  @Get('variante/:id')
  findByVariante(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByVariante(id);
  }

  /** POST /movimientos-inventario — registrar movimiento manual */
  @Post()
  registrar(@Body() dto: RegistrarMovimientoBody) {
    return this.service.registrar(dto);
  }
}
