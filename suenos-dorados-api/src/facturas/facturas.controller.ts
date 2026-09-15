import { Controller, Get, Param, ParseIntPipe, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express';
import { FacturasService } from './facturas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturasController {
  constructor(private readonly service: FacturasService) {}

  /**
   * GET /facturas/pedido/:id
   * Descarga la factura en PDF del pedido indicado.
   * Solo el dueño del pedido puede descargarla (idUsuario del JWT).
   */
  @Get('pedido/:id')
  async descargar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Request() req: { user: { idUsuario: number } },
  ) {
    await this.service.generarPDF(id, req.user.idUsuario, res);
  }
}
