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
   * GET /descuentos/validar?codigo=PROMO20&subtotal=150000
   * Endpoint público — el cliente lo llama al ingresar un cupón en el checkout
   */
  @Get('validar')
  validar(
    @Query('codigo') codigo: string,
    @Query('subtotal') subtotal: string,
  ) {
    return this.service.validarCupon(codigo, Number(subtotal) || 0);
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
