import { PartialType } from '@nestjs/mapped-types';
import { CreateMedidaDto } from './create-medida.dto';

export class UpdateMedidaDto extends PartialType(CreateMedidaDto) {}
