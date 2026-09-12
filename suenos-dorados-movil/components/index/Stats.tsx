import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

const STATS: { id: string; icon: React.ComponentProps<typeof Feather>["name"]; label: string; sub: string }[] = [
    { id: "shipping", icon: "truck", label: "Envío gratis", sub: "+$100.000 COP" },
    { id: "discount", icon: "tag", label: "Descuento", sub: "Hasta 30% off" },
    { id: "rating", icon: "star", label: "Valoración", sub: "4.8 / 5 estrellas" },
];

const Stats = memo(function Stats() {
    return (
        <View style={s.row}>
            {STATS.map((item) => (
                <View key={item.id} style={s.item}>
                    <View style={s.iconBg}>
                        <Feather name={item.icon} size={18} color={COLORS.orange} />
                    </View>
                    <Text style={s.label}>{item.label}</Text>
                    <Text style={s.sub}>{item.sub}</Text>
                </View>
            ))}
        </View>
    );
});

export default Stats;

const s = StyleSheet.create({
    row: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    item: {
        flex: 1,
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    label: { fontSize: 11, fontWeight: "700", color: COLORS.text, textAlign: "center" },
    sub: { fontSize: 10, color: COLORS.muted, textAlign: "center" },
});