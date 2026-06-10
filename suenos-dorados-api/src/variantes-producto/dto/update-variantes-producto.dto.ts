import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantesProductoDto } from './create-variantes-producto.dto';

export class UpdateVariantesProductoDto extends PartialType(CreateVariantesProductoDto) {}
