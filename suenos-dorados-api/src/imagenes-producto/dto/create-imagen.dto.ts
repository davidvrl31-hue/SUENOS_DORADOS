import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImagenDto {
  @Type(() => Number)
  @IsInt()
  idProducto!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idColor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esPrincipal?: boolean;
}
