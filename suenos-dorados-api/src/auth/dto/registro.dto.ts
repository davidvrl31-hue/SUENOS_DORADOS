import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Dirección inicial que el usuario puede incluir al registrarse.
 * Todos los campos son opcionales a nivel del DTO padre, pero si se
 * incluye el objeto, departamento, municipio y dirección son obligatorios.
 */
export class DireccionRegistroDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  pais?: string;

  @IsString()
  @IsNotEmpty({ message: 'El departamento es obligatorio' })
  @MaxLength(100)
  descripcionDepartamento!: string;

  @IsString()
  @IsNotEmpty({ message: 'El municipio/ciudad es obligatorio' })
  @MaxLength(100)
  descripcionMunicipio!: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(200)
  descripcionDireccion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  complemento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  descripcionBarrio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  indicaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  etiqueta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  telefonoContacto?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}

export class RegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80)
  nombreUsuario!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(80)
  apellidoUsuario!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correoElectronico!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  /** Dirección de envío inicial — se guarda automáticamente como dirección principal */
  @IsOptional()
  @ValidateNested()
  @Type(() => DireccionRegistroDto)
  direccion?: DireccionRegistroDto;
}
