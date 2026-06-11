import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VariantesProductoService } from './variantes-producto.service';
import { CreateVariantesProductoDto } from './dto/create-variantes-producto.dto';
import { UpdateVariantesProductoDto } from './dto/update-variantes-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class AjustarStockDto {
  @IsInt()
  @Type(() => Number)
  delta!: number;
}

@Controller('variantes-producto')
export class VariantesProductoController {
  constructor(private readonly variantesProductoService: VariantesProductoService) {}

  @Get()
  findAll(@Query('idProducto') idProducto?: string) {
    if (idProducto) {
      return this.variantesProductoService.findByProducto(Number(idProducto));
    }
    return this.variantesProductoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantesProductoService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() dto: CreateVariantesProductoDto) {
    return this.variantesProductoService.crear(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  reemplazar(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateVariantesProductoDto) {
    return this.variantesProductoService.actualizar(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVariantesProductoDto) {
    return this.variantesProductoService.actualizar(id, dto);
  }

  // Endpoint especial para ajustar stock: POST /variantes-producto/:id/stock { "delta": 5 } o { "delta": -3 }
  @Post(':id/stock')
  @UseGuards(JwtAuthGuard)
  ajustarStock(@Param('id', ParseIntPipe) id: number, @Body() body: AjustarStockDto) {
    return this.variantesProductoService.ajustarStock(id, body.delta);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.variantesProductoService.eliminar(id);
  }
}
