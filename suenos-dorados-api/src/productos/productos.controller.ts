import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  // Aquí inyectamos el servicio de productos
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
}