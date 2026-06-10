import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  email: string;
  nombre: string;
  apellido: string;
  idRol: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'fallback_secret',
    });
  }

  validate(payload: JwtPayload) {
    return {
      idUsuario: payload.sub,
      correoElectronico: payload.email,
      nombreUsuario: payload.nombre,
      apellidoUsuario: payload.apellido,
      idRol: payload.idRol,
    };
  }
}
