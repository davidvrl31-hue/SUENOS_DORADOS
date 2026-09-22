import { Feather } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import { COLORS } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useOrders } from "../../../context/OrdersContext";
import { fmt, fmtDate, orderStatusColor, orderStatusLabel } from "../../../utils/format";
import { API } from "../../../services/api.service";

export default function Orders() {
    const router = useRouter();
    const { orders, loadOrders, isLoadingOrders: isLoading } = useOrders();
    const { user } = useAuth();
    const [descargando, setDescargando] = useState<number | null>(null);

    useEffect(() => { if (user) loadOrders(); }, [user]); // eslint-disable-line

    const handleVerFactura = async (idPedido: number) => {
        if (!user?.token) return;
        setDescargando(idPedido);
        try {
            const url      = API.getFacturaUrl(idPedido);
            const fileName = `Factura-SD-${String(idPedido).padStart(6, "0")}.pdf`;

            // File.downloadFileAsync es la API moderna de expo-file-system SDK 57.
            // Soporta headers, rechaza automáticamente si el status no es 2xx,
            // y escribe directamente en disco sin pasar por memoria JS.
            const destino = new File(Paths.cache, fileName);
            // Si ya existe de una descarga previa, lo borramos para evitar error DestinationAlreadyExists
            if (destino.exists) destino.delete();

            const archivo = await File.downloadFileAsync(url, destino, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            // Abrir el diálogo nativo de compartir / visor PDF
            const puedo = await Sharing.isAvailableAsync();
            if (puedo) {
                await Sharing.shareAsync(archivo.uri, {
                    mimeType:    "application/pdf",
                    dialogTitle: `Factura ORD-${idPedido}`,
                    UTI:         "com.adobe.pdf",
                });
            } else {
                Alert.alert("Sin visor PDF", "Instala Adobe Acrobat u otra app para abrir PDFs.");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "No se pudo descargar la factura";
            Alert.alert("Error al descargar factura", msg);
        } finally {
            setDescargando(null);
        }
    };

    if (!user) return (
        <View style={s.root}>
            <ProfileScreenHeader title="Mis pedidos" />
            <View style={s.emptyContainer}>
                <View style={s.emptyIcon}><Feather name="package" size={36} color={COLORS.orange} /></View>
                <Text style={s.emptyTitle}>Inicia sesión</Text>
                <Text style={s.emptySubtitle}>Necesitas una cuenta para ver tus pedidos</Text>
                <TouchableOpacity style={s.emptyButton} onPress={() => router.push("/(auth)/login")} activeOpacity={0.8}>
                    <Text style={s.emptyButtonText}>Iniciar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) return (
        <View style={s.root}>
            <ProfileScreenHeader title="Mis pedidos" />
            <View style={s.emptyContainer}>
                <ActivityIndicator color={COLORS.orange} size="large" />
                <Text style={[s.emptySubtitle, { marginTop: 16 }]}>Cargando tus pedidos...</Text>
            </View>
        </View>
    );

    if (orders.length === 0) return (
        <View style={s.root}>
            <ProfileScreenHeader title="Mis pedidos" />
            <View style={s.emptyContainer}>
                <View style={s.emptyIcon}><Feather name="package" size={36} color={COLORS.orange} /></View>
                <Text style={s.emptyTitle}>Sin pedidos aún</Text>
                <Text style={s.emptySubtitle}>Tus pedidos aparecerán aquí una vez que realices una compra</Text>
                <TouchableOpacity style={s.emptyButton} onPress={() => router.push("/(tabs)/home")} activeOpacity={0.8}>
                    <Text style={s.emptyButtonText}>Ir a comprar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={s.root}>
            <ProfileScreenHeader title="Mis pedidos"
                rightButton={{ icon: "refresh-cw", onPress: loadOrders, variant: "default" }} />
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                {orders.map((order) => {
                    const cargando = descargando === order.idPedido;
                    return (
                        <View key={order.id} style={s.card}>
                            <View style={s.cardHeader}>
                                <View>
                                    <Text style={s.orderId}>{order.id}</Text>
                                    <Text style={s.orderDate}>{fmtDate(order.date)}</Text>
                                </View>
                                <View style={[s.statusBadge, { backgroundColor: orderStatusColor(order.status) + "20" }]}>
                                    <Text style={[s.statusTxt, { color: orderStatusColor(order.status) }]}>
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
                                            {item.name}{item.qty > 1 ? ` x${item.qty}` : ""}
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
                            <View style={s.ivaRow}>
                                <Text style={s.ivaLabel}>IVA incluido (19%)</Text>
                                <Text style={s.ivaLabel}>{fmt(Math.round(order.total - order.total / 1.19))}</Text>
                            </View>

                            {/* Guía de envío — solo visible cuando está Despachado */}
                            {order.status === "despachado" && (order.numeroGuia || order.transportadora) && (
                                <View style={s.guiaBox}>
                                    <Text style={s.guiaTitle}>🚚 Información de envío</Text>
                                    {order.transportadora ? (
                                        <View style={s.guiaRow}>
                                            <Text style={s.guiaLabel}>Transportadora</Text>
                                            <Text style={s.guiaValue}>{order.transportadora}</Text>
                                        </View>
                                    ) : null}
                                    {order.numeroGuia ? (
                                        <View style={s.guiaRow}>
                                            <Text style={s.guiaLabel}>Número de guía</Text>
                                            <Text style={[s.guiaValue, s.guiaMono]}>{order.numeroGuia}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            )}

                            {/* Botón factura */}
                            <TouchableOpacity
                                style={[s.facturaBtn, cargando && s.facturaBtnDisabled]}
                                onPress={() => handleVerFactura(order.idPedido)}
                                disabled={cargando}
                                activeOpacity={0.75}
                            >
                                {cargando ? (
                                    <><ActivityIndicator size="small" color={COLORS.orange} /><Text style={s.facturaBtnTxt}>Generando...</Text></>
                                ) : (
                                    <><Feather name="download" size={14} color={COLORS.orange} /><Text style={s.facturaBtnTxt}>Descargar factura PDF</Text></>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root:   { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, gap: 14, paddingBottom: 100 },
    card:   { backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    orderId:    { fontSize: 13, fontWeight: "800", color: COLORS.text },
    orderDate:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },
    statusBadge:{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    statusTxt:  { fontSize: 11, fontWeight: "700" },
    divider:    { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
    itemRow:    { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
    bullet:     { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.orange },
    itemInfo:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    itemName:   { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: "500" },
    itemPrice:  { fontSize: 13, fontWeight: "700", color: COLORS.text },
    totalRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 14, color: COLORS.muted },
    totalValue: { fontSize: 16, fontWeight: "800", color: COLORS.orange },
    ivaRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
    ivaLabel:   { fontSize: 11, color: COLORS.mutedDark ?? COLORS.muted },
    facturaBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        marginTop: 12, borderWidth: 1.5, borderColor: COLORS.orange, borderRadius: 12,
        paddingVertical: 10, backgroundColor: COLORS.amber,
    },
    facturaBtnDisabled: { opacity: 0.5 },
    facturaBtnTxt: { fontSize: 13, fontWeight: "700", color: COLORS.orange },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.amber, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle:    { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: "center", paddingHorizontal: 40, marginBottom: 24 },
    emptyButton:   { backgroundColor: COLORS.orange, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
    emptyButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    guiaBox: {
        marginTop: 10,
        backgroundColor: "#EFF6FF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        padding: 10,
        gap: 6,
    },
    guiaTitle: { fontSize: 12, fontWeight: "700", color: "#1D4ED8", marginBottom: 2 },
    guiaRow:   { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    guiaLabel: { fontSize: 12, color: "#6B7280" },
    guiaValue: { fontSize: 12, fontWeight: "600" as const, color: "#1F2937" },
    guiaMono:  { fontFamily: "monospace" },
});
