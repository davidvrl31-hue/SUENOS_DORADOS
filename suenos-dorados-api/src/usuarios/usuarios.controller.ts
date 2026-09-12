import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  // ── Sincronización del Carrito en BD ──
  @Get('carrito')
  getCarrito(@Request() req: { user: { idUsuario: number } }) {
    return this.usuariosService.getCarrito(req.user.idUsuario);
  }

  @Post('carrito')
  guardarCarrito(
    @Request() req: { user: { idUsuario: number } },
    @Body() body: { items: { idVariante: number; quantity: number }[] },
  ) {
    return this.usuariosService.guardarCarrito(req.user.idUsuario, body.items ?? []);
  }

  /** Vacía el carrito — se llama cuando clearCart() tiene 0 ítems */
  @Delete('carrito')
  vaciarCarrito(@Request() req: { user: { idUsuario: number } }) {
    return this.usuariosService.vaciarCarrito(req.user.idUsuario);
  }

  // ── Sincronización de Favoritos en BD ──
  @Get('favoritos')
  getFavoritos(@Request() req: { user: { idUsuario: number } }) {
    return this.usuariosService.getFavoritos(req.user.idUsuario);
  }

  @Post('favoritos')
  guardarFavoritos(
    @Request() req: { user: { idUsuario: number } },
    @Body() body: { ids: number[] },
  ) {
    return this.usuariosService.guardarFavoritos(req.user.idUsuario, body.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string; estado?: boolean },
  ) {
    return this.usuariosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
