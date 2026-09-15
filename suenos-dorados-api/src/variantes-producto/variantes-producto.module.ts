import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantesProductoService } from './variantes-producto.service';
import { VariantesProductoController } from './variantes-producto.controller';
import { VariantesProducto } from './entities/variantes-producto.entity';
import { MovimientosInventarioModule } from '../movimientos-inventario/movimientos-inventario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VariantesProducto]),
    MovimientosInventarioModule,
  ],
  controllers: [VariantesProductoController],
  providers: [VariantesProductoService],
  exports: [VariantesProductoService],
})
export class VariantesProductoModule {}
