import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColeccionesService } from './colecciones.service';
import { ColeccionesController } from './colecciones.controller';
import { Coleccion } from './entities/coleccion.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coleccion]), AuthModule],
  controllers: [ColeccionesController],
  providers: [ColeccionesService],
  exports: [ColeccionesService],
})
export class ColeccionesModule {}
