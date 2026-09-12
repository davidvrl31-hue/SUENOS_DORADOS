import {
  IsBoolean, IsNotEmpty, IsOptional,
  IsString, MaxLength, Matches,
} from 'class-validator';

export class CreateDireccionDto {
  // ── Destinatario ──────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(160)
  nombreDestinatario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  telefonoContacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  documentoIdentidad?: string;

  // ── Ubicación ─────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(80)
  pais?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcionDepartamento!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcionMunicipio!: string;

  // ── Dirección física ──────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  descripcionDireccion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  complemento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  descripcionBarrio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  indicaciones?: string;

  // ── Preferencias ──────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(30)
  etiqueta?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
