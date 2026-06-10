import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedidasService } from './medidas.service';
import { MedidasController } from './medidas.controller';
import { Medida } from './entities/medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medida])],
  controllers: [MedidasController],
  providers: [MedidasService],
})
export class MedidasModule {}