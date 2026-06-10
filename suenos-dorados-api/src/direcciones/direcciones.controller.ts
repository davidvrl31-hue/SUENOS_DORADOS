import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('direcciones')
@UseGuards(JwtAuthGuard)
export class DireccionesController {
  constructor(private readonly svc: DireccionesService) {}

  @Get()
  findMis(@Request() req: { user: { idUsuario: number } }) {
    return this.svc.findByUsuario(req.user.idUsuario);
  }

  @Post()
  crear(
    @Request() req: { user: { idUsuario: number } },
    @Body() dto: CreateDireccionDto,
  ) {
    return this.svc.crear(req.user.idUsuario, dto);
  }

  @Delete(':id')
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { idUsuario: number } },
  ) {
    return this.svc.eliminar(id, req.user.idUsuario);
  }
}
