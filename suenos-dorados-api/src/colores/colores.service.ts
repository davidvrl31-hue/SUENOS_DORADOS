import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entities/colore.entity'; 

@Injectable()
export class ColoresService {
  constructor(
    @InjectRepository(Color)
    private readonly coloresRepository: Repository<Color>,
  ) {}

  async findAll(): Promise<Color[]> {
    return await this.coloresRepository.find();
  }
}