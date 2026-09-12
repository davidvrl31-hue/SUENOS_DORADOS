import {
  IsEmail,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Método de pago que elige el cliente ──────────────────────────────────────
export enum MetodoPagoBold {
  TARJETA   = 'CREDIT_CARD',
  PSE       = 'PSE',
  NEQUI     = 'NEQUI',
  BANCOLOMBIA = 'BOTON_BANCOLOMBIA',
}

// ─── Ítem del pedido ──────────────────────────────────────────────────────────
export class ItemPedidoDto {
  @IsNumber()
  idVariante!: number;

  @IsNumber()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}

// ─── DTO principal para iniciar un pago ───────────────────────────────────────
export class CrearPagoDto {
  /** ID del pedido ya creado en la BD — se usa como reference_id en Bold */
  @IsNumber()
  idPedido!: number;

  /** Monto total en pesos COP (entero, sin decimales) */
  @IsNumber()
  @Min(1000)
  totalCOP!: number;

  /** Descripción que verá el comprador en la pasarela */
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  /** Correo del comprador */
  @IsEmail()
  correoComprador!: string;

  /** Nombre completo del comprador */
  @IsString()
  @IsNotEmpty()
  nombreComprador!: string;

  /** Teléfono (10 dígitos, sin +57) */
  @IsString()
  @IsNotEmpty()
  telefonoComprador!: string;

  /** Método de pago elegido por el cliente */
  @IsEnum(MetodoPagoBold)
  metodoPago!: MetodoPagoBold;

  // ── Solo para PSE ──────────────────────────────────────────────────────────
  /** Código del banco (requerido para PSE) */
  @IsOptional()
  @IsString()
  codigoBancoPSE?: string;

  /** Nombre del banco (requerido para PSE) */
  @IsOptional()
  @IsString()
  nombreBancoPSE?: string;

  // ── Solo para tarjeta ──────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  numeroTarjeta?: string;

  @IsOptional()
  @IsString()
  nombreTitular?: string;

  @IsOptional()
  @IsString()
  mesCaducidad?: string;

  @IsOptional()
  @IsString()
  anioCaducidad?: string;

  @IsOptional()
  @IsString()
  cvc?: string;

  @IsOptional()
  @IsNumber()
  cuotas?: number;
}
