import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  crear(
    @Request() req: { user: { idUsuario: number } },
    @Body() dto: CreatePedidoDto,
  ) {
    return this.pedidosService.crear(req.user.idUsuario, dto);
  }

  @Get()
  findMisPedidos(@Request() req: { user: { idUsuario: number } }) {
    return this.pedidosService.findByUsuario(req.user.idUsuario);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { idUsuario: number } },
  ) {
    return this.pedidosService.findOne(id, req.user.idUsuario);
  }
}
