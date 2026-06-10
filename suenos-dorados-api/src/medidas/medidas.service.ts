import { Injectable } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medida } from './entities/medida.entity';

@Injectable()
export class MedidasService {
  constructor(
    @InjectRepository(Medida)
    private readonly medidasRepository: Repository<Medida>,
  ) {}

  async findAll(): Promise<Medida[]> {
    return await this.medidasRepository.find();
  }
}