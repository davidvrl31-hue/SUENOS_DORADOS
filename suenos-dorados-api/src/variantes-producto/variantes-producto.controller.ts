import { Controller, Get, Query } from '@nestjs/common';
import { VariantesProductoService } from './variantes-producto.service';

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
}