import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API, DireccionAPI } from "../services/api.service";
import { useAuth } from "./AuthContext";
import { CartItem } from "./CartContext";

const WS_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/api\/?$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  idPedido: number;
  date: string;
  items: CartItem[];
  total: number;
  status: "pendiente" | "en_camino" | "entregado" | "cancelado" | "en_proceso" | "Despachado";
}

export interface Address {
  id: string;
  idDireccion?: number;
  label: string;
  fullAddress: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "tarjeta" | "pse" | "efectivo";
  label: string;
  details: string;
  isDefault: boolean;
}

interface OrdersContextType {
  orders: Order[];
  addresses: Address[];
  apiAddresses: DireccionAPI[];
  payments: PaymentMethod[];
  isLoadingOrders: boolean;
  isLoadingAddresses: boolean;
  /** Stock en tiempo real — actualizado por WebSocket */
  stockMap: Record<number, number>;
  loadOrders: () => Promise<void>;
  loadAddresses: () => Promise<void>;
  placeOrder: (items: CartItem[], total: number, idDireccion: number, costoEnvio?: number) => Promise<Order>;
  addAddress: (addr: Omit<Address, "id">) => Promise<void>;
  updateAddress: (addr: Address) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  addPayment: (p: Omit<PaymentMethod, "id">) => Promise<void>;
  updatePayment: (p: PaymentMethod) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

const PAYMENTS_KEY = "@sd_payments";
const OrdersContext = createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [orders,             setOrders]             = useState<Order[]>([]);
  const [apiAddresses,       setApiAddresses]       = useState<DireccionAPI[]>([]);
  const [payments,           setPayments]           = useState<PaymentMethod[]>([]);
  const [isLoadingOrders,    setIsLoadingOrders]    = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [stockMap,           setStockMap]           = useState<Record<number, number>>({});
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => console.log("[WS] Conectado:", socket.id));

    socket.on("pedido:estado", (payload: {
      idPedido: number;
      idEstadoPedido: number;
      descripcionEstado: string;
    }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.idPedido === payload.idPedido
            ? { ...o, status: mapEstado(payload.idEstadoPedido) }
            : o
        )
      );
    });

    socket.on("variante:stock", (payload: { idVariante: number; stockNuevo: number }) => {
      setStockMap((prev) => ({ ...prev, [payload.idVariante]: payload.stockNuevo }));
    });

    socket.on("disconnect", () => console.log("[WS] Desconectado"));
    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []); // eslint-disable-line

  // ── Pagos en AsyncStorage ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.idUsuario) return;
    AsyncStorage.getItem(`${PAYMENTS_KEY}_${user.idUsuario}`)
      .then((s) => { if (s) setPayments(JSON.parse(s)); })
      .catch(() => {});
  }, [user?.idUsuario]);

  useEffect(() => {
    if (!user?.idUsuario) return;
    AsyncStorage.setItem(`${PAYMENTS_KEY}_${user.idUsuario}`, JSON.stringify(payments)).catch(() => {});
  }, [payments, user?.idUsuario]);

  // ── Adaptar dirección ─────────────────────────────────────────────────────
  const adaptAddress = (d: DireccionAPI): Address => ({
    id:          String(d.idDireccion),
    idDireccion: d.idDireccion,
    label:       d.esPrincipal ? "Principal" : (d as any).descripcionBarrio ?? "Dirección",
    fullAddress: d.descripcionDireccion,
    city:        `${d.descripcionMunicipio}, ${d.descripcionDepartamento}`,
    phone:       "",
    isDefault:   d.esPrincipal,
  });

  const addresses = apiAddresses.map(adaptAddress);

  // ── Cargar pedidos ────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingOrders(true);
    try {
      const data: any[] = await API.getPedidos(user.token);
      const mapped: Order[] = data.map((p) => ({
        id:       `ORD-${p.idPedido}`,
        idPedido: Number(p.idPedido),
        date:     new Date(p.fechaPedido).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }),
        items:    p.detalles?.map((d: any) => ({
          id:    String(d.idVariante),
          name:  d.nombreProducto ?? `Variante #${d.idVariante}`,
          price: Number(d.precioUnitario),
          qty:   d.cantidad,
          image: "",
        })) ?? [],
        total:  Number(p.total),
        status: mapEstado(p.idEstadoPedido),
      }));
      setOrders(mapped);
    } catch {}
    finally { setIsLoadingOrders(false); }
  }, [user?.token]);

  // ── Cargar direcciones ────────────────────────────────────────────────────
  const loadAddresses = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingAddresses(true);
    try {
      const dirs = await API.getDirecciones(user.token);
      setApiAddresses(dirs);
    } catch {}
    finally { setIsLoadingAddresses(false); }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) { loadOrders(); loadAddresses(); }
    else { setOrders([]); setApiAddresses([]); }
  }, [user?.token]); // eslint-disable-line

  // ── Crear pedido ──────────────────────────────────────────────────────────
  const placeOrder = useCallback(async (
    items: CartItem[], total: number, idDireccion: number, costoEnvio = 0
  ): Promise<Order> => {
    if (!user?.token) throw new Error("Debes iniciar sesión para hacer un pedido");
    const result: any = await API.crearPedido(user.token, {
      idDireccion,
      items: items.map((i) => ({
        idVariante:     parseInt(i.id, 10) || 1,
        cantidad:       i.qty,
        precioUnitario: i.price,
      })),
      costoEnvio,
    });
    const newOrder: Order = {
      id:       `ORD-${result.idPedido}`,
      idPedido: Number(result.idPedido),
      date:     new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }),
      items, total, status: "pendiente",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [user?.token]);

  // ── Direcciones ───────────────────────────────────────────────────────────
  const addAddress = useCallback(async (addr: Omit<Address, "id">) => {
    if (!user?.token) return;
    const [municipio, ...restDep] = addr.city.split(",");
    const nueva = await API.crearDireccion(user.token, {
      descripcionDireccion:    addr.fullAddress,
      descripcionMunicipio:    municipio?.trim() ?? addr.city,
      descripcionDepartamento: restDep.join(",").trim() || "Sin especificar",
      etiqueta:                addr.label || "Casa",
      telefonoContacto:        addr.phone || undefined,
      esPrincipal:             addr.isDefault,
    });
    setApiAddresses((prev) => [...prev, nueva]);
  }, [user?.token]);

  const updateAddress = useCallback(async (addr: Address) => {
    if (!user?.token || !addr.idDireccion) return;
    const [municipio, ...restDep] = addr.city.split(",");
    const updated = await (API as any).actualizarDireccion(user.token, addr.idDireccion, {
      descripcionDireccion:    addr.fullAddress,
      descripcionMunicipio:    municipio?.trim() ?? addr.city,
      descripcionDepartamento: restDep.join(",").trim() || "Sin especificar",
      etiqueta:                addr.label || "Casa",
      telefonoContacto:        addr.phone || undefined,
      esPrincipal:             addr.isDefault,
    });
    setApiAddresses((prev) => prev.map((a) => a.idDireccion === addr.idDireccion ? updated : a));
  }, [user?.token]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!user?.token) return;
    const addr = apiAddresses.find((a) => String(a.idDireccion) === id);
    if (!addr) return;
    await API.eliminarDireccion(user.token, addr.idDireccion);
    setApiAddresses((prev) => prev.filter((a) => String(a.idDireccion) !== id));
  }, [user?.token, apiAddresses]);

  // ── Métodos de pago ───────────────────────────────────────────────────────
  const addPayment    = useCallback(async (p: Omit<PaymentMethod, "id">) => {
    const newP: PaymentMethod = { ...p, id: Date.now().toString() };
    setPayments((prev) => p.isDefault ? [newP, ...prev.map((x) => ({ ...x, isDefault: false }))] : [...prev, newP]);
  }, []);

  const updatePayment = useCallback(async (p: PaymentMethod) => {
    setPayments((prev) => prev.map((x) => {
      if (p.isDefault && x.id !== p.id) return { ...x, isDefault: false };
      return x.id === p.id ? p : x;
    }));
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <OrdersContext.Provider value={{
      orders, addresses, apiAddresses, payments,
      isLoadingOrders, isLoadingAddresses, stockMap,
      loadOrders, loadAddresses,
      placeOrder, addAddress, updateAddress, deleteAddress,
      addPayment, updatePayment, deletePayment,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

function mapEstado(id: number): Order["status"] {
  switch (id) {
    case 1: return "pendiente";
    case 2: return "pendiente";
    case 3: return "en_proceso";
    case 4: return "en_proceso";
    case 5: return "entregado";
    case 6: return "cancelado";
    default: return "pendiente";
  }
}
