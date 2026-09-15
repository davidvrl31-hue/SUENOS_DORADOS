import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateColeccionDto {
  @IsInt()
  idCategoria!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreColeccion!: string;

  @IsOptional()
  @IsString()
  descripcionColeccion?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
