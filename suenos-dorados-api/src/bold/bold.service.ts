import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

import { Pedido } from '../pedidos/entities/pedido.entity';
import { WebhookBoldPayloadDto } from './dto/webhook-bold.dto';

// ─── Estados de pedido en la BD ───────────────────────────────────────────────
const ESTADO = {
  PENDIENTE:  1,
  PAGADO:     2,  // SALE_APPROVED / link PAID
  RECHAZADO:  3,  // SALE_REJECTED / link REJECTED
  CANCELADO:  4,  // VOID_APPROVED / link CANCELLED
} as const;

// ─── URL base de la API Link de pagos Bold ────────────────────────────────────
// Usa la misma llave del Botón de pagos — no requiere activación especial.
const BOLD_LINK_URL = 'https://integrations.api.bold.co';

@Injectable()
export class BoldService {
  private readonly logger = new Logger(BoldService.name);
  private readonly boldClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly callbackUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Pedido)
    private readonly pedidosRepo: Repository<Pedido>,
    private readonly dataSource: DataSource,
  ) {
    this.apiKey      = this.config.getOrThrow<string>('BOLD_API_KEY');
    this.secretKey   = this.config.get<string>('BOLD_SECRET_KEY', '');
    this.callbackUrl = this.config.get<string>(
      'BOLD_CALLBACK_URL',
      'http://localhost:3001/pagos/resultado',
    );

    // Cliente HTTP apuntando a la API Link de pagos
    this.boldClient = axios.create({
      baseURL: BOLD_LINK_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `x-api-key ${this.apiKey}`,
      },
      timeout: 15_000,
    });

    // Log de diagnóstico — muestra los primeros y últimos 4 chars de la llave
    const keyPreview = this.apiKey.length > 8
      ? `${this.apiKey.slice(0, 4)}...${this.apiKey.slice(-4)} (len=${this.apiKey.length})`
      : `[muy corta: ${this.apiKey.length} chars]`;
    this.logger.log(`BoldService iniciado. API Key: ${keyPreview} | callbackUrl=${this.callbackUrl}`);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 1. CREAR LINK DE PAGO
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Crea un link de pago Bold con monto fijo (CLOSE).
   * El usuario es redirigido a la URL de Bold donde elige PSE, Nequi,
   * tarjeta o Bancolombia — sin necesidad de seleccionar banco por separado.
   *
   * Docs: POST https://integrations.api.bold.co/online/link/v1
   */
  async crearLinkDePago(params: {
    idPedido:        number;
    totalCOP:        number;
    descripcion:     string;
    correoComprador: string;
  }): Promise<{ linkId: string; checkoutUrl: string; referenceId: string }> {
    const referenceId = `SD-${params.idPedido}-${Date.now()}`;

    const body: Record<string, any> = {
      amount_type: 'CLOSE',
      amount: {
        currency:     'COP',
        total_amount: Math.round(params.totalCOP),
      },
      description:  params.descripcion.slice(0, 100),
      reference:    referenceId,
      payer_email:  params.correoComprador,
      // Todos los métodos disponibles en la cuenta
      payment_methods: ['CREDIT_CARD', 'PSE', 'NEQUI', 'BOTON_BANCOLOMBIA'],
    };

    // callback_url solo si es HTTPS — Bold la rechaza si es http://localhost
    if (this.callbackUrl.startsWith('https://')) {
      body.callback_url = `${this.callbackUrl}?ref=${referenceId}`;
    }

    try {
      this.logger.log(`Creando link Bold: amount=${Math.round(params.totalCOP)} ref=${referenceId}`);
      const { data } = await this.boldClient.post('/online/link/v1', body);
      const linkId: string      = data?.payload?.payment_link ?? data?.payload?.id;
      const checkoutUrl: string = data?.payload?.url;

      if (!linkId || !checkoutUrl) {
        this.logger.error(`Respuesta inesperada de Bold: ${JSON.stringify(data)}`);
        throw new BadRequestException('Bold no devolvió la URL del link de pago');
      }

      this.logger.log(`Link creado: ${linkId} → ${checkoutUrl} (ref=${referenceId})`);
      return { linkId, checkoutUrl, referenceId };
    } catch (err: any) {
      const status  = err.response?.status;
      const boldMsg =
        err.response?.data?.errors?.[0]?.message ??
        err.response?.data?.message ??
        err.response?.data?.Message ??
        err.message;
      this.logger.error(`Error Bold [${status}]: ${boldMsg} | body enviado: ${JSON.stringify(body)}`);
      throw new BadRequestException(`Bold: ${boldMsg}`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. CONSULTAR ESTADO DEL LINK
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Consulta el estado actual de un link de pago.
   * Estados: ACTIVE | PROCESSING | PAID | REJECTED | CANCELLED | EXPIRED
   *
   * Docs: GET https://integrations.api.bold.co/online/link/v1/{payment_link}
   */
  async consultarEstadoLink(linkId: string): Promise<{
    status: string;
    paymentMethod: string | null;
    transactionId: string | null;
  }> {
    try {
      const { data } = await this.boldClient.get(`/online/link/v1/${linkId}`);
      return {
        status:        data?.status         ?? 'ACTIVE',
        paymentMethod: data?.payment_method ?? null,
        transactionId: data?.transaction_id ?? null,
      };
    } catch (err: any) {
      this.logger.warn(`No se pudo consultar estado del link ${linkId}: ${err.message}`);
      return { status: 'UNKNOWN', paymentMethod: null, transactionId: null };
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. CONSULTAR MÉTODOS DE PAGO DISPONIBLES
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Devuelve los métodos de pago habilitados en la cuenta Bold y sus límites.
   * Docs: GET https://integrations.api.bold.co/online/link/v1/payment_methods
   */
  async obtenerMetodosDePago(): Promise<Record<string, { min: number; max: number }>> {
    try {
      const { data } = await this.boldClient.get('/online/link/v1/payment_methods');
      return data?.payload?.payment_methods ?? {};
    } catch (err: any) {
      this.logger.warn(`No se pudieron obtener métodos de pago: ${err.message}`);
      return {};
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. VERIFICAR FIRMA DEL WEBHOOK (HMAC-SHA256)
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Bold firma el body con HMAC-SHA256 sobre el rawBody en Base64.
   * En sandbox la secret key es string vacío.
   */
  verificarFirmaWebhook(rawBody: Buffer, signature: string): boolean {
    try {
      const key     = this.secretKey ?? '';
      const encoded = rawBody.toString('base64');
      const hmac    = crypto
        .createHmac('sha256', key)
        .update(encoded)
        .digest('hex');

      const valid = crypto.timingSafeEqual(
        Buffer.from(hmac),
        Buffer.from(signature),
      );

      if (!valid) {
        this.logger.warn(`Firma inválida. Calculada: ${hmac} | Recibida: ${signature}`);
      }
      return valid;
    } catch {
      return false;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. PROCESAR EVENTO DEL WEBHOOK
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Actualiza estado del pedido e inventario según el evento recibido.
   * Implementa idempotencia: si ya está en estado final, no actúa.
   */
  async procesarEventoWebhook(payload: WebhookBoldPayloadDto): Promise<void> {
    const { type, data, subject } = payload;
    const paymentId = data.payment_id ?? subject;

    this.logger.log(`Webhook Bold [${type}] payment_id=${paymentId}`);

    // Extraer idPedido de metadata.reference (formato "SD-{idPedido}-{ts}")
    const reference = data.metadata?.reference ?? '';
    const idPedido  = this.extraerIdPedido(reference);

    if (!idPedido) {
      this.logger.warn(`Webhook sin idPedido identificable. reference="${reference}"`);
      return;
    }

    const pedido = await this.pedidosRepo.findOne({
      where: { idPedido },
      relations: { detalles: true },
    });

    if (!pedido) {
      this.logger.warn(`Webhook: pedido ${idPedido} no encontrado`);
      return;
    }

    // Idempotencia: estados finales no se sobreescriben
    const estadosFinales = [ESTADO.PAGADO, ESTADO.RECHAZADO, ESTADO.CANCELADO];
    if (estadosFinales.includes(pedido.idEstadoPedido as any)) {
      this.logger.log(`Pedido ${idPedido} ya en estado final (${pedido.idEstadoPedido}), ignorando`);
      return;
    }

    switch (type) {
      case 'SALE_APPROVED':
        await this.marcarPagado(pedido, paymentId);
        break;
      case 'SALE_REJECTED':
        await this.marcarRechazado(pedido);
        await this.revertirStock(pedido);
        break;
      case 'VOID_APPROVED':
      case 'VOID_REJECTED':
        await this.marcarCancelado(pedido);
        break;
      default:
        this.logger.warn(`Evento Bold desconocido: ${type}`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PRIVADOS
  // ────────────────────────────────────────────────────────────────────────────

  private extraerIdPedido(reference: string): number | null {
    const match = reference.match(/^SD-(\d+)-\d+$/);
    if (match) return parseInt(match[1], 10);
    const num = parseInt(reference, 10);
    return isNaN(num) ? null : num;
  }

  private async marcarPagado(pedido: Pedido, boldPaymentId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE pedidos SET id_estado_pedido = $1 WHERE id_pedido = $2`,
      [ESTADO.PAGADO, pedido.idPedido],
    );
    this.logger.log(`✅ Pedido ${pedido.idPedido} PAGADO (bold=${boldPaymentId})`);
  }

  private async marcarRechazado(pedido: Pedido): Promise<void> {
    await this.dataSource.query(
      `UPDATE pedidos SET id_estado_pedido = $1 WHERE id_pedido = $2`,
      [ESTADO.RECHAZADO, pedido.idPedido],
    );
    this.logger.warn(`❌ Pedido ${pedido.idPedido} RECHAZADO`);
  }

  private async marcarCancelado(pedido: Pedido): Promise<void> {
    await this.dataSource.query(
      `UPDATE pedidos SET id_estado_pedido = $1 WHERE id_pedido = $2`,
      [ESTADO.CANCELADO, pedido.idPedido],
    );
    this.logger.warn(`🚫 Pedido ${pedido.idPedido} CANCELADO`);
  }

  private async revertirStock(pedido: Pedido): Promise<void> {
    if (!pedido.detalles?.length) return;
    for (const detalle of pedido.detalles) {
      await this.dataSource.query(
        `UPDATE variantes_producto SET stock = stock + $1 WHERE id_variante = $2`,
        [detalle.cantidad, detalle.idVariante],
      );
    }
    this.logger.log(`🔄 Stock revertido para pedido ${pedido.idPedido}`);
  }
}
