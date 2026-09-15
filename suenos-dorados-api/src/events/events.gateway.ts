import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket Gateway — Sueños Dorados
 *
 * Emite eventos a todos los clientes conectados cuando:
 *  - El estado de un pedido cambia      → evento: "pedido:estado"
 *  - El stock de una variante cambia    → evento: "variante:stock"
 *
 * Todos los frontends (Web/Móvil) escuchan estos eventos
 * y actualizan su estado local sin recargar.
 */
@WebSocketGateway({
  cors: {
    origin: '*',   // En producción restringir al dominio real
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[WS] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Cliente desconectado: ${client.id}`);
  }

  /**
   * Emitir cambio de estado de un pedido.
   * Payload: { idPedido, idEstadoPedido, descripcionEstado }
   */
  emitPedidoEstado(payload: {
    idPedido: number;
    idEstadoPedido: number;
    descripcionEstado: string;
  }) {
    this.server.emit('pedido:estado', payload);
  }

  /**
   * Emitir cambio de stock de una variante.
   * Payload: { idVariante, idProducto, stockNuevo, sku }
   */
  emitVarianteStock(payload: {
    idVariante: number;
    idProducto: number;
    stockNuevo: number;
    sku: string;
  }) {
    this.server.emit('variante:stock', payload);
  }
}
