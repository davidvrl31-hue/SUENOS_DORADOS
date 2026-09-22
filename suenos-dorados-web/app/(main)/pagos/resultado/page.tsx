"use client";
/**
 * /pagos/resultado
 *
 * Bold redirige aquí después del pago (callback_url).
 * La URL llega con ?ref=SD-{idPedido}-{timestamp}
 *
 * Esta página:
 * 1. Lee el linkId guardado en localStorage
 * 2. Consulta el estado del link al backend NestJS → GET /pagos/estado/:linkId
 * 3. Muestra el resultado: PAID / REJECTED / CANCELLED / PROCESSING
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI } from "@/src/services/api.service";

type EstadoPago = "cargando" | "aprobado" | "rechazado" | "pendiente" | "error";

export default function ResultadoPagoPage() {
  const { user, loadOrders } = useApp();

  const [estado,    setEstado]    = useState<EstadoPago>("cargando");
  const [linkId,    setLinkId]    = useState<string | null>(null);
  const [idPedido,  setIdPedido]  = useState<string | null>(null);
  const [intentos,  setIntentos]  = useState(0);

  useEffect(() => {
    const storedLinkId  = localStorage.getItem("bold_link_id");
    const storedPedido  = localStorage.getItem("bold_pedido_id");

    setLinkId(storedLinkId);
    setIdPedido(storedPedido);

    if (!storedLinkId || !user?.token) {
      setEstado("error");
      return;
    }

    consultarConReintentos(storedLinkId, user.token, 0);
  }, [user?.token]); // eslint-disable-line

  const consultarConReintentos = async (id: string, token: string, intento: number) => {
    if (intento > 6) {
      setEstado("pendiente");
      return;
    }

    try {
      const data = await SueñosDoradosAPI.consultarEstadoPago(token, id);
      // El backend devuelve { ok, estado: { status, paymentMethod, transactionId } }
      const status: string = data?.estado?.status ?? "ACTIVE";

      if (status === "PAID") {
        setEstado("aprobado");
        await loadOrders();
        localStorage.removeItem("bold_link_id");
        localStorage.removeItem("bold_reference");
        localStorage.removeItem("bold_pedido_id");
      } else if (status === "REJECTED" || status === "CANCELLED" || status === "EXPIRED") {
        setEstado("rechazado");
        localStorage.removeItem("bold_link_id");
        localStorage.removeItem("bold_reference");
        localStorage.removeItem("bold_pedido_id");
      } else {
        // ACTIVE / PROCESSING — reintentar en 3 s
        setIntentos(intento + 1);
        setTimeout(() => consultarConReintentos(id, token, intento + 1), 3_000);
      }
    } catch {
      setTimeout(() => consultarConReintentos(id, token, intento + 1), 3_000);
    }
  };

  // ── Cargando ──────────────────────────────────────────────────────────────
  if (estado === "cargando") {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="card p-10 rounded-3xl flex flex-col items-center gap-5 shadow-lg border border-gray-100">
          <Loader2 size={40} className="text-primary animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Verificando tu pago...</h2>
            <p className="text-sm text-gray-500">
              Estamos confirmando el estado de tu transacción con Bold.
              {intentos > 0 && ` (Intento ${intentos + 1}/7)`}
            </p>
          </div>
          <p className="text-xs text-gray-400">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  // ── Aprobado ──────────────────────────────────────────────────────────────
  if (estado === "aprobado") {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="card p-8 flex flex-col items-center text-center gap-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago aprobado!</h2>
            <p className="text-gray-500 text-sm">
              Tu transacción fue aprobada. Tu pedido está siendo preparado.
            </p>
          </div>
          {idPedido && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 text-sm">
              <span className="text-gray-500">Pedido: </span>
              <span className="font-bold text-gray-800">ORD-{idPedido}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/mis-pedidos" className="btn-primary flex-1 py-3 text-center">
              Ver mis pedidos
            </Link>
            <Link href="/busqueda" className="btn-secondary flex-1 py-3 text-center">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Rechazado / Cancelado ─────────────────────────────────────────────────
  if (estado === "rechazado") {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="card p-8 flex flex-col items-center text-center gap-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle size={40} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago rechazado</h2>
            <p className="text-gray-500 text-sm">
              El pago no fue aprobado. El stock de los productos fue restaurado.
              Puedes intentarlo de nuevo con otro método.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/carrito" className="btn-primary flex-1 py-3 text-center">
              Intentar de nuevo
            </Link>
            <Link href="/busqueda" className="btn-secondary flex-1 py-3 text-center">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pendiente / En proceso ────────────────────────────────────────────────
  if (estado === "pendiente") {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="card p-8 flex flex-col items-center text-center gap-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
            <Clock size={40} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago en proceso</h2>
            <p className="text-gray-500 text-sm">
              Tu transacción está siendo procesada por Bold. Recibirás
              confirmación por correo cuando se complete.
            </p>
          </div>
          {idPedido && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-3 text-sm">
              <span className="text-gray-500">Pedido: </span>
              <span className="font-bold text-gray-800">ORD-{idPedido}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/mis-pedidos" className="btn-primary flex-1 py-3 text-center">
              Ver mis pedidos
            </Link>
            <Link href="/" className="btn-secondary flex-1 py-3 text-center">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Sin referencia ────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="card p-8 flex flex-col items-center text-center gap-6 rounded-3xl shadow-lg border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <XCircle size={40} className="text-gray-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No se pudo verificar el pago</h2>
          <p className="text-gray-500 text-sm">
            No encontramos la referencia de tu transacción. Si realizaste el pago,
            revisa el estado en "Mis pedidos".
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/mis-pedidos" className="btn-primary flex-1 py-3 text-center">
            Mis pedidos
          </Link>
          <Link href="/" className="btn-secondary flex-1 py-3 text-center">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
