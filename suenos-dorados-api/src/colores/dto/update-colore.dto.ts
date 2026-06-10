import { PartialType } from '@nestjs/mapped-types';
import { CreateColoreDto } from './create-colore.dto';

export class UpdateColoreDto extends PartialType(CreateColoreDto) {}
