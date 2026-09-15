import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateEnvioDto {
  @IsInt()
  @Min(1)
  idPedido!: number;

  @IsInt()
  @Min(1)
  idEstadoEnvio!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroGuia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  transportadora?: string;

  @IsOptional()
  @IsDateString()
  fechaEnvio?: string;

  @IsOptional()
  @IsDateString()
  fechaEntregaEstimada?: string;

  @IsOptional()
  @IsDateString()
  fechaEntregaReal?: string;
}
