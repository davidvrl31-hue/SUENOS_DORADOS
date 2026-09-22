import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { ProductoUI, useProducts } from "../../context/ProductsContext";
import { fmt, pct } from "../../utils/format";
import { useToast } from "./Toast";

type AnyProduct = {
    id: string;
    name: string;
    desc?: string;
    price: number;
    originalPrice?: number;
    badge?: string;
    image: string;
    category?: string;
    accent?: string;
    cardBg?: string;
};

interface Props {
    product: AnyProduct | ProductoUI;
    variant?: "featured" | "grid" | "list";
}

// ─── Color del corazón — ROJO cuando es favorito, igual que en web ────────────
const FAV_RED   = "#EF4444";
const FAV_BG    = "#FFF1F2";
const FAV_BORDER = "#FECDD3";

const ProductCard = memo(function ProductCard({ product, variant = "featured" }: Props) {
    const { addItem, items }          = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { getVariantesByProducto }  = useProducts();
    const { showToast }               = useToast();
    const fav = isFavorite(product.id);

    // Stock real de la primera variante disponible
    const idProducto    = Number(String(product.id).split("-")[0]);
    const variantes     = getVariantesByProducto(idProducto);
    const stockTotal    = variantes.reduce((s, v) => s + v.stock, 0);
    const agotado       = variantes.length > 0 && stockTotal === 0;

    // ── Navegar al detalle del producto ──────────────────────────────────────
    const handlePress = useCallback(() => {
        const parts     = String(product.id).split("-");
        const idProducto = parts[0];
        const idVariante = parts[1] || "";
        router.push({
            pathname: "/product/[id]",
            params: { id: idProducto, variante: idVariante }
        });
    }, [product.id]);

    // ── Agregar al carrito con validación de stock ────────────────────────────
    const handleAddToCart = useCallback(() => {
        const idProducto = Number(String(product.id).split("-")[0]);
        const variantes  = getVariantesByProducto(idProducto);

        // Primera variante con stock > 0
        const primeraVariante = variantes.find((v) => v.stock > 0) ?? variantes[0];

        if (!primeraVariante || primeraVariante.stock <= 0) {
            showToast("Este producto está agotado", "error");
            return;
        }

        const idVariante = primeraVariante.idVariante;
        const itemKey    = `${idProducto}-${idVariante}`;

        // Verificar cuántas unidades ya hay en el carrito
        const enCarrito = items.find((i) => i.idVariante === idVariante)?.qty ?? 0;
        if (enCarrito >= primeraVariante.stock) {
            showToast(
                `Solo hay ${primeraVariante.stock} unidad${primeraVariante.stock === 1 ? "" : "es"} disponibles`,
                "error"
            );
            return;
        }

        addItem({
            id:              itemKey,
            name:            product.name,
            price:           product.price,
            image:           product.image,
            idVariante,
            stockDisponible: primeraVariante.stock,   // ← límite real
        });

        showToast(`${product.name} agregado al carrito 🛒`);
    }, [addItem, items, product, getVariantesByProducto, showToast]);

    // ── Toggle favorito ──────────────────────────────────────────────────────
    const handleToggleFavorite = useCallback(() => {
        toggleFavorite({
            id:            product.id,
            name:          product.name,
            price:         product.price,
            originalPrice: product.originalPrice,
            image:         product.image,
        });
        showToast(
            fav ? "Eliminado de favoritos" : "Agregado a favoritos ❤️",
            fav ? "info" : "success",
        );
    }, [toggleFavorite, product, fav, showToast]);

    // ────────────────────────────────────────────────────────────────────────
    // VARIANTS
    // ────────────────────────────────────────────────────────────────────────

    // ── Featured (horizontal scroll) ────────────────────────────────────────
    if (variant === "featured") {
        return (
            <TouchableOpacity style={s.featCard} onPress={handlePress} activeOpacity={0.9}>
                <View style={[s.featImg, { backgroundColor: product.cardBg ?? COLORS.amber }]}>
                    <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    {product.badge && (
                        <View style={s.badge}>
                            <Text style={s.badgeTxt}>{product.badge}</Text>
                        </View>
                    )}
                    {agotado && (
                        <View style={s.agotadoBadge}>
                            <Text style={s.agotadoBadgeTxt}>Agotado</Text>
                        </View>
                    )}
                    {/* Corazón rojo */}
                    <TouchableOpacity
                        style={[s.favBtn, fav && s.favBtnActive]}
                        onPress={handleToggleFavorite}
                        accessibilityLabel={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                        accessibilityRole="button"
                    >
                        {fav ? (
                            <View style={s.heartContainer}>
                                <Feather name="heart" size={16} color={FAV_RED} style={s.heartOutline} />
                                <Feather name="heart" size={14} color={FAV_RED} style={s.heartInner} />
                                <Feather name="heart" size={12} color={FAV_RED} style={s.heartCore} />
                            </View>
                        ) : (
                            <Feather name="heart" size={16} color={COLORS.mutedDark} />
                        )}
                    </TouchableOpacity>
                </View>
                <View style={s.featBody}>
                    <Text style={s.featName} numberOfLines={2}>{product.name}</Text>
                    <Text style={s.featDesc} numberOfLines={1}>{product.desc}</Text>
                    <View style={s.priceRow}>
                        <Text style={s.priceSale}>{fmt(product.price)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[s.addBtn, agotado && s.addBtnDisabled]}
                        onPress={handleAddToCart}
                        disabled={agotado}
                        activeOpacity={0.85}
                        accessibilityLabel={`Agregar ${product.name} al carrito`}
                        accessibilityRole="button"
                    >
                        <Feather name="shopping-cart" size={13} color="#fff" />
                        <Text style={s.addBtnTxt}>{agotado ? "Agotado" : "Agregar"}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    // ── Grid (explore 2 col) ─────────────────────────────────────────────────
    if (variant === "grid") {
        return (
            <TouchableOpacity style={s.gridCard} onPress={handlePress} activeOpacity={0.9}>
                <View style={s.gridImgWrap}>
                    <Image source={{ uri: product.image }} style={s.gridImg} resizeMode="cover" />
                    {/* Corazón rojo */}
                    <TouchableOpacity
                        style={[s.favBtnGrid, fav && s.favBtnActive]}
                        onPress={handleToggleFavorite}
                        accessibilityLabel={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                        accessibilityRole="button"
                    >
                        {fav ? (
                            <View style={s.heartContainer}>
                                <Feather name="heart" size={15} color={FAV_RED} style={s.heartOutline} />
                                <Feather name="heart" size={13} color={FAV_RED} style={s.heartInner} />
                                <Feather name="heart" size={11} color={FAV_RED} style={s.heartCore} />
                            </View>
                        ) : (
                            <Feather name="heart" size={15} color={COLORS.mutedDark} />
                        )}
                    </TouchableOpacity>
                </View>
                <View style={s.gridBody}>
                    <Text style={s.catTxt}>{product.category}</Text>
                    <Text style={s.gridName} numberOfLines={2}>{product.name}</Text>
                    <Text style={s.priceSale}>{fmt(product.price)}</Text>
                    <TouchableOpacity
                        style={[s.addBtnSm, agotado && s.addBtnDisabled]}
                        onPress={handleAddToCart}
                        disabled={agotado}
                        activeOpacity={0.85}
                        accessibilityLabel={`Agregar ${product.name} al carrito`}
                        accessibilityRole="button"
                    >
                        <Feather name="shopping-cart" size={12} color="#fff" />
                        <Text style={s.addBtnSmTxt}>{agotado ? "Agotado" : "Agregar"}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    // ── List (recent) — el que tiene el botón + ──────────────────────────────
    return (
        <TouchableOpacity style={s.listCard} onPress={handlePress} activeOpacity={0.85}>
            <View style={s.listThumb}>
                <Image
                    source={{ uri: product.image }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                    borderRadius={12}
                />
            </View>
            <View style={s.flex}>
                <Text style={s.listName}>{product.name}</Text>
                <View style={s.priceRow}>
                    <Text style={s.priceSale}>{fmt(product.price)}</Text>
                </View>
            </View>
            {/* Botón + con validación de stock */}
            <TouchableOpacity
                style={[s.plusBtn, agotado && s.addBtnDisabled]}
                onPress={handleAddToCart}
                disabled={agotado}
                accessibilityLabel={`Agregar ${product.name} al carrito`}
                accessibilityRole="button"
            >
                <Feather name={agotado ? "x" : "plus"} size={18} color={agotado ? COLORS.muted : COLORS.orange} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
});

export default ProductCard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    flex: { flex: 1 },

    // Featured
    featCard: {
        width: 186,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    featImg: {
        height: 150,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    badge: {
        position: "absolute", top: 10, left: 10,
        backgroundColor: "rgba(255,255,255,0.92)",
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, zIndex: 1,
    },
    badgeTxt: { fontSize: 10, fontWeight: "700", color: COLORS.text },
    pctBadge: {
        position: "absolute", top: 10, right: 36,
        paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, zIndex: 1,
    },
    pctTxt: { fontSize: 10, fontWeight: "800", color: "#fff" },
    favBtn: {
        position: "absolute", bottom: 10, right: 10,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#FFFFFF",
        alignItems: "center", justifyContent: "center",
        borderWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
    },
    // Corazón activo: fondo rosado suave, sin borde, icono rojo
    favBtnActive: { 
        backgroundColor: "#FFF1F2",
        shadowOpacity: 0.15,
    },
    heartContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
    },
    heartOutline: {
        position: "absolute",
    },
    heartInner: {
        position: "absolute",
    },
    heartCore: {
        position: "absolute",
    },

    featBody: { padding: 13, flex: 1, justifyContent: "space-between" },
    featName: { fontSize: 13, fontWeight: "700", color: COLORS.text, lineHeight: 18, marginBottom: 2 },
    featDesc: { fontSize: 11, color: COLORS.muted, marginBottom: 8 },
    addBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 6, marginTop: 4, backgroundColor: COLORS.orange, borderRadius: 9, paddingVertical: 9,
    },
    addBtnTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
    addBtnDisabled: { backgroundColor: COLORS.mutedDark, opacity: 0.5 },
    agotadoBadge: {
        position: "absolute", top: 10, left: 10,
        backgroundColor: "#FEE2E2", borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3, zIndex: 2,
    },
    agotadoBadgeTxt: { fontSize: 10, fontWeight: "700", color: "#C62828" },

    // Grid
    gridCard: {
        flex: 1, backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg, overflow: "hidden",
        borderWidth: 1, borderColor: COLORS.border, minHeight: 260,
    },
    gridImgWrap: { position: "relative" },
    gridImg: { width: "100%", height: 130 },
    favBtnGrid: {
        position: "absolute", top: 8, right: 8,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: "#FFFFFF",
        alignItems: "center", justifyContent: "center",
        borderWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gridBody: { padding: 10, flex: 1, justifyContent: "space-between" },
    catTxt: {
        fontSize: 10, color: COLORS.muted, fontWeight: "600",
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
    },
    gridName: {
        fontSize: 13, fontWeight: "700", color: COLORS.text,
        lineHeight: 17, marginBottom: 6, minHeight: 34,
    },
    addBtnSm: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 5, backgroundColor: COLORS.orange,
        paddingHorizontal: 10, paddingVertical: 7,
        borderRadius: 8, marginTop: 6, minHeight: 34,
    },
    addBtnSmTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },

    // List
    listCard: {
        flexDirection: "row", alignItems: "center", gap: 13,
        backgroundColor: COLORS.card,
        borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 13,
    },
    listThumb: {
        width: 48, height: 48,
        borderRadius: RADIUS.md, backgroundColor: COLORS.amber, overflow: "hidden",
    },
    listName: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 4 },
    plusBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: COLORS.amber,
        borderWidth: 1, borderColor: COLORS.amberBorder,
        alignItems: "center", justifyContent: "center",
    },

    // Shared
    priceRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 2 },
    priceSale: { fontSize: 14, fontWeight: "800", color: COLORS.orange },
    priceOrig: { fontSize: 12, color: COLORS.muted, textDecorationLine: "line-through" },
});
