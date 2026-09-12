import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API, DireccionAPI } from "../services/api.service";
import { useAuth } from "./AuthContext";
import { CartItem } from "./CartContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "pendiente" | "en_camino" | "entregado" | "cancelado" | "en_proceso" | "Despachado";
}

export interface Address {
  id: string;
  idDireccion?: number;       // ID real en la BD
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
  loadOrders: () => Promise<void>;
  loadAddresses: () => Promise<void>;
  placeOrder: (
    items: CartItem[],
    total: number,
    idDireccion: number,
    costoEnvio?: number
  ) => Promise<Order>;
  addAddress: (addr: Omit<Address, "id">) => Promise<void>;
  updateAddress: (addr: Address) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  addPayment: (p: Omit<PaymentMethod, "id">) => Promise<void>;
  updatePayment: (p: PaymentMethod) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENTS_KEY = "@sd_payments";
const OrdersContext = createContext<OrdersContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [apiAddresses, setApiAddresses] = useState<DireccionAPI[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Adaptar DireccionAPI al tipo Address del contexto
  const adaptAddress = (d: DireccionAPI): Address => ({
    id: String(d.idDireccion),
    idDireccion: d.idDireccion,
    label: d.esPrincipal ? "Principal" : d.descripcionBarrio ?? "Dirección",
    fullAddress: d.descripcionDireccion,
    city: `${d.descripcionMunicipio}, ${d.descripcionDepartamento}`,
    phone: "",
    isDefault: d.esPrincipal,
  });

  const addresses = apiAddresses.map(adaptAddress);

  // Cargar métodos de pago desde AsyncStorage
  useEffect(() => {
    if (!user?.idUsuario) return;
    AsyncStorage.getItem(`${PAYMENTS_KEY}_${user.idUsuario}`)
      .then((s) => { if (s) setPayments(JSON.parse(s)); })
      .catch(() => { });
  }, [user?.idUsuario]);

  useEffect(() => {
    if (!user?.idUsuario) return;
    AsyncStorage.setItem(`${PAYMENTS_KEY}_${user.idUsuario}`, JSON.stringify(payments)).catch(() => { });
  }, [payments, user?.idUsuario]);

  // ── Cargar pedidos desde la API ───────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingOrders(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = await API.getPedidos(user.token);
      const mapped: Order[] = data.map((p) => ({
        id: `ORD-${p.idPedido}`,
        date: new Date(p.fechaPedido).toLocaleDateString("es-CO", {
          day: "numeric", month: "long", year: "numeric",
        }),
        items: p.detalles?.map((d: { nombreProducto?: string; precioUnitario: number; cantidad: number; idVariante: number }) => ({
          id: String(d.idVariante),
          name: d.nombreProducto ?? `Variante #${d.idVariante}`,
          price: Number(d.precioUnitario),
          qty: d.cantidad,
          image: "",
        })) ?? [],
        total: Number(p.total),
        status: p.idEstadoPedido === 1 ? "pendiente"
          : p.idEstadoPedido === 4 ? "en_camino"
          : p.idEstadoPedido === 5 ? "entregado"
          : p.idEstadoPedido === 6 ? "cancelado"
          : "pendiente",
      }));
      setOrders(mapped);
    } catch { /* silencioso */ }
    finally { setIsLoadingOrders(false); }
  }, [user?.token]);

  // ── Cargar direcciones desde la API ──────────────────────────────────────────
  const loadAddresses = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingAddresses(true);
    try {
      const dirs = await API.getDirecciones(user.token);
      setApiAddresses(dirs);
    } catch { /* silencioso */ }
    finally { setIsLoadingAddresses(false); }
  }, [user?.token]);

  // Cargar automáticamente cuando hay sesión
  useEffect(() => {
    if (user?.token) {
      loadOrders();
      loadAddresses();
    } else {
      setOrders([]);
      setApiAddresses([]);
    }
  }, [user?.token]); // eslint-disable-line

  // ── Crear pedido ─────────────────────────────────────────────────────────────
  const placeOrder = useCallback(async (
    items: CartItem[],
    total: number,
    idDireccion: number,
    costoEnvio = 0
  ): Promise<Order> => {
    if (!user?.token) throw new Error("Debes iniciar sesión para hacer un pedido");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await API.crearPedido(user.token, {
      idDireccion,
      items: items.map((i) => ({
        idVariante: parseInt(i.id, 10) || 1,
        cantidad: i.qty,
        precioUnitario: i.price,
      })),
      costoEnvio,
    });

    const newOrder: Order = {
      id: `ORD-${result.idPedido}`,
      date: new Date().toLocaleDateString("es-CO", {
        day: "numeric", month: "long", year: "numeric",
      }),
      items,
      total,
      status: "pendiente",
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [user?.token]);

  // ── Direcciones (wrapper sobre la API) ────────────────────────────────────────
  const addAddress = useCallback(async (addr: Omit<Address, "id">) => {
    if (!user?.token) return;
    const nueva = await API.crearDireccion(user.token, {
      descripcionDireccion: addr.fullAddress,
      descripcionMunicipio: addr.city.split(",")[0]?.trim() ?? addr.city,
      descripcionDepartamento: addr.city.split(",")[1]?.trim() ?? "",
      etiqueta: addr.label || "Casa",
      telefonoContacto: addr.phone || undefined,
      esPrincipal: addr.isDefault,
    });
    setApiAddresses((prev) => [...prev, nueva]);
  }, [user?.token]);

  const updateAddress = useCallback(async (addr: Address) => {
    if (!user?.token || !addr.idDireccion) return;
    // Usar PATCH real del backend
    const updated = await API.actualizarDireccion(user.token, addr.idDireccion, {
      descripcionDireccion: addr.fullAddress,
      descripcionMunicipio: addr.city.split(",")[0]?.trim() ?? addr.city,
      descripcionDepartamento: addr.city.split(",")[1]?.trim() ?? "",
      esPrincipal: addr.isDefault,
    });
    setApiAddresses((prev) =>
      prev.map((a) => (a.idDireccion === addr.idDireccion ? updated : a))
    );
  }, [user?.token]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!user?.token) return;
    const addr = apiAddresses.find((a) => String(a.idDireccion) === id);
    if (!addr) return;
    await API.eliminarDireccion(user.token, addr.idDireccion);
    setApiAddresses((prev) => prev.filter((a) => String(a.idDireccion) !== id));
  }, [user?.token, apiAddresses]);

  // ── Métodos de pago (local) ────────────────────────────────────────────────────
  const addPayment = useCallback(async (p: Omit<PaymentMethod, "id">) => {
    const newP: PaymentMethod = { ...p, id: Date.now().toString() };
    setPayments((prev) => p.isDefault
      ? [newP, ...prev.map((x) => ({ ...x, isDefault: false }))]
      : [...prev, newP]
    );
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
      isLoadingOrders, isLoadingAddresses,
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
