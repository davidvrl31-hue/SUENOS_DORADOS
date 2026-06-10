"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  slug?: string;
  descripcion?: string;
}

export interface CartItem extends Product {
  quantity: number;
  idVariante?: number;
  sku?: string;
}

export interface Address {
  id: number;
  label: string;
  address: string;
  city: string;
  phone: string;
  isMain: boolean;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: "entregado" | "en camino" | "pendiente" | "en_proceso" | "cancelado";
  items: OrderItem[];
  total: number;
}

export interface User {
  idUsuario: number;
  name: string;
  email: string;
  apellido: string;
  telefono?: string | null;
  idRol: number;
  token: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "promo" | "delivery" | "app";
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (p: Product, idVariante?: number, sku?: string) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  favorites: Product[];
  toggleFavorite: (p: Product) => void;
  orders: Order[];
  loadOrders: () => Promise<void>;
  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: number) => void;
  notifications: Notification[];
  isLoadingOrders: boolean;
}

// ─── Notificaciones de muestra ────────────────────────────────────────────────

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "¡Bienvenido a Sueños Dorados!",
    message: "Explora nuestra colección y encuentra el descanso que mereces.",
    time: "Ahora",
    read: false,
    type: "app",
  },
  {
    id: 2,
    title: "¡Oferta especial!",
    message: "20% de descuento en toda la colección de edredones este fin de semana.",
    time: "Hace 2 horas",
    read: false,
    type: "promo",
  },
  {
    id: 3,
    title: "Envío gratis disponible",
    message: "Agrega más productos a tu carrito y obtén envío gratis.",
    time: "Hace 2 días",
    read: true,
    type: "promo",
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Rehidratar sesión desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sd_user");
      const savedCart = localStorage.getItem("sd_cart");
      const savedFavs = localStorage.getItem("sd_favorites");
      const savedAddresses = localStorage.getItem("sd_addresses");

      if (saved) setUserState(JSON.parse(saved));
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
    } catch {
      // Si falla localStorage, continuar sin datos previos
    }
  }, []);

  // Persistir carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("sd_cart", JSON.stringify(cart));
  }, [cart]);

  // Persistir favoritos
  useEffect(() => {
    localStorage.setItem("sd_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Persistir direcciones
  useEffect(() => {
    localStorage.setItem("sd_addresses", JSON.stringify(addresses));
  }, [addresses]);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("sd_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("sd_user");
    }
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
  };

  // ── Carrito ────────────────────────────────────────────────────────────────

  const addToCart = (p: Product, idVariante?: number, sku?: string) => {
    setCart((prev) => {
      const key = idVariante ?? p.id;
      const existing = prev.find((i) => (i.idVariante ?? i.id) === key);
      if (existing) {
        return prev.map((i) =>
          (i.idVariante ?? i.id) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...p, quantity: 1, idVariante, sku }];
    });
  };

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  // ── Favoritos ──────────────────────────────────────────────────────────────

  const toggleFavorite = (p: Product) => {
    setFavorites((prev) =>
      prev.find((i) => i.id === p.id)
        ? prev.filter((i) => i.id !== p.id)
        : [...prev, p]
    );
  };

  // ── Pedidos (desde la API) ─────────────────────────────────────────────────

  const loadOrders = async () => {
    if (!user?.token) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${user.token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = await res.json();
      const mapped: Order[] = data.map((p) => ({
        id: `ORD-${p.idPedido}`,
        date: new Date(p.fechaPedido).toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        status: p.estadoPedido as Order["status"],
        items: p.detalles?.map((d: { nombreProducto: string; precioUnitario: number; cantidad: number }) => ({
          name: d.nombreProducto,
          price: Number(d.precioUnitario),
          quantity: d.cantidad,
        })) ?? [],
        total: Number(p.total),
      }));
      setOrders(mapped);
    } catch {
      // silencioso
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Cargar pedidos automáticamente cuando el usuario inicia sesión
  useEffect(() => {
    if (user?.token) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  // ── Direcciones (local por ahora) ──────────────────────────────────────────

  const addAddress = (a: Omit<Address, "id">) => {
    setAddresses((prev) => [...prev, { ...a, id: Date.now() }]);
  };

  const removeAddress = (id: number) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <AppContext.Provider
      value={{
        user, setUser, logout,
        cart, addToCart, removeFromCart, updateQty, clearCart,
        favorites, toggleFavorite,
        orders, loadOrders, isLoadingOrders,
        addresses, addAddress, removeAddress,
        notifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
