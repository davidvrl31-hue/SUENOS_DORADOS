import {
  Body, Controller, Delete, Get, Param,
  ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { DescuentosService } from './descuentos.service';
import { CreateDescuentoDto } from './dto/create-descuento.dto';
import { UpdateDescuentoDto } from './dto/update-descuento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('descuentos')
export class DescuentosController {
  constructor(private readonly service: DescuentosService) {}

  /** GET /descuentos — listar todos (admin) */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * GET /descuentos/validar?codigo=PROMO20&subtotal=150000&idProductos=1,2,3
   * Endpoint público — el cliente lo llama al ingresar un cupón en el checkout.
   * idProductos: lista separada por comas de los idProducto del carrito.
   */
  @Get('validar')
  validar(
    @Query('codigo') codigo: string,
    @Query('subtotal') subtotal: string,
    @Query('idProductos') idProductos?: string,
  ) {
    const productos = idProductos
      ? idProductos.split(',').map(Number).filter((n) => !isNaN(n))
      : undefined;
    return this.service.validarCupon(codigo, Number(subtotal) || 0, productos);
  }

  /**
   * GET /descuentos/producto/:idProducto
   * Endpoint público — retorna el descuento activo y vigente de un producto.
   * Usado por web y móvil para mostrar el precio con descuento.
   */
  @Get('producto/:idProducto')
  findActivoByProducto(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.service.findActivoByProducto(idProducto);
  }

  /** GET /descuentos/:id */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** POST /descuentos — crear cupón (admin) */
  @UseGuards(JwtAuthGuard)
  @Post()
  crear(@Body() dto: CreateDescuentoDto) {
    return this.service.crear(dto);
  }

  /** PATCH /descuentos/:id — editar cupón (admin) */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDescuentoDto) {
    return this.service.actualizar(id, dto);
  }

  /** DELETE /descuentos/:id — eliminar cupón (admin) */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
