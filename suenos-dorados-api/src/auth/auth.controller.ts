import { Controller, Post, Get, Patch, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Request() req: { user: { idUsuario: number } }) {
    return this.authService.perfil(req.user.idUsuario);
  }

  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  actualizarPerfil(
    @Request() req: { user: { idUsuario: number } },
    @Body() body: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string },
  ) {
    return this.authService.actualizarPerfil(req.user.idUsuario, body);
  }
}
