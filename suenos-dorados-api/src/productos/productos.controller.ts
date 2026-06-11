import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll(@Query('idCategoria') idCategoria?: string) {
    if (idCategoria) {
      return this.productosService.findByCategoria(Number(idCategoria));
    }
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() dto: CreateProductoDto) {
    return this.productosService.crear(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  reemplazar(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductoDto) {
    return this.productosService.actualizar(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) {
    return this.productosService.actualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.eliminar(id);
  }
}
