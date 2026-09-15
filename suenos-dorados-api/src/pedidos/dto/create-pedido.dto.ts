import {
  IsArray, IsNumber, IsOptional, IsString,
  ValidateNested, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleItemDto {
  @IsNumber()
  idVariante!: number;

  @IsNumber()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}

export class CreatePedidoDto {
  @IsNumber()
  idDireccion!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleItemDto)
  items!: DetalleItemDto[];

  /** Monto fijo de descuento ya calculado (se ignora si viene codigoCupon) */
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoEnvio?: number;

  /** Código de cupón — si viene, se valida y se calcula el descuento automáticamente */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  codigoCupon?: string;
}
