"use client";
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3000";

// ── Payloads ─────────────────────────────────────────────────────────────────

export interface PedidoEstadoPayload {
  idPedido:          number;
  idEstadoPedido:    number;
  descripcionEstado: string;
}

export interface VarianteStockPayload {
  idVariante: number;
  idProducto: number;
  stockNuevo: number;
  sku:        string;
}

// ── Opciones del hook ─────────────────────────────────────────────────────────

interface UseSocketOptions {
  onPedidoEstado?:   (payload: PedidoEstadoPayload)   => void;
  onVarianteStock?:  (payload: VarianteStockPayload)  => void;
}

/**
 * Conecta al WebSocket del backend y registra listeners.
 * Se desconecta automáticamente al desmontar el componente.
 */
export function useSocket(options: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  // Guardar callbacks en ref para no reconectar si cambian
  const onPedidoRef  = useRef(options.onPedidoEstado);
  const onStockRef   = useRef(options.onVarianteStock);
  useEffect(() => { onPedidoRef.current = options.onPedidoEstado; }, [options.onPedidoEstado]);
  useEffect(() => { onStockRef.current  = options.onVarianteStock; },  [options.onVarianteStock]);

  useEffect(() => {
    const socket = io(WS_URL, {
      transports:       ["websocket", "polling"],
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("[WS] Conectado al servidor:", socket.id);
    });

    socket.on("pedido:estado", (payload: PedidoEstadoPayload) => {
      onPedidoRef.current?.(payload);
    });

    socket.on("variante:stock", (payload: VarianteStockPayload) => {
      onStockRef.current?.(payload);
    });

    socket.on("disconnect", () => {
      console.log("[WS] Desconectado del servidor");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Solo conectar una vez

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit };
}
