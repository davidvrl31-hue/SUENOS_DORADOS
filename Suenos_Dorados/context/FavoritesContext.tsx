import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FavoriteItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    toggleFavorite: (product: FavoriteItem) => void;
    isFavorite: (id: string) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "@favorites";
const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) setFavorites(JSON.parse(stored));
            } catch { }
        })();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => { });
    }, [favorites]);

    const toggleFavorite = useCallback((product: FavoriteItem) => {
        setFavorites((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            return exists ? prev.filter((i) => i.id !== product.id) : [...prev, product];
        });
    }, []);

    const isFavorite = useCallback(
        (id: string) => favorites.some((i) => i.id === id),
        [favorites]
    );

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
    return ctx;
}