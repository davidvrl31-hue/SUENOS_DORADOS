import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepo.findOne({
      where: { correoElectronico: dto.correoElectronico },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.estado) {
      throw new UnauthorizedException('Usuario inactivo, contacta al soporte');
    }

    const passwordOk = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.generarToken(usuario);
  }

  async registro(dto: RegistroDto) {
    // Verificar si ya existe el correo
    const existe = await this.usuariosRepo.findOne({
      where: { correoElectronico: dto.correoElectronico },
    });
    if (existe) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const hash = await bcrypt.hash(dto.contrasena, 10);

    const nuevoUsuario = this.usuariosRepo.create({
      nombreUsuario: dto.nombreUsuario,
      apellidoUsuario: dto.apellidoUsuario,
      correoElectronico: dto.correoElectronico,
      contrasenaHash: hash,
      telefono: dto.telefono ?? null,
      idRol: 2, // rol cliente por defecto
      estado: true,
    });

    const guardado = await this.usuariosRepo.save(nuevoUsuario);
    return this.generarToken(guardado);
  }

  private generarToken(usuario: Usuario) {
    const payload: JwtPayload = {
      sub: usuario.idUsuario,
      email: usuario.correoElectronico,
      nombre: usuario.nombreUsuario,
      apellido: usuario.apellidoUsuario,
      idRol: usuario.idRol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        apellidoUsuario: usuario.apellidoUsuario,
        correoElectronico: usuario.correoElectronico,
        telefono: usuario.telefono,
        idRol: usuario.idRol,
      },
    };
  }

  async perfil(idUsuario: number) {
    const usuario = await this.usuariosRepo.findOne({
      where: { idUsuario },
    });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    // Nunca devolver la contraseña
    const { contrasenaHash: _, ...perfil } = usuario;
    return perfil;
  }

  async actualizarPerfil(
    idUsuario: number,
    datos: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string },
  ) {
    await this.usuariosRepo.update(idUsuario, datos);
    return this.perfil(idUsuario);
  }
}
