import { IsString, IsInt, IsBoolean, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateVariantesProductoDto {
  @IsInt()
  idProducto!: number;

  @IsInt()
  idMedida!: number;

  @IsInt()
  idColor!: number;

  @IsString()
  @MaxLength(60)
  sku!: string;

  @IsNumber()
  precio!: number;

  @IsString()
  @MaxLength(100)
  referencia!: string;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
