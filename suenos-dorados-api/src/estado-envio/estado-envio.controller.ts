import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EstadoEnvioService } from './estado-envio.service';

@Controller('estado-envio')
export class EstadoEnvioController {
  constructor(private readonly estadoEnvioService: EstadoEnvioService) {}

  @Get()
  findAll() {
    return this.estadoEnvioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoEnvioService.findOne(id);
  }
}
