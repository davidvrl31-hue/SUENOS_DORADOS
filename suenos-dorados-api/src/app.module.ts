import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Catálogo e inventario
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { MedidasModule } from './medidas/medidas.module';
import { ColoresModule } from './colores/colores.module';
import { VariantesProductoModule } from './variantes-producto/variantes-producto.module';

// Usuarios, autenticación y accesos
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';

// Pedidos y direcciones
import { PedidosModule } from './pedidos/pedidos.module';
import { DireccionesModule } from './direcciones/direcciones.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),

    // Módulos de la aplicación
    CategoriasModule,
    ProductosModule,
    MedidasModule,
    ColoresModule,
    VariantesProductoModule,
    RolesModule,
    UsuariosModule,
    AuthModule,
    PedidosModule,
    DireccionesModule,
  ],
})
export class AppModule {}
