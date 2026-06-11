import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { VariantesProducto } from '../variantes-producto/entities/variantes-producto.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, Usuario, VariantesProducto, Producto, Categoria]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
