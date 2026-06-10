import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';
import { Color } from './entities/colore.entity'; // ◄--- Si sigue rojo, añade una 'e': './entities/colore.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Color])],
  controllers: [ColoresController],
  providers: [ColoresService],
})
export class ColoresModule {}