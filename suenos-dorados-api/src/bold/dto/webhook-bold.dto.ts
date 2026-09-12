/**
 * Tipado del payload que Bold envía al webhook.
 * Basado en la documentación oficial de Bold (agosto 2026).
 * Solo mapeamos los campos que procesamos — Bold puede enviar más.
 */

export type TipoEventoBold =
  | 'SALE_APPROVED'
  | 'SALE_REJECTED'
  | 'VOID_APPROVED'
  | 'VOID_REJECTED';

export interface WebhookBoldAmountDto {
  currency: string;
  total: number;
  tip: number;
  taxes: Array<{ base: number; type: string; value: number }>;
}

export interface WebhookBoldDataDto {
  payment_id: string;
  merchant_id: string;
  created_at: string;
  amount: WebhookBoldAmountDto;
  user_id?: string;
  /** Referencia externa del comercio — aquí guardamos el idPedido */
  metadata?: { reference?: string; [key: string]: any };
  bold_code?: string;
  payer_email?: string;
  payment_method?: string;
  /** Presente cuando el pago fue por PSE */
  pse?: { bank_name?: string; cus?: string };
  /** Presente cuando el pago fue por tarjeta */
  card?: {
    brand?: string;
    cardholder_name?: string;
    masked_pan?: string;
    installments?: number;
    card_type?: string;
  };
  approval_number?: string;
  integration?: string;
}

export interface WebhookBoldPayloadDto {
  /** UUID único de la notificación */
  id: string;
  /** Tipo de evento */
  type: TipoEventoBold;
  /** ID de la transacción Bold */
  subject: string;
  source?: string;
  spec_version?: string;
  /** Timestamp POSIX en nanosegundos */
  time?: number;
  data: WebhookBoldDataDto;
  datacontenttype?: string;
  seller?: { name?: string; last_name?: string; email?: string };
}
