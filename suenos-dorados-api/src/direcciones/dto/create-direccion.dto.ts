import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDireccionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  descripcionDireccion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  descripcionBarrio?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcionMunicipio!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcionDepartamento!: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
