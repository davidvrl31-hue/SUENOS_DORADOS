import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MedidasService } from './medidas.service';
import { CreateMedidaDto } from './dto/create-medida.dto';
import { UpdateMedidaDto } from './dto/update-medida.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('medidas')
export class MedidasController {
  constructor(private readonly medidasService: MedidasService) {}

  @Get()
  findAll() {
    return this.medidasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() dto: CreateMedidaDto) {
    return this.medidasService.crear(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  reemplazar(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateMedidaDto) {
    return this.medidasService.actualizar(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedidaDto) {
    return this.medidasService.actualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.medidasService.eliminar(id);
  }
}
