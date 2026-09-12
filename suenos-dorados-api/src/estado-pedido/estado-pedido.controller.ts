import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EstadoPedidoService } from './estado-pedido.service';

@Controller('estado-pedido')
export class EstadoPedidoController {
  constructor(private readonly estadoPedidoService: EstadoPedidoService) {}

  @Get()
  findAll() {
    return this.estadoPedidoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoPedidoService.findOne(id);
  }
}
