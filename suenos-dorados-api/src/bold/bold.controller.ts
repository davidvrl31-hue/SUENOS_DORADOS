import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import type { Request } from 'express';

import { BoldService } from './bold.service';
import type { WebhookBoldPayloadDto } from './dto/webhook-bold.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── DTO inline para crear el link de pago ────────────────────────────────────
// (más liviano que el DTO anterior que era para la API Pagos en Línea)
class CrearLinkDto {
  @IsNumber()
  @Min(1)
  idPedido!: number;

  @IsNumber()
  @Min(1000)
  totalCOP!: number;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsEmail()
  correoComprador!: string;
}

// ─── Tipo local para request con rawBody ─────────────────────────────────────
interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Controller('pagos')
export class BoldController {
  private readonly logger = new Logger(BoldController.name);

  constructor(private readonly boldService: BoldService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // POST /pagos/crear
  // Crea un link de pago Bold y devuelve la checkoutUrl.
  // El frontend redirige al usuario a esa URL — Bold muestra PSE, Nequi, etc.
  // ──────────────────────────────────────────────────────────────────────────
  @Post('crear')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async crearPago(@Body() dto: CrearLinkDto) {
    const { linkId, checkoutUrl, referenceId } =
      await this.boldService.crearLinkDePago({
        idPedido:        dto.idPedido,
        totalCOP:        dto.totalCOP,
        descripcion:     dto.descripcion,
        correoComprador: dto.correoComprador,
      });

    return {
      ok:          true,
      linkId,
      referenceId,
      checkoutUrl, // → el frontend hace window.location.href = checkoutUrl
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /pagos/metodos
  // Métodos de pago habilitados en la cuenta Bold con sus límites.
  // ──────────────────────────────────────────────────────────────────────────
  @Get('metodos')
  async obtenerMetodos() {
    const metodos = await this.boldService.obtenerMetodosDePago();
    return { ok: true, metodos };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /pagos/estado/:linkId
  // Consulta el estado de un link Bold: ACTIVE | PROCESSING | PAID | REJECTED
  // ──────────────────────────────────────────────────────────────────────────
  @Get('estado/:linkId')
  @UseGuards(JwtAuthGuard)
  async consultarEstado(@Param('linkId') linkId: string) {
    const estado = await this.boldService.consultarEstadoLink(linkId);
    return { ok: true, estado };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /pagos/webhook
  // Recibe notificaciones asíncronas de Bold (SALE_APPROVED, SALE_REJECTED…).
  // Seguridad: verificación de firma HMAC-SHA256.
  // ──────────────────────────────────────────────────────────────────────────
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async recibirWebhook(
    @Req() req: RequestWithRawBody,
    @Headers('x-bold-signature') signature: string,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody || !rawBody.length) {
      this.logger.error('Webhook sin rawBody — verifica rawBody:true en main.ts');
      return { ok: false, error: 'rawBody no disponible' };
    }

    // En sandbox Bold firma con clave vacía — la verificación sigue siendo válida
    const firmaValida = this.boldService.verificarFirmaWebhook(
      rawBody,
      signature ?? '',
    );

    if (!firmaValida) {
      this.logger.warn(`Webhook rechazado — firma inválida: "${signature}"`);
      throw new UnauthorizedException('Firma de webhook inválida');
    }

    let payload: WebhookBoldPayloadDto;
    try {
      payload = JSON.parse(rawBody.toString('utf-8')) as WebhookBoldPayloadDto;
    } catch {
      this.logger.error('Webhook: body no es JSON válido');
      return { ok: false, error: 'JSON inválido' };
    }

    this.logger.log(`Webhook: type=${payload.type} subject=${payload.subject}`);

    // Responder 200 de inmediato — Bold exige < 2 s
    setImmediate(() => {
      this.boldService
        .procesarEventoWebhook(payload)
        .catch((err: Error) =>
          this.logger.error(`Error procesando webhook [${payload.type}]: ${err.message}`),
        );
    });

    return { ok: true, received: payload.type };
  }
}
