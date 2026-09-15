import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EnvioService } from './envio.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('envio')
export class EnvioController {
  constructor(private readonly service: EnvioService) {}

  /** GET /envio — listar todos (admin) */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** GET /envio/pedido/:idPedido — envío de un pedido */
  @Get('pedido/:idPedido')
  findByPedido(@Param('idPedido', ParseIntPipe) idPedido: number) {
    return this.service.findByPedido(idPedido);
  }

  /** GET /envio/pedido/:idPedido/detalle — detalle completo con usuario y dirección */
  @Get('pedido/:idPedido/detalle')
  detalleCompleto(@Param('idPedido', ParseIntPipe) idPedido: number) {
    return this.service.detalleCompleto(idPedido);
  }

  /** GET /envio/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** POST /envio — registrar despacho (admin) */
  @Post()
  crear(@Body() dto: CreateEnvioDto) {
    return this.service.crear(dto);
  }

  /** PATCH /envio/:id — actualizar guía, estado, fechas (admin) */
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEnvioDto) {
    return this.service.actualizar(id, dto);
  }
}
