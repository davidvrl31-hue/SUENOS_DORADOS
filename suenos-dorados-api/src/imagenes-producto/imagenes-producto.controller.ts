import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ImagenesProductoService } from './imagenes-producto.service';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('imagenes-producto')
export class ImagenesProductoController {
  constructor(
    private readonly service: ImagenesProductoService,
    private readonly config: ConfigService,
  ) {}

  /** GET /imagenes-producto?idProducto=X */
  @Get()
  findByProducto(@Query('idProducto', ParseIntPipe) idProducto: number) {
    return this.service.findByProducto(idProducto);
  }

  /**
   * POST /imagenes-producto
   * Body: multipart/form-data
   *   - imagen: archivo (jpg, png, webp)
   *   - idProducto, idColor, orden, esPrincipal: campos del formulario
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/productos',
        filename: (_req, file, cb) => {
          const name = file.originalname
            .split('.')[0]
            .replace(/\s+/g, '-')
            .substring(0, 40);
          const ext = extname(file.originalname);
          cb(null, `${name}-${uuid().substring(0, 8)}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Solo se permiten imágenes (jpg, png, webp, gif)'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async subir(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateImagenDto,
  ) {
    if (!file) throw new BadRequestException('El archivo de imagen es requerido');
    const baseUrl = this.config.get<string>('API_BASE_URL') ?? 'http://localhost:3000';
    const urlImagen = `${baseUrl}/uploads/productos/${file.filename}`;
    return this.service.crear(dto, urlImagen);
  }

  /** PATCH /imagenes-producto/:id/principal */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/principal')
  marcarPrincipal(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarPrincipal(id);
  }

  /** DELETE /imagenes-producto/:id */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    const baseUrl = this.config.get<string>('API_BASE_URL') ?? 'http://localhost:3000';
    return this.service.eliminar(id, baseUrl);
  }
}
