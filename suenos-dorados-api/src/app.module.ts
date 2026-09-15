import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Catálogo e inventario
import { CategoriasModule } from './categorias/categorias.module';
import { ColeccionesModule } from './colecciones/colecciones.module';
import { ProductosModule } from './productos/productos.module';
import { MedidasModule } from './medidas/medidas.module';
import { ColoresModule } from './colores/colores.module';
import { VariantesProductoModule } from './variantes-producto/variantes-producto.module';
import { ImagenesProductoModule } from './imagenes-producto/imagenes-producto.module';
import { DescuentosModule } from './descuentos/descuentos.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';

// Usuarios, autenticación y accesos
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';

// Pedidos, envío y direcciones
import { PedidosModule } from './pedidos/pedidos.module';
import { DireccionesModule } from './direcciones/direcciones.module';
import { EstadoPedidoModule } from './estado-pedido/estado-pedido.module';
import { EstadoEnvioModule } from './estado-envio/estado-envio.module';
import { EnvioModule } from './envio/envio.module';

// WebSockets — tiempo real
import { EventsModule } from './events/events.module';

// Módulo admin (dashboard + gestión desde escritorio)
import { AdminModule } from './admin/admin.module';

// Pasarela de pagos Bold
import { BoldModule } from './bold/bold.module';

// Facturas PDF
import { FacturasModule } from './facturas/facturas.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST'),
        port:     config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),

    // ── Catálogo e inventario ──────────────────────────────────────────
    CategoriasModule,
    ColeccionesModule,
    ProductosModule,
    MedidasModule,
    ColoresModule,
    VariantesProductoModule,
    ImagenesProductoModule,
    DescuentosModule,
    MovimientosInventarioModule,

    // ── Usuarios y auth ───────────────────────────────────────────────
    RolesModule,
    UsuariosModule,
    AuthModule,

    // ── Pedidos, envío y direcciones ──────────────────────────────────
    PedidosModule,
    DireccionesModule,
    EstadoPedidoModule,
    EstadoEnvioModule,
    EnvioModule,

    // ── WebSockets ────────────────────────────────────────────────────
    EventsModule,

    // ── Admin y pagos ─────────────────────────────────────────────────
    AdminModule,
    BoldModule,
    FacturasModule,
  ],
})
export class AppModule {}
