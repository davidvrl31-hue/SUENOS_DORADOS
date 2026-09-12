import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BoldService } from './bold.service';
import { BoldController } from './bold.controller';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { DetallePedido } from '../pedidos/entities/detalle-pedido.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * BoldModule — Integración completa con la pasarela de pagos Bold Colombia.
 *
 * Expone:
 *   POST /pagos/crear          — Crear + ejecutar intento de pago
 *   GET  /pagos/bancos-pse     — Lista bancos disponibles para PSE
 *   GET  /pagos/estado/:ref    — Consultar estado de una transacción
 *   POST /pagos/webhook        — Recibir notificaciones de Bold (HMAC firmadas)
 */
@Module({
  imports: [
    // Necesita acceso a Pedido para actualizar estados e inventario
    TypeOrmModule.forFeature([Pedido, DetallePedido]),
    // JwtAuthGuard está exportado desde AuthModule
    AuthModule,
  ],
  controllers: [BoldController],
  providers: [BoldService],
  exports: [BoldService],
})
export class BoldModule {}
