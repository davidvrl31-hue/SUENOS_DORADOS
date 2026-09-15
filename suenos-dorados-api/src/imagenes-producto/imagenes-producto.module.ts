import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ImagenesProductoService } from './imagenes-producto.service';
import { ImagenesProductoController } from './imagenes-producto.controller';
import { ImagenProducto } from './entities/imagen-producto.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImagenProducto]),
    MulterModule.register({ dest: './uploads/productos' }),
    AuthModule,
  ],
  controllers: [ImagenesProductoController],
  providers: [ImagenesProductoService],
  exports: [ImagenesProductoService],
})
export class ImagenesProductoModule {}
