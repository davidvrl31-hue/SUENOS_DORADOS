"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  /** Stock disponible al momento de agregar — usado para validar límites */
  stockDisponible?: number;
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
  /**
   * Agrega un producto al carrito respetando el stock.
   * Si ya existe la misma variante, incrementa cantidad (hasta el stock disponible).
   * @param redirectToCart Si es true, navega a /carrito después de agregar
   */
  addToCart: (p: Product, idVariante?: number, sku?: string, redirectToCart?: boolean) => Promise<void>;
  /**
   * Reemplaza la variante de un ítem existente.
   * Elimina el ítem anterior (misma variante) y agrega el nuevo.
   * Útil cuando el usuario cambia medida/color en el detalle del producto.
   */
  replaceCartItem: (oldVarianteId: number | undefined, p: Product, newVarianteId?: number, sku?: string) => Promise<void>;
  removeFromCart: (id: number, idVariante?: number) => void;
  updateQty: (id: number, qty: number, idVariante?: number) => void;
  clearCart: () => void;
  favorites: Product[];
  toggleFavorite: (p: Product) => void;
  orders: Order[];
  loadOrders: () => Promise<void>;
  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: number) => void;
  /** Notificaciones reales — vacías hasta que el backend las implemente */
  notifications: Notification[];
  isLoadingOrders: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUserState] = useState<User | null>(null);
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Notificaciones: array vacío — sin mocks.
  // Se llenará cuando el backend implemente el módulo de notificaciones reales.
  const [notifications] = useState<Notification[]>([]);

  // ── Helpers de persistencia en BD ─────────────────────────────────────────

  const buildCartPayload = (items: CartItem[]) =>
    items
      .map((item) => ({ idVariante: item.idVariante, quantity: item.quantity }))
      .filter((p): p is { idVariante: number; quantity: number } =>
        typeof p.idVariante === "number" && p.idVariante > 0 && p.quantity > 0
      );

  const updateDBCart = useCallback(async (token: string, updatedCart: CartItem[]) => {
    try {
      const payload = buildCartPayload(updatedCart);
      // Si el carrito está vacío, llamar DELETE para limpiar la BD
      if (payload.length === 0) {
        await fetch(`${API_URL}/usuarios/carrito`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        return;
      }
      await fetch(`${API_URL}/usuarios/carrito`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: payload }),
      });
    } catch { /* noop */ }
  }, []);

  const updateDBFavorites = useCallback(async (token: string, updatedFavs: Product[]) => {
    try {
      await fetch(`${API_URL}/usuarios/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: updatedFavs.map((f) => f.id) }),
      });
    } catch { /* noop */ }
  }, []);

  /**
   * syncCart — BD es fuente de verdad para dispositivos múltiples.
   * Estrategia: BD tiene prioridad. Los ítems locales que no están en BD
   * se agregan (pueden ser ítems sin sesión añadidos offline).
   * El stock real se respeta: si la BD devuelve qty > stock, se corrige.
   */
  const syncCart = useCallback(async (token: string, currentCart: CartItem[]) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/carrito`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setCart(currentCart); return; }

      // La BD devuelve ítems con stock ya validado por el backend
      const dbCart: CartItem[] = await res.json();

      // Agregar ítems locales que no están en BD (offline additions)
      const merged = [...dbCart];
      for (const localItem of currentCart) {
        const key = localItem.idVariante ?? localItem.id;
        const idx = merged.findIndex((i) => (i.idVariante ?? i.id) === key);
        if (idx === -1) {
          // Ítem solo en local → agregar al merge para subirlo a BD
          merged.push(localItem);
        }
        // Si ya existe en BD, la BD tiene prioridad — no sobreescribir
      }

      // Subir el merge a la BD (el backend valida stock y devuelve el estado real)
      const payload = buildCartPayload(merged);
      if (payload.length > 0) {
        const saveRes = await fetch(`${API_URL}/usuarios/carrito`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: payload }),
        });
        if (saveRes.ok) {
          // Usar la respuesta de BD como estado definitivo
          const saved: CartItem[] = await saveRes.json();
          setCart(saved);
          return;
        }
      } else if (dbCart.length > 0) {
        // No hay ítems locales pero sí en BD → usar BD
        setCart(dbCart);
        return;
      }

      setCart(merged);
    } catch { setCart(currentCart); }
  }, []);

  const syncFavorites = useCallback(async (token: string, currentFavs: Product[]) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/favoritos`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      // BD es fuente de verdad para favoritos entre dispositivos
      const dbFavs: Product[] = await res.json();
      // Agregar favoritos locales que no están en BD (offline)
      const merged = [...dbFavs];
      for (const local of currentFavs) {
        if (!merged.some((f) => f.id === local.id)) merged.push(local);
      }
      // Si el merge es igual a la BD, no volver a escribir
      if (merged.length > dbFavs.length) {
        const saveRes = await fetch(`${API_URL}/usuarios/favoritos`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ids: merged.map((f) => f.id) }),
        });
        if (saveRes.ok) { setFavorites(await saveRes.json()); return; }
      }
      setFavorites(dbFavs);
    } catch { /* noop */ }
  }, []);

  // ── Rehidratación ─────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved          = localStorage.getItem("sd_user");
      const savedCart      = localStorage.getItem("sd_cart");
      const savedFavs      = localStorage.getItem("sd_favorites");
      const savedAddresses = localStorage.getItem("sd_addresses");

      let currentCart: CartItem[]  = [];
      let currentFavs: Product[]   = [];
      let currentUser: User | null = null;

      if (saved)          { currentUser = JSON.parse(saved);    setUserState(currentUser); }
      if (savedCart)      { currentCart = JSON.parse(savedCart); setCart(currentCart); }
      if (savedFavs)      { currentFavs = JSON.parse(savedFavs); setFavorites(currentFavs); }
      if (savedAddresses) setAddresses(JSON.parse(savedAddresses));

      if (currentUser?.token) {
        syncCart(currentUser.token, currentCart);
        syncFavorites(currentUser.token, currentFavs);
      }
    } catch { /* noop */ }
  }, []); // eslint-disable-line

  useEffect(() => { localStorage.setItem("sd_cart",      JSON.stringify(cart));      }, [cart]);
  useEffect(() => { localStorage.setItem("sd_favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("sd_addresses", JSON.stringify(addresses)); }, [addresses]);

  // ── Autenticación ─────────────────────────────────────────────────────────

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("sd_user", JSON.stringify(u));
      syncCart(u.token, cart);
      syncFavorites(u.token, favorites);
    } else {
      localStorage.removeItem("sd_user");
    }
  }, [cart, favorites, syncCart, syncFavorites]);

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
    setFavorites([]);
    setOrders([]);
  }, [setUser]);

  // ── Resolución de variante desde la API ───────────────────────────────────

  const resolveVariante = async (productId: number): Promise<{
    idVariante: number;
    sku: string;
    stock: number;
    precio: number;
  } | null> => {
    try {
      const res = await fetch(`${API_URL}/variantes-producto?idProducto=${productId}`);
      if (!res.ok) return null;
      const vars: { idVariante: number; stock: number; sku: string; estado: boolean; precio: number }[] = await res.json();
      const activas    = vars.filter((v) => v.estado);
      const conStock   = activas.find((v) => v.stock > 0) ?? activas[0] ?? null;
      return conStock
        ? { idVariante: conStock.idVariante, sku: conStock.sku, stock: conStock.stock, precio: Number(conStock.precio) }
        : null;
    } catch { return null; }
  };

  // ── CARRITO ───────────────────────────────────────────────────────────────

  /**
   * Agrega al carrito respetando el stock disponible.
   * - Si ya existe la misma variante, incrementa hasta el límite de stock.
   * - Si no existe, crea un ítem nuevo.
   * - Si redirectToCart=true, navega a /carrito.
   */
  const addToCart = useCallback(async (
    p: Product,
    idVariante?: number,
    sku?: string,
    redirectToCart = false,
  ) => {
    let resolvedVariante     = idVariante;
    let resolvedSku          = sku;
    let resolvedStock: number | undefined;

    // Si no viene la variante, resolverla desde la API
    if (!resolvedVariante) {
      const resolved = await resolveVariante(p.id);
      if (resolved) {
        resolvedVariante  = resolved.idVariante;
        resolvedSku       = resolved.sku;
        resolvedStock     = resolved.stock;
      }
    }

    setCart((prev) => {
      const key     = resolvedVariante ?? p.id;
      const existsIdx = prev.findIndex((i) => (i.idVariante ?? i.id) === key);
      let updated: CartItem[];

      if (existsIdx !== -1) {
        // Ya existe: incrementar respetando el stock
        const existing     = prev[existsIdx];
        const stockMax     = resolvedStock ?? existing.stockDisponible ?? Infinity;
        const newQty       = existing.quantity + 1;
        if (newQty > stockMax) {
          // No superar el stock — no actualizar
          return prev;
        }
        updated = prev.map((i, idx) =>
          idx === existsIdx ? { ...i, quantity: newQty } : i
        );
      } else {
        // Nuevo ítem
        updated = [
          ...prev,
          {
            ...p,
            quantity:         1,
            idVariante:       resolvedVariante,
            sku:              resolvedSku,
            stockDisponible:  resolvedStock,
          },
        ];
      }

      if (user?.token) updateDBCart(user.token, updated);
      return updated;
    });

    if (redirectToCart) router.push("/carrito");
  }, [user, router, updateDBCart]);

  /**
   * Reemplaza un ítem del carrito con una nueva variante.
   * Elimina el ítem con oldVarianteId y agrega el nuevo.
   * Si el nuevo ya existe en el carrito, actualiza su cantidad en lugar de duplicar.
   */
  const replaceCartItem = useCallback(async (
    oldVarianteId: number | undefined,
    p: Product,
    newVarianteId?: number,
    sku?: string,
  ) => {
    setCart((prev) => {
      // Quitar el ítem anterior
      const sinAnterior = oldVarianteId !== undefined
        ? prev.filter((i) => i.idVariante !== oldVarianteId)
        : prev.filter((i) => i.id !== p.id);

      const newKey    = newVarianteId ?? p.id;
      const existsIdx = sinAnterior.findIndex((i) => (i.idVariante ?? i.id) === newKey);
      let updated: CartItem[];

      if (existsIdx !== -1) {
        // La nueva variante ya estaba en carrito — mantener cantidad existente
        updated = sinAnterior.map((i, idx) =>
          idx === existsIdx ? { ...i, price: p.price, sku } : i
        );
      } else {
        updated = [...sinAnterior, { ...p, quantity: 1, idVariante: newVarianteId, sku }];
      }

      if (user?.token) updateDBCart(user.token, updated);
      return updated;
    });

    router.push("/carrito");
  }, [user, router, updateDBCart]);

  const removeFromCart = useCallback((id: number, idVariante?: number) => {
    setCart((prev) => {
      const updated = prev.filter((i) => !(i.id === id && i.idVariante === idVariante));
      if (user?.token) updateDBCart(user.token, updated);
      return updated;
    });
  }, [user, updateDBCart]);

  const updateQty = useCallback((id: number, qty: number, idVariante?: number) => {
    if (qty <= 0) return removeFromCart(id, idVariante);
    setCart((prev) => {
      const updated = prev.map((i) => {
        if (i.id !== id || i.idVariante !== idVariante) return i;
        const maxQty = i.stockDisponible ?? Infinity;
        return { ...i, quantity: Math.min(qty, maxQty) };
      });
      if (user?.token) updateDBCart(user.token, updated);
      return updated;
    });
  }, [user, removeFromCart, updateDBCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (user?.token) {
      // DELETE explícito para limpiar la BD cuando el carrito está vacío
      fetch(`${API_URL}/usuarios/carrito`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      }).catch(() => {});
    }
  }, [user]);

  // ── FAVORITOS ────────────────────────────────────────────────────────────

  const toggleFavorite = useCallback((p: Product) => {
    setFavorites((prev) => {
      const isFav  = prev.some((i) => i.id === p.id);
      const updated = isFav ? prev.filter((i) => i.id !== p.id) : [...prev, p];
      if (user?.token) updateDBFavorites(user.token, updated);
      return updated;
    });
  }, [user, updateDBFavorites]);

  // ── PEDIDOS ───────────────────────────────────────────────────────────────

  const loadOrders = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${user.token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data: any[] = await res.json();
      const mapped: Order[] = data.map((p) => ({
        id:     `ORD-${p.idPedido ?? p.id_pedido}`,
        date:   new Date(p.fechaPedido ?? p.fecha_pedido).toLocaleDateString("es-CO", {
          day: "numeric", month: "long", year: "numeric",
        }),
        status: mapEstado(p.idEstadoPedido ?? p.id_estado_pedido),
        items:  (p.detalles ?? []).map((d: any) => ({
          name:     d.nombreProducto ?? `Variante #${d.idVariante ?? d.id_variante}`,
          price:    Number(d.precioUnitario ?? d.precio_unitario),
          quantity: Number(d.cantidad),
        })),
        total: Number(p.total),
      }));
      setOrders(mapped);
    } catch { /* silencioso */ }
    finally { setIsLoadingOrders(false); }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) loadOrders();
  }, [user?.token]); // eslint-disable-line

  // ── DIRECCIONES (local) ───────────────────────────────────────────────────

  const addAddress = useCallback((a: Omit<Address, "id">) => {
    setAddresses((prev) => [...prev, { ...a, id: Date.now() }]);
  }, []);

  const removeAddress = useCallback((id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        user, setUser, logout,
        cart, addToCart, replaceCartItem, removeFromCart, updateQty, clearCart,
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

// ── Helper: mapear id de estado a string legible ──────────────────────────────
function mapEstado(id: number): Order["status"] {
  switch (id) {
    case 1: return "pendiente";
    case 2: return "pendiente";   // Pagado → sigue en proceso
    case 3: return "cancelado";   // Rechazado
    case 4: return "en_proceso";  // Cancelado/Anulado
    case 5: return "en camino";   // Despachado
    case 6: return "entregado";
    default: return "pendiente";
  }
}
