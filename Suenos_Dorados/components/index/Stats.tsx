import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

const STATS: { id: string; icon: React.ComponentProps<typeof Feather>["name"]; label: string; sub: string }[] = [
    { id: "shipping", icon: "truck", label: "Envío gratis", sub: "+$100.000" },
    { id: "returns", icon: "refresh-cw", label: "Devolución", sub: "30 días" },
    { id: "rating", icon: "star", label: "Valoración", sub: "4.9 / 5" },
];

const Stats = memo(function Stats() {
    return (
        <View style={s.row}>
            {STATS.map((item, i) => (
                <View key={item.id} style={[s.item, i < 2 && s.border]}>
                    <Feather name={item.icon} size={16} color={COLORS.orange} />
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
        marginBottom: 24,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 14,
    },
    item: { flex: 1, alignItems: "center", gap: 4 },
    border: { borderRightWidth: 1, borderRightColor: COLORS.border },
    label: { fontSize: 11, fontWeight: "700", color: COLORS.text },
    sub: { fontSize: 10, color: COLORS.muted },
});