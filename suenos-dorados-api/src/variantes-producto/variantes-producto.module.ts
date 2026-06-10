import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantesProductoService } from './variantes-producto.service';
import { VariantesProductoController } from './variantes-producto.controller';
import { VariantesProducto } from './entities/variantes-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VariantesProducto])],
  controllers: [VariantesProductoController],
  providers: [VariantesProductoService],
})
export class VariantesProductoModule {}