import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { CreateColoreDto } from './dto/create-colore.dto';
import { UpdateColoreDto } from './dto/update-colore.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('colores')
export class ColoresController {
  constructor(private readonly coloresService: ColoresService) {}

  @Get()
  findAll() {
    return this.coloresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() dto: CreateColoreDto) {
    return this.coloresService.crear(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  reemplazar(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateColoreDto) {
    return this.coloresService.actualizar(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateColoreDto) {
    return this.coloresService.actualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.eliminar(id);
  }
}
