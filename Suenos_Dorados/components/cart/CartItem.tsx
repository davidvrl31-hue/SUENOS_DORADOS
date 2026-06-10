import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { CartItem as CartItemType } from "../../context/CartContext";
import { fmt } from "../../utils/format";

interface CartItemProps {
    item: CartItemType;
    onUpdateQty: (id: string, delta: number) => void;
}

const CartItem = memo(function CartItem({ item, onUpdateQty }: CartItemProps) {
    const handleDecrease = useCallback(() => onUpdateQty(item.id, -1), [item.id, onUpdateQty]);
    const handleIncrease = useCallback(() => onUpdateQty(item.id, 1), [item.id, onUpdateQty]);

    return (
        <View style={s.card}>
            <Image source={{ uri: item.image }} style={s.thumb} resizeMode="cover" />
            <View style={s.flex}>
                <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                <Text style={s.price}>{fmt(item.price)}</Text>
                <Text style={s.subtotal}>Subtotal: {fmt(item.price * item.qty)}</Text>
            </View>
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
                <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={handleIncrease}
                    accessibilityLabel="Aumentar cantidad"
                    accessibilityRole="button"
                >
                    <Feather name="plus" size={14} color={COLORS.text} />
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
    thumb: { width: 68, height: 68, borderRadius: RADIUS.md, backgroundColor: COLORS.amber },
    name: { fontSize: 13, fontWeight: "700", color: COLORS.text, lineHeight: 18, marginBottom: 2 },
    price: { fontSize: 14, fontWeight: "800", color: COLORS.orange },
    subtotal: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
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
    qtyTxt: { fontSize: 15, fontWeight: "800", color: COLORS.text, minWidth: 20, textAlign: "center" },
});
