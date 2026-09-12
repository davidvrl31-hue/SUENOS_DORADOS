import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoEnvioController } from './estado-envio.controller';
import { EstadoEnvioService } from './estado-envio.service';
import { EstadoEnvio } from './entities/estado-envio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoEnvio])],
  controllers: [EstadoEnvioController],
  providers: [EstadoEnvioService],
  exports: [EstadoEnvioService],
})
export class EstadoEnvioModule {}
