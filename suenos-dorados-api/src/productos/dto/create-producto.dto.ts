import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';

export class CreateProductoDto {
  @IsInt()
  idCategoria!: number;

  @IsInt()
  @IsOptional()
  idColeccion?: number | null;

  @IsString()
  @MaxLength(150)
  nombreProducto!: string;

  @IsString()
  @IsOptional()
  descripcionProducto?: string | null;

  @IsString()
  @MaxLength(180)
  slug!: string;

  @IsBoolean()
  estadoProducto!: boolean;
}
