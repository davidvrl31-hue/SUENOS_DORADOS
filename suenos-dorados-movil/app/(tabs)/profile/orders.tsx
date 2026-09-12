import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import { COLORS } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useOrders } from "../../../context/OrdersContext";
import { fmt, fmtDate, orderStatusColor, orderStatusLabel } from "../../../utils/format";

export default function Orders() {
    const router = useRouter();
    const { orders, loadOrders, isLoadingOrders: isLoading } = useOrders();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    // Si no hay usuario
    if (!user) {
        return (
            <View style={s.root}>
                <ProfileScreenHeader title="Mis pedidos" />
                <View style={s.emptyContainer}>
                    <View style={s.emptyIcon}>
                        <Feather name="package" size={36} color={COLORS.orange} />
                    </View>
                    <Text style={s.emptyTitle}>Inicia sesión</Text>
                    <Text style={s.emptySubtitle}>Necesitas una cuenta para ver tus pedidos</Text>
                    <TouchableOpacity
                        style={s.emptyButton}
                        onPress={() => router.push("/(auth)/login")}
                        activeOpacity={0.8}
                    >
                        <Text style={s.emptyButtonText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Si está cargando
    if (isLoading) {
        return (
            <View style={s.root}>
                <ProfileScreenHeader title="Mis pedidos" />
                <View style={s.emptyContainer}>
                    <Text style={s.emptySubtitle}>Cargando tus pedidos...</Text>
                </View>
            </View>
        );
    }

    // Si no hay pedidos
    if (orders.length === 0) {
        return (
            <View style={s.root}>
                <ProfileScreenHeader title="Mis pedidos" />
                <View style={s.emptyContainer}>
                    <View style={s.emptyIcon}>
                        <Feather name="package" size={36} color={COLORS.orange} />
                    </View>
                    <Text style={s.emptyTitle}>Sin pedidos aún</Text>
                    <Text style={s.emptySubtitle}>
                        Tus pedidos aparecerán aquí una vez que realices una compra
                    </Text>
                    <TouchableOpacity
                        style={s.emptyButton}
                        onPress={() => router.push("/(tabs)/home")}
                        activeOpacity={0.8}
                    >
                        <Text style={s.emptyButtonText}>Ir a comprar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <ProfileScreenHeader 
                title="Mis pedidos"
                rightButton={{
                    icon: "refresh-cw",
                    onPress: loadOrders,
                    variant: "default"
                }}
            />
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {orders.map((order) => (
                    <View key={order.id} style={s.card}>
                        <View style={s.cardHeader}>
                            <View>
                                <Text style={s.orderId}>{order.id}</Text>
                                <Text style={s.orderDate}>{fmtDate(order.date)}</Text>
                            </View>
                            <View
                                style={[
                                    s.statusBadge,
                                    { backgroundColor: orderStatusColor(order.status) + "20" },
                                ]}
                            >
                                <Text
                                    style={[s.statusTxt, { color: orderStatusColor(order.status) }]}
                                >
                                    {orderStatusLabel(order.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={s.divider} />
                        {order.items.map((item) => (
                            <View key={item.id} style={s.itemRow}>
                                <View style={s.bullet} />
                                <View style={s.itemInfo}>
                                    <Text style={s.itemName} numberOfLines={1}>
                                        {item.name}
                                        {item.qty > 1 ? ` x${item.qty}` : ""}
                                    </Text>
                                    <Text style={s.itemPrice}>{fmt(item.price)}</Text>
                                </View>
                            </View>
                        ))}

                        <View style={s.divider} />
                        <View style={s.totalRow}>
                            <Text style={s.totalLabel}>Total pagado</Text>
                            <Text style={s.totalValue}>{fmt(order.total)}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, gap: 14, paddingBottom: 100 },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    orderId: { fontSize: 13, fontWeight: "800", color: COLORS.text },
    orderDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusTxt: { fontSize: 11, fontWeight: "700" },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.orange,
    },
    itemInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    itemName: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: "500" },
    itemPrice: { fontSize: 13, fontWeight: "700", color: COLORS.text },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 14, color: COLORS.muted },
    totalValue: { fontSize: 16, fontWeight: "800", color: COLORS.orange },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        textAlign: "center",
        paddingHorizontal: 40,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
    },
    emptyButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});