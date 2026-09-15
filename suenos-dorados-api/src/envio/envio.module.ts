import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvioService } from './envio.service';
import { EnvioController } from './envio.controller';
import { Envio } from './entities/envio.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Envio]), AuthModule],
  controllers: [EnvioController],
  providers: [EnvioService],
  exports: [EnvioService],
})
export class EnvioModule {}
