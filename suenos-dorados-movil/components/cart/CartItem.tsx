import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { CartItem as CartItemType } from "../../context/CartContext";
import { useToast } from "../ui/Toast";
import { fmt } from "../../utils/format";

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

interface CartItemProps {
    item: CartItemType;
    onUpdateQty: (id: string, delta: number) => void;
}

const CartItem = memo(function CartItem({ item, onUpdateQty }: CartItemProps) {
    const { showToast } = useToast();

    const handleDecrease = useCallback(() => onUpdateQty(item.id, -1), [item.id, onUpdateQty]);

    // Al incrementar, verificar el límite de stock antes de llamar al contexto
    const handleIncrease = useCallback(() => {
        const stockMax = item.stockDisponible;
        if (stockMax !== undefined && item.qty >= stockMax) {
            showToast(
                `Solo hay ${stockMax} unidad${stockMax === 1 ? "" : "es"} disponibles en stock`,
                "error"
            );
            return;
        }
        onUpdateQty(item.id, 1);
    }, [item.id, item.qty, item.stockDisponible, onUpdateQty, showToast]);

    const parts      = item.id.split("-");
    const idProducto = parts[0];
    const idVariante = parts[1] ?? "";

    const handlePress = useCallback(() => {
        router.push({
            pathname: "/product/[id]",
            params: { id: idProducto, variante: idVariante },
        });
    }, [idProducto, idVariante]);

    const enLimiteStock = item.stockDisponible !== undefined && item.qty >= item.stockDisponible;

    return (
        <View style={s.card}>
            {/* Imagen */}
            <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
                <Image
                    source={{ uri: item.image?.trim() || PLACEHOLDER }}
                    style={s.thumb}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            {/* Info */}
            <TouchableOpacity style={s.flex} onPress={handlePress} activeOpacity={0.8}>
                <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                <Text style={s.price}>{fmt(item.price)}</Text>
                <Text style={s.subtotal}>Subtotal: {fmt(item.price * item.qty)}</Text>
                {/* Alerta de stock máximo alcanzado */}
                {enLimiteStock && (
                    <Text style={s.stockAlert}>
                        ⚠️ Máximo disponible: {item.stockDisponible}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Controles de cantidad */}
            <View style={s.qtyRow}>
                <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={handleDecrease}
                    accessibilityLabel={item.qty === 1 ? "Eliminar producto" : "Disminuir cantidad"}
                    accessibilityRole="button"
                >
                    <Feather
                        name={item.qty === 1 ? "trash-2" : "minus"}
                        size={14}
                        color={item.qty === 1 ? COLORS.red : COLORS.text}
                    />
                </TouchableOpacity>

                <Text style={s.qtyTxt}>{item.qty}</Text>

                {/* Botón + — se muestra atenuado cuando se alcanza el límite */}
                <TouchableOpacity
                    style={[s.qtyBtn, enLimiteStock && s.qtyBtnDisabled]}
                    onPress={handleIncrease}
                    accessibilityLabel="Aumentar cantidad"
                    accessibilityRole="button"
                >
                    <Feather
                        name="plus"
                        size={14}
                        color={enLimiteStock ? COLORS.muted : COLORS.text}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default CartItem;

const s = StyleSheet.create({
    flex: { flex: 1 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    thumb: {
        width: 68,
        height: 68,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.amber,
    },
    name:     { fontSize: 13, fontWeight: "700", color: COLORS.text, lineHeight: 18, marginBottom: 2 },
    price:    { fontSize: 14, fontWeight: "800", color: COLORS.orange },
    subtotal: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
    stockAlert: {
        fontSize: 11,
        color: "#D97706",
        fontWeight: "600",
        marginTop: 3,
    },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.amber,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    qtyBtnDisabled: {
        opacity: 0.4,
    },
    qtyTxt: {
        fontSize: 15,
        fontWeight: "800",
        color: COLORS.text,
        minWidth: 20,
        textAlign: "center",
    },
});
