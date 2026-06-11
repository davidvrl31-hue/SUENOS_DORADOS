import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateColoreDto {
  @IsString()
  @MaxLength(60)
  nombreColor!: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  codigoHex?: string | null;
}
