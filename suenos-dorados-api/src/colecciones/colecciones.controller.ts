import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ColeccionesService } from './colecciones.service';
import { CreateColeccionDto } from './dto/create-coleccion.dto';
import { UpdateColeccionDto } from './dto/update-coleccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('colecciones')
export class ColeccionesController {
  constructor(private readonly service: ColeccionesService) {}

  /** GET /colecciones — todas o filtradas por categoría */
  @Get()
  findAll(@Query('idCategoria') idCategoria?: string) {
    if (idCategoria) return this.service.findByCategoria(Number(idCategoria));
    return this.service.findAll();
  }

  /** GET /colecciones/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** POST /colecciones — solo admin */
  @UseGuards(JwtAuthGuard)
  @Post()
  crear(@Body() dto: CreateColeccionDto) {
    return this.service.crear(dto);
  }

  /** PATCH /colecciones/:id — solo admin */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateColeccionDto) {
    return this.service.actualizar(id, dto);
  }

  /** DELETE /colecciones/:id — solo admin */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
