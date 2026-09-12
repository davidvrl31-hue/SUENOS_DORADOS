import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nombreUsuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  apellidoUsuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}
