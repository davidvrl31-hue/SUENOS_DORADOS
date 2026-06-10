import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Omit<CartItem, "qty">) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "@cart";
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Cargar desde AsyncStorage al montar
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) setItems(JSON.parse(stored));
            } catch { }
        })();
    }, []);

    // Persistir cada vez que cambia
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => { });
    }, [items]);

    const addItem = useCallback((product: Omit<CartItem, "qty">) => {
        setItems((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) {
                return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQty = useCallback((id: string, delta: number) => {
        setItems((prev) =>
            prev
                .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
                .filter((i) => i.qty > 0)
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
    const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}