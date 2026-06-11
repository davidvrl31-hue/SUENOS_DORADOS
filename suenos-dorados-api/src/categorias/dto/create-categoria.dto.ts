import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MaxLength(80)
  nombreCategoria!: string;

  @IsString()
  @IsOptional()
  descripcionCategoria?: string | null;

  @IsString()
  @MaxLength(100)
  slug!: string;
}
