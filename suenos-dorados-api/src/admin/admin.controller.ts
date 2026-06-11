import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
