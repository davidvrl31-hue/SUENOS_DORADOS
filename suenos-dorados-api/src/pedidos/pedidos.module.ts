import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { AuthModule } from '../auth/auth.module';
import { MovimientosInventarioModule } from '../movimientos-inventario/movimientos-inventario.module';
import { DescuentosModule } from '../descuentos/descuentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, DetallePedido]),
    AuthModule,
    MovimientosInventarioModule,
    DescuentosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
