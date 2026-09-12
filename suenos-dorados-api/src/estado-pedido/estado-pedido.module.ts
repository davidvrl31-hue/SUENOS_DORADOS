import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoPedidoController } from './estado-pedido.controller';
import { EstadoPedidoService } from './estado-pedido.service';
import { EstadoPedido } from './entities/estado-pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoPedido])],
  controllers: [EstadoPedidoController],
  providers: [EstadoPedidoService],
  exports: [EstadoPedidoService],
})
export class EstadoPedidoModule {}
