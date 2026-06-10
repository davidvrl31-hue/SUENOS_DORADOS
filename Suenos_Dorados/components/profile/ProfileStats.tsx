import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { Order } from "../../context/OrdersContext";

interface ProfileStatsProps {
    orders: Order[];
}

const ProfileStats = memo(function ProfileStats({ orders }: ProfileStatsProps) {
    const stats = useMemo(() => {
        const delivered = orders.filter((o) => o.status === "entregado").length;
        const pending = orders.filter((o) => o.status === "pendiente").length;
        return { total: orders.length, delivered, pending };
    }, [orders]);

    return (
        <View style={s.statsRow}>
            <View style={s.statItem}>
                <Text style={s.statNum}>{stats.total}</Text>
                <Text style={s.statLbl}>Pedidos</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
                <Text style={s.statNum}>{stats.delivered}</Text>
                <Text style={s.statLbl}>Entregados</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
                <Text style={s.statNum}>{stats.pending}</Text>
                <Text style={s.statLbl}>Pendientes</Text>
            </View>
        </View>
    );
});

export default ProfileStats;

const s = StyleSheet.create({
    statsRow: {
        flexDirection: "row",
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 16,
        marginBottom: 16,
    },
    statItem: { flex: 1, alignItems: "center" },
    statNum: { fontSize: 20, fontWeight: "900", color: COLORS.orange },
    statLbl: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: COLORS.border },
});
