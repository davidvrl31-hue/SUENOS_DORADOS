import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoEnvio?: number;
}
