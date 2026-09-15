import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { fmt } from "../../utils/format";

interface CartSummaryProps {
    subtotal: number;
    shipping: number;
    total: number;
}

const CartSummary = memo(function CartSummary({ subtotal, shipping, total }: CartSummaryProps) {
    const freeShippingRemaining = shipping > 0 ? 100000 - subtotal : 0;

    // Desglose de IVA (19% incluido en el precio)
    const baseImponible = Math.round(subtotal / 1.19);
    const iva           = Math.round(subtotal - baseImponible);

    return (
        <View style={s.summary}>
            <View style={s.row}>
                <Text style={s.summLabel}>Subtotal</Text>
                <Text style={s.summValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={s.row}>
                <Text style={s.summLabel}>Envío</Text>
                <Text style={[s.summValue, shipping === 0 && s.summValueFree]}>
                    {shipping === 0 ? "Gratis 🎉" : fmt(shipping)}
                </Text>
            </View>
            {freeShippingRemaining > 0 && (
                <Text style={s.hint}>
                    Agregá {fmt(freeShippingRemaining)} más para envío gratis
                </Text>
            )}

            {/* IVA discriminado */}
            <View style={s.ivaSec}>
                <View style={s.row}>
                    <Text style={s.ivaLabel}>Base imponible</Text>
                    <Text style={s.ivaValue}>{fmt(baseImponible)}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.ivaLabel}>IVA (19%)</Text>
                    <Text style={s.ivaValue}>{fmt(iva)}</Text>
                </View>
                <Text style={s.ivaNote}>IVA incluido en el precio</Text>
            </View>

            <View style={[s.row, s.totalRow]}>
                <Text style={s.summLabelTotal}>Total</Text>
                <Text style={s.summValueTotal}>{fmt(total)}</Text>
            </View>
        </View>
    );
});

export default CartSummary;

const s = StyleSheet.create({
    summary: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        gap: 8,
        marginTop: 4,
    },
    row:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalRow:      { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
    summLabel:     { fontSize: 14, color: COLORS.muted },
    summValue:     { fontSize: 15, fontWeight: "700", color: COLORS.text },
    summValueFree: { color: COLORS.green },
    summLabelTotal:{ fontSize: 14, fontWeight: "800", color: COLORS.text },
    summValueTotal:{ fontSize: 18, fontWeight: "800", color: COLORS.orange },
    hint:          { fontSize: 12, color: COLORS.orange, marginTop: 2 },

    // IVA
    ivaSec:   { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, gap: 4 },
    ivaLabel: { fontSize: 12, color: COLORS.mutedDark },
    ivaValue: { fontSize: 12, color: COLORS.mutedDark },
    ivaNote:  { fontSize: 10, color: COLORS.mutedDark, textAlign: "right", marginTop: 2 },
});
