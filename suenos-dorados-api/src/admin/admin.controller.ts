import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Upload de imágenes ─────────────────────────────────
  @Post('imagenes/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'productos'),
        filename: (_req, file, cb) => {
          const safeName = file.originalname
            .replace(/\s+/g, '-')
            .replace(/[^A-Za-z0-9._-]/g, '')
            .toLowerCase();
          const stem = safeName.replace(/\.[^/.]+$/, '') || 'imagen';
          cb(null, `${stem}-${uuidv4().replace(/-/g, '').slice(0, 8)}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        if (allowed.includes(extname(file.originalname).toLowerCase())) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten imágenes JPG, PNG, WEBP o GIF'), false);
        }
      },
    }),
  )
  uploadImagen(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    const baseUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
    const url = `${baseUrl}/uploads/productos/${file.filename}`;
    return { url, filename: file.filename };
  }

  // ── Dashboard ──────────────────────────────────────────
  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboardStats();
  }

  @Get('dashboard/ventas')
  ventasChart() {
    return this.adminService.ventasUltimos7Dias();
  }

  @Get('dashboard/usuarios')
  usuariosChart() {
    return this.adminService.usuariosUltimos6Meses();
  }

  @Get('dashboard/pedidos-estado')
  pedidosEstado() {
    return this.adminService.pedidosPorEstado();
  }

  // ── Pedidos admin ──────────────────────────────────────
  @Get('pedidos')
  listarPedidos(
    @Query('estado') estado?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listarPedidos(estado, limit ? Number(limit) : 50);
  }

  @Get('pedidos/:id')
  obtenerPedido(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.obtenerPedido(id);
  }

  @Patch('pedidos/:id/estado')
  cambiarEstadoPedido(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { idEstadoPedido: number },
  ) {
    return this.adminService.cambiarEstadoPedido(id, body.idEstadoPedido);
  }

  // ── Usuarios admin ─────────────────────────────────────
  @Get('usuarios')
  listarUsuarios() {
    return this.adminService.listarUsuarios();
  }

  @Patch('usuarios/:id/estado')
  toggleUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: boolean },
  ) {
    return this.adminService.toggleEstadoUsuario(id, body.estado);
  }

  // ── Inventario: resumen de stock ───────────────────────
  @Get('inventario/resumen')
  resumenInventario() {
    return this.adminService.resumenInventario();
  }

  @Get('inventario/stock-bajo')
  stockBajo() {
    return this.adminService.stockBajo();
  }

  // ── Endpoints genéricos para soporte del cliente Flet (Python) ──
  @Get('tabla/:table')
  listarTablaGenerica(@Param('table') table: string) {
    return this.adminService.listarTablaGenerica(table);
  }

  @Post('tabla/:table')
  crearRegistroGenerico(
    @Param('table') table: string,
    @Body() body: any,
  ) {
    return this.adminService.crearRegistroGenerico(table, body);
  }

  @Patch('tabla/:table/:id')
  actualizarRegistroGenerico(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.actualizarRegistroGenerico(table, id, body);
  }

  @Delete('tabla/:table/:id')
  eliminarRegistroGenerico(
    @Param('table') table: string,
    @Param('id') id: string,
  ) {
    return this.adminService.eliminarRegistroGenerico(table, id);
  }
}
