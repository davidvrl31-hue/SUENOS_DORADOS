import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { API } from "../services/api.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FavoriteItem {
    id: string;          // idProducto como string (sin variante)
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    toggleFavorite: (product: FavoriteItem) => void;
    /**
     * Verifica si un producto es favorito.
     * Acepta tanto "idProducto" como "idProducto-idVariante".
     * Siempre compara por el idProducto (parte antes del guión).
     */
    isFavorite: (id: string) => boolean;
}

// ─── Helper: extraer el idProducto de una clave compuesta ─────────────────────
// "12-34" → "12"   |   "12" → "12"
function extractProductId(id: string): string {
    return String(id).split("-")[0];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "@favorites";
const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const { user } = useAuth();

    // ── Sincronizar con BD al iniciar sesión ──────────────────────────────────
    const syncFavorites = useCallback(async (token: string, localFavs: FavoriteItem[]) => {
        try {
            const dbFavs = await API.getFavoritos(token);

            // Mapear respuesta de BD al tipo FavoriteItem
            const mappedDb: FavoriteItem[] = dbFavs.map((f: any) => ({
                id:            String(f.id),    // idProducto como string
                name:          f.name,
                price:         Number(f.price),
                originalPrice: f.originalPrice ? Number(f.originalPrice) : undefined,
                image:         f.image || "",
            }));

            // Agregar favoritos locales ausentes en BD (añadidos offline)
            const merged = [...mappedDb];
            for (const local of localFavs) {
                const localProdId = extractProductId(local.id);
                const exists = merged.some((i) => extractProductId(i.id) === localProdId);
                if (!exists) merged.push({ ...local, id: localProdId });
            }

            // Si hay ítems locales nuevos, subir el merge a BD
            if (merged.length > mappedDb.length) {
                const ids = merged.map((i) => Number(extractProductId(i.id)));
                const finalDb = await API.guardarFavoritos(token, ids);
                const finalMapped: FavoriteItem[] = finalDb.map((f: any) => ({
                    id:            String(f.id),
                    name:          f.name,
                    price:         Number(f.price),
                    originalPrice: f.originalPrice ? Number(f.originalPrice) : undefined,
                    image:         f.image || "",
                }));
                setFavorites(finalMapped);
            } else {
                // BD es fuente de verdad — usar directamente
                setFavorites(mappedDb);
            }
        } catch {
            // fallback silencioso
        }
    }, []);

    const updateDBFavorites = useCallback(async (token: string, updatedFavs: FavoriteItem[]) => {
        try {
            const ids = updatedFavs.map((i) => Number(extractProductId(i.id)));
            await API.guardarFavoritos(token, ids);
        } catch { }
    }, []);

    // ── Efecto 1: Cargar desde AsyncStorage al montar ──
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((stored) => {
                if (stored) setFavorites(JSON.parse(stored));
            })
            .catch(() => { });
    }, []); // eslint-disable-line

    // ── Efecto 2: Sincronizar con BD cuando hay sesión ──
    useEffect(() => {
        if (!user?.token) return;
        AsyncStorage.getItem(STORAGE_KEY)
            .then(async (stored) => {
                const localFavs: FavoriteItem[] = stored ? JSON.parse(stored) : [];
                await syncFavorites(user.token, localFavs);
            })
            .catch(() => { });
    }, [user?.token, syncFavorites]);

    // ── Persistir localmente ante cualquier cambio ──
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => { });
    }, [favorites]);

    // ── Toggle favorito ───────────────────────────────────────────────────────
    const toggleFavorite = useCallback((product: FavoriteItem) => {
        // Normalizar: siempre guardar el idProducto sin variante
        const normalizedId = extractProductId(product.id);
        const normalizedProduct = { ...product, id: normalizedId };

        setFavorites((prev) => {
            const exists  = prev.some((i) => extractProductId(i.id) === normalizedId);
            const updated = exists
                ? prev.filter((i) => extractProductId(i.id) !== normalizedId)
                : [...prev, normalizedProduct];

            if (user?.token) updateDBFavorites(user.token, updated);
            return updated;
        });
    }, [user, updateDBFavorites]);

    // ── isFavorite: compara siempre por idProducto ────────────────────────────
    const isFavorite = useCallback(
        (id: string) => {
            const prodId = extractProductId(id);
            return favorites.some((i) => extractProductId(i.id) === prodId);
        },
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
