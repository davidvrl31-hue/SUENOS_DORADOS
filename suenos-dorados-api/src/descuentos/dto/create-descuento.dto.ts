import {
  IsBoolean, IsDateString, IsInt, IsNotEmpty,
  IsNumber, IsOptional, IsString, IsUppercase,
  Max, MaxLength, Min,
} from 'class-validator';

export class CreateDescuentoDto {
  @IsOptional()
  @IsInt()
  idProducto?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @IsUppercase()
  codigo!: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  porcentajeDescuento!: number;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
