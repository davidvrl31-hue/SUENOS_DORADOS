import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useOrders } from "./OrdersContext";
import { API } from "../services/api.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
    id: string;           // formato "idProducto-idVariante"
    name: string;
    price: number;
    qty: number;
    image: string;
    idVariante?: number;
    /** Stock disponible al momento de agregar — usado para validar límites */
    stockDisponible?: number;
}

interface CartContextType {
    items: CartItem[];
    /**
     * Agrega o incrementa un ítem respetando el stock.
     * Si qty + 1 > stockDisponible, no hace nada.
     */
    addItem: (product: Omit<CartItem, "qty">) => void;
    /**
     * Reemplaza la variante de un ítem existente.
     * Elimina el ítem con oldVarianteId y agrega el nuevo.
     * Si el nuevo ya existe, actualiza precio/nombre en lugar de duplicar.
     */
    replaceItem: (oldVarianteId: number | undefined, product: Omit<CartItem, "qty">) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "@cart";
const CartContext = createContext<CartContextType | null>(null);

function extractIdVariante(item: CartItem): number | null {
    if (item.idVariante && item.idVariante > 0) return item.idVariante;
    const parts = item.id.split("-");
    if (parts.length > 1) {
        const parsed = Number(parts[1]);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { user } = useAuth();
    const { stockMap } = useOrders();

    // Sincronizar stockDisponible con el mapa en tiempo real del WebSocket
    useEffect(() => {
        if (Object.keys(stockMap).length === 0) return;
        setItems((prev) =>
            prev.map((item) => {
                if (!item.idVariante) return item;
                const nuevoStock = stockMap[item.idVariante];
                if (nuevoStock === undefined) return item;
                return { ...item, stockDisponible: nuevoStock };
            })
        );
    }, [stockMap]);

    const buildPayload = useCallback((cartItems: CartItem[]) => {
        return cartItems
            .map((i) => ({ idVariante: extractIdVariante(i), quantity: i.qty }))
            .filter((p): p is { idVariante: number; quantity: number } =>
                p.idVariante !== null && p.idVariante > 0
            );
    }, []);

    const syncCart = useCallback(async (token: string, localItems: CartItem[]) => {
        try {
            const dbCart = await API.getCarrito(token);
            const mappedDb: CartItem[] = dbCart.map((i: any) => ({
                id: `${i.id}-${i.idVariante}`,
                name: i.name,
                price: Number(i.price),
                qty: Number(i.quantity),
                image: i.image?.trim() || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
                idVariante: Number(i.idVariante),
            }));

            // BD tiene prioridad. Solo agregar ítems locales ausentes en BD (offline additions)
            const merged = [...mappedDb];
            for (const localItem of localItems) {
                const localVariante = extractIdVariante(localItem);
                const existsIdx = merged.findIndex((i) => {
                    const dbVariante = extractIdVariante(i);
                    return localVariante !== null && dbVariante === localVariante;
                });
                if (existsIdx === -1) {
                    // Solo existe en local → agregar para subir a BD
                    merged.push(localItem);
                }
                // Si existe en BD → BD tiene prioridad, no sobreescribir
            }

            const payload = buildPayload(merged);
            if (payload.length > 0) {
                const finalDb = await API.guardarCarrito(token, payload);
                const finalMapped: CartItem[] = finalDb.map((i: any) => ({
                    id: `${i.id}-${i.idVariante}`,
                    name: i.name,
                    price: Number(i.price),
                    qty: Number(i.quantity),
                    image: i.image?.trim() || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
                    idVariante: Number(i.idVariante),
                }));
                setItems(finalMapped);
            } else if (mappedDb.length > 0) {
                setItems(mappedDb);
            } else {
                setItems(merged);
            }
        } catch {
            // fallback silencioso — mantener estado local
        }
    }, [buildPayload]);

    const updateDBCart = useCallback(async (token: string, updatedItems: CartItem[]) => {
        try {
            const payload = buildPayload(updatedItems);
            if (payload.length === 0) {
                // Carrito vacío → limpiar en BD explícitamente
                await API.vaciarCarrito(token);
                return;
            }
            await API.guardarCarrito(token, payload);
        } catch { }
    }, [buildPayload]);

    // ── Cargar desde AsyncStorage al montar ──
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((stored) => {
                const localItems: CartItem[] = stored ? JSON.parse(stored) : [];
                setItems(localItems);
            })
            .catch(() => { });
    }, []); // eslint-disable-line

    // ── Sincronizar con BD cuando hay sesión ──
    useEffect(() => {
        if (!user?.token) return;
        AsyncStorage.getItem(STORAGE_KEY)
            .then(async (stored) => {
                const localItems: CartItem[] = stored ? JSON.parse(stored) : [];
                await syncCart(user.token, localItems);
            })
            .catch(() => { });
    }, [user?.token, syncCart]);

    // ── Persistir localmente ──
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => { });
    }, [items]);

    // ── addItem: respeta el stock ──────────────────────────────────────────
    const addItem = useCallback((product: Omit<CartItem, "qty">) => {
        setItems((prev) => {
            const existsIdx = prev.findIndex((i) => {
                if (product.idVariante && i.idVariante) return i.idVariante === product.idVariante;
                return i.id === product.id;
            });

            let updated: CartItem[];

            if (existsIdx !== -1) {
                const existing  = prev[existsIdx];
                const stockMax  = product.stockDisponible ?? existing.stockDisponible ?? Infinity;
                const newQty    = existing.qty + 1;
                // No superar el stock disponible
                if (newQty > stockMax) return prev;
                updated = prev.map((i, idx) =>
                    idx === existsIdx ? { ...i, qty: newQty, stockDisponible: product.stockDisponible ?? i.stockDisponible } : i
                );
            } else {
                updated = [...prev, { ...product, qty: 1 }];
            }

            if (user?.token) updateDBCart(user.token, updated);
            return updated;
        });
    }, [user, updateDBCart]);

    // ── replaceItem: cambia variante sin duplicar ──────────────────────────
    /**
     * Elimina el ítem con oldVarianteId y agrega el nuevo.
     * Si el nuevo ya existe en el carrito, actualiza precio/nombre/stock.
     */
    const replaceItem = useCallback((
        oldVarianteId: number | undefined,
        product: Omit<CartItem, "qty">,
    ) => {
        setItems((prev) => {
            // Quitar el ítem anterior
            const sinAnterior = oldVarianteId !== undefined
                ? prev.filter((i) => i.idVariante !== oldVarianteId)
                : prev.filter((i) => i.id !== product.id);

            // Ver si la nueva variante ya existe
            const existsIdx = sinAnterior.findIndex((i) =>
                product.idVariante ? i.idVariante === product.idVariante : i.id === product.id
            );

            let updated: CartItem[];
            if (existsIdx !== -1) {
                // Ya existe — actualizar precio, nombre, stock
                updated = sinAnterior.map((i, idx) =>
                    idx === existsIdx
                        ? { ...i, name: product.name, price: product.price, stockDisponible: product.stockDisponible }
                        : i
                );
            } else {
                updated = [...sinAnterior, { ...product, qty: 1 }];
            }

            if (user?.token) updateDBCart(user.token, updated);
            return updated;
        });
    }, [user, updateDBCart]);

    const removeItem = useCallback((id: string) => {
        setItems((prev) => {
            const updated = prev.filter((i) => i.id !== id);
            if (user?.token) updateDBCart(user.token, updated);
            return updated;
        });
    }, [user, updateDBCart]);

    const updateQty = useCallback((id: string, delta: number) => {
        setItems((prev) => {
            const updated = prev
                .map((i) => {
                    if (i.id !== id) return i;
                    const newQty  = i.qty + delta;
                    const stockMax = i.stockDisponible ?? Infinity;
                    if (newQty <= 0) return null;                    // eliminar
                    if (newQty > stockMax) return i;                 // no superar stock
                    return { ...i, qty: newQty };
                })
                .filter((i): i is CartItem => i !== null);
            if (user?.token) updateDBCart(user.token, updated);
            return updated;
        });
    }, [user, updateDBCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        if (user?.token) updateDBCart(user.token, []);
    }, [user, updateDBCart]);

    const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
    const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

    return (
        <CartContext.Provider value={{ items, addItem, replaceItem, removeItem, updateQty, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
