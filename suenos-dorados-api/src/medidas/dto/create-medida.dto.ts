import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateMedidaDto {
  @IsString()
  @MaxLength(50)
  nombreMedida!: string;

  @IsNumber()
  @IsOptional()
  anchoCm?: number | null;

  @IsNumber()
  @IsOptional()
  largoCm?: number | null;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  descripcion?: string | null;
}
