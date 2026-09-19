"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, Loader2, RefreshCw, Download } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI } from "@/src/services/api.service";

const statusColors: Record<string, string> = {
  entregado:  "bg-green-100 text-green-700",
  despachado: "bg-blue-100 text-blue-700",
  pagado:     "bg-teal-100 text-teal-700",
  pendiente:  "bg-yellow-100 text-yellow-700",
  en_proceso: "bg-orange-100 text-orange-700",
  cancelado:  "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  entregado:  "Entregado",
  despachado: "Despachado",
  pagado:     "Pagado",
  pendiente:  "Pendiente",
  en_proceso: "En preparación",
  cancelado:  "Cancelado",
};

export default function MisPedidosPage() {
  const { orders, loadOrders, isLoadingOrders, user } = useApp();
  const [descargando, setDescargando] = useState<number | null>(null);

  const handleDescargarFactura = async (idPedido: number) => {
    if (!user?.token) return;
    setDescargando(idPedido);
    try {
      await SueñosDoradosAPI.descargarFactura(user.token, idPedido);
    } catch {
      alert("No se pudo generar la factura. Intenta de nuevo.");
    } finally {
      setDescargando(null);
    }
  };

  useEffect(() => {
    if (user?.token) loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-5">
          <Package size={36} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia sesión</h2>
        <p className="text-gray-500 text-sm mb-6">Necesitas una cuenta para ver tus pedidos</p>
        <Link href="/login" className="btn-primary max-w-xs">Iniciar sesión</Link>
      </div>
    );
  }

  if (isLoadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 size={36} className="text-primary animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Cargando tus pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-5">
          <Package size={36} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sin pedidos aún</h2>
        <p className="text-gray-500 text-sm mb-6">
          Tus pedidos aparecerán aquí una vez que realices una compra
        </p>
        <Link href="/busqueda" className="btn-primary max-w-xs">Ir a comprar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado único — flecha solo en escritorio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/perfil" className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Mis pedidos</h1>
        </div>
        <button onClick={loadOrders} disabled={isLoadingOrders}
          className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50">
          <RefreshCw size={14} className={isLoadingOrders ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      <p className="text-sm text-gray-500">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex justify-between w-full text-sm">
                    <span className="text-gray-700">
                      {item.name}
                      {(item as { quantity?: number }).quantity && (item as { quantity?: number }).quantity! > 1
                        ? ` x${(item as { quantity?: number }).quantity}`
                        : ""}
                    </span>
                    <span className="text-gray-500">${item.price.toLocaleString("es-CO")}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Total pagado</span>
              <span className="font-bold text-primary">${order.total.toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>IVA incluido (19%)</span>
              <span>${Math.round(order.total - order.total / 1.19).toLocaleString("es-CO")}</span>
            </div>

            {/* Guía de envío — solo visible cuando está Despachado */}
            {order.status === "despachado" && (order.numeroGuia || order.transportadora) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                  🚚 Información de envío
                </p>
                {order.transportadora && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Transportadora</span>
                    <span className="font-semibold text-gray-800">{order.transportadora}</span>
                  </div>
                )}
                {order.numeroGuia && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Número de guía</span>
                    <span className="font-mono font-semibold text-gray-800">{order.numeroGuia}</span>
                  </div>
                )}
              </div>
            )}

            {/* Botón descargar factura */}
            <button
              onClick={() => handleDescargarFactura(Number(order.id.replace("ORD-", "")))}
              disabled={descargando === Number(order.id.replace("ORD-", ""))}
              className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-primary border border-primary rounded-xl py-2.5 hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {descargando === Number(order.id.replace("ORD-", ""))
                ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                : <><Download size={13} /> Descargar factura PDF</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
