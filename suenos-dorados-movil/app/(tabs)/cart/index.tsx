import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import CartItem from "../../../components/cart/CartItem";
import CartSummary from "../../../components/cart/CartSummary";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/Toast";
import { COLORS, RADIUS } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { useOrders } from "../../../context/OrdersContext";
import { API } from "../../../services/api.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Step = "cart" | "direccion" | "procesando" | "resultado";
type ResultadoPago = "aprobado" | "rechazado" | "pendiente" | null;

// ─── Pantalla principal ───────────────────────────────────────────────────────
const CartScreen = memo(function CartScreen() {
    const router = useRouter();
    const { items, updateQty, clearCart, total } = useCart();
    const { apiAddresses, loadAddresses, isLoadingAddresses, addAddress } = useOrders();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [step,          setStep]          = useState<Step>("cart");
    const [loading,       setLoading]       = useState(false);
    const [selectedDir,   setSelectedDir]   = useState<number | null>(null);
    const [idPedidoCreado,setIdPedidoCreado]= useState<number | null>(null);
    const [resultadoPago, setResultadoPago] = useState<ResultadoPago>(null);

    // Formulario nueva dirección
    const [newDir, setNewDir] = useState({
        descripcionDireccion: "",
        descripcionMunicipio: "",
        descripcionDepartamento: "",
        descripcionBarrio: "",
    });

    const shipping   = useMemo(() => (total >= 100_000 ? 0 : 15_000), [total]);
    const finalTotal = useMemo(() => total + shipping, [total, shipping]);

    // Cargar direcciones al abrir el modal
    useEffect(() => {
        if (step === "direccion" && user?.token) loadAddresses();
    }, [step]); // eslint-disable-line

    // Auto-seleccionar dirección principal
    useEffect(() => {
        if (apiAddresses.length > 0 && !selectedDir) {
            const principal = apiAddresses.find((d) => d.esPrincipal) ?? apiAddresses[0];
            setSelectedDir(principal.idDireccion);
        }
    }, [apiAddresses]); // eslint-disable-line

    // ── PASO 1: Abrir modal de dirección ──────────────────────────────────
    const handleIrDireccion = useCallback(() => {
        if (!user) { router.push("/(auth)/login"); return; }
        setStep("direccion");
    }, [user, router]);

    // ── PASO 2: Crear pedido → link Bold → WebBrowser ─────────────────────
    const handlePagarConBold = useCallback(async () => {
        if (!user?.token || !selectedDir) {
            showToast("Selecciona una dirección de entrega", "info");
            return;
        }
        setLoading(true);
        setStep("procesando");

        try {
            // 1. Crear pedido en la BD (estado: Pendiente)
            const orderData: any = await API.crearPedido(user.token, {
                idDireccion: selectedDir,
                items: items.map((i) => ({
                    idVariante:     i.idVariante ?? parseInt(i.id.split("-")[1] ?? "1", 10),
                    cantidad:       i.qty,
                    precioUnitario: i.price,
                })),
                costoEnvio: shipping,
            });

            setIdPedidoCreado(orderData.idPedido);

            // 2. Crear link de pago Bold
            // Bold muestra PSE, Nequi, Tarjeta y Bancolombia en una sola pantalla
            const { checkoutUrl, linkId } = await API.crearLinkDePago(
                user.token,
                {
                    idPedido:        orderData.idPedido,
                    totalCOP:        Math.round(finalTotal),
                    descripcion:     `Pedido #${orderData.idPedido} — Sueños Dorados`,
                    correoComprador: user.email,
                }
            );

            // 3. Abrir checkout de Bold en WebBrowser in-app
            await WebBrowser.openBrowserAsync(checkoutUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                toolbarColor: COLORS.orange,
            });

            // 4. Al volver, consultar el estado del link con polling
            await verificarEstadoPago(linkId, user.token);

        } catch (err: any) {
            showToast(err.message ?? "Error al procesar el pago", "error");
            setStep("direccion");
        } finally {
            setLoading(false);
        }
    }, [user, selectedDir, items, finalTotal, shipping, showToast]);

    // ── Polling de estado del link ────────────────────────────────────────
    const verificarEstadoPago = async (linkId: string, token: string, intento = 0) => {
        if (intento > 6) {
            setResultadoPago("pendiente");
            setStep("resultado");
            return;
        }
        try {
            const data = await API.consultarEstadoPago(token, linkId);
            // El backend devuelve { ok, estado: { status, ... } }
            const status: string = data?.estado?.status ?? "ACTIVE";

            if (status === "PAID") {
                clearCart();
                setResultadoPago("aprobado");
                setStep("resultado");
            } else if (["REJECTED", "CANCELLED", "EXPIRED"].includes(status)) {
                setResultadoPago("rechazado");
                setStep("resultado");
            } else {
                // ACTIVE / PROCESSING → reintentar en 3 s
                setTimeout(() => verificarEstadoPago(linkId, token, intento + 1), 3_000);
            }
        } catch {
            setTimeout(() => verificarEstadoPago(linkId, token, intento + 1), 3_000);
        }
    };

    // ── Guardar nueva dirección ───────────────────────────────────────────
    const handleAgregarDireccion = useCallback(async () => {
        if (!newDir.descripcionDireccion.trim() || !newDir.descripcionMunicipio.trim() || !newDir.descripcionDepartamento.trim()) {
            showToast("Completa dirección, municipio y departamento", "info");
            return;
        }
        setLoading(true);
        try {
            await addAddress({
                label:     "Casa",
                fullAddress: newDir.descripcionDireccion.trim(),
                city:      `${newDir.descripcionMunicipio.trim()}, ${newDir.descripcionDepartamento.trim()}`,
                phone:     "",
                isDefault: true,
            });
            await loadAddresses();
            setNewDir({ descripcionDireccion: "", descripcionMunicipio: "", descripcionDepartamento: "", descripcionBarrio: "" });
            showToast("Dirección guardada ✅");
        } catch {
            showToast("Error al guardar la dirección", "error");
        } finally {
            setLoading(false);
        }
    }, [newDir, addAddress, loadAddresses, showToast]);

    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    // ─────────────────────────────────────────────────────────────────────
    // Vistas especiales
    // ─────────────────────────────────────────────────────────────────────

    if (items.length === 0 && step === "cart") {
        return (
            <View style={s.root}>
                <EmptyState
                    icon="shopping-cart"
                    title="Tu carrito está vacío"
                    subtitle="Agregá productos desde el catálogo para verlos acá"
                    actionLabel="Ir a comprar"
                    onAction={goToExplore}
                />
            </View>
        );
    }

    if (step === "procesando") {
        return (
            <View style={s.centeredScreen}>
                <View style={s.procesandoCard}>
                    <ActivityIndicator size="large" color={COLORS.orange} />
                    <Text style={s.procesandoTitle}>Preparando tu pago</Text>
                    <Text style={s.procesandoSub}>
                        Abriremos la pasarela de Bold donde podrás pagar con PSE,
                        Nequi, tarjeta o Bancolombia.
                    </Text>
                </View>
            </View>
        );
    }

    if (step === "resultado") {
        const aprobado  = resultadoPago === "aprobado";
        const rechazado = resultadoPago === "rechazado";
        const pendiente = resultadoPago === "pendiente";

        return (
            <View style={s.centeredScreen}>
                <View style={s.resultCard}>
                    <View style={[
                        s.resultIcon,
                        aprobado  && s.resultIconGreen,
                        rechazado && s.resultIconRed,
                        pendiente && s.resultIconYellow,
                    ]}>
                        <Feather
                            name={aprobado ? "check-circle" : rechazado ? "x-circle" : "clock"}
                            size={36}
                            color={aprobado ? "#16A34A" : rechazado ? "#DC2626" : "#D97706"}
                        />
                    </View>

                    <Text style={s.resultTitle}>
                        {aprobado ? "¡Pago aprobado!" : rechazado ? "Pago rechazado" : "Pago en proceso"}
                    </Text>

                    <Text style={s.resultSub}>
                        {aprobado
                            ? "Tu pedido está siendo preparado. Te notificaremos cuando sea enviado."
                            : rechazado
                            ? "El pago no fue aprobado. El stock fue restaurado."
                            : "Tu pago está siendo confirmado. Esto puede tomar unos minutos."}
                    </Text>

                    {idPedidoCreado && (
                        <View style={s.resultRef}>
                            <Text style={s.resultRefTxt}>Pedido ORD-{idPedidoCreado}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={s.resultBtn}
                        onPress={() => {
                            setStep("cart");
                            setResultadoPago(null);
                            router.push("/(tabs)/profile/orders");
                        }}
                    >
                        <Text style={s.resultBtnTxt}>Ver mis pedidos</Text>
                    </TouchableOpacity>

                    {rechazado && (
                        <TouchableOpacity
                            style={[s.resultBtn, s.resultBtnSecondary]}
                            onPress={() => { setStep("cart"); setResultadoPago(null); }}
                        >
                            <Text style={[s.resultBtnTxt, s.resultBtnSecondaryTxt]}>Intentar de nuevo</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // Vista principal: lista de ítems + footer
    // ─────────────────────────────────────────────────────────────────────
    return (
        <View style={s.root}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.count}>
                    {items.length} producto{items.length !== 1 ? "s" : ""}
                </Text>
                {items.map((item) => (
                    <CartItem key={item.id} item={item} onUpdateQty={updateQty} />
                ))}
                <CartSummary subtotal={total} shipping={shipping} total={finalTotal} />
            </ScrollView>

            {/* Footer con botón de pago */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={s.checkoutBtn}
                    onPress={handleIrDireccion}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Ir a pagar"
                >
                    <Feather name="credit-card" size={18} color="#fff" />
                    <Text style={s.checkoutTxt}>Ir a pagar</Text>
                    <Feather name="arrow-right" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={s.boldBadge}>PSE · Nequi · Tarjeta · Bancolombia · Bold</Text>
            </View>

            {/* ── Modal: selección de dirección ── */}
            <Modal
                visible={step === "direccion"}
                animationType="slide"
                transparent
                onRequestClose={() => setStep("cart")}
            >
                <View style={s.overlay}>
                    <View style={s.sheet}>
                        {/* Header */}
                        <View style={s.sheetHeader}>
                            <Text style={s.sheetTitle}>Dirección de entrega</Text>
                            <TouchableOpacity onPress={() => setStep("cart")}>
                                <Feather name="x" size={22} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Lista o formulario */}
                        <ScrollView style={s.sheetScroll} showsVerticalScrollIndicator={false}>
                            {isLoadingAddresses ? (
                                <ActivityIndicator color={COLORS.orange} style={{ marginVertical: 20 }} />
                            ) : apiAddresses.length > 0 ? (
                                <>
                                    <Text style={s.sectionLabel}>Tus direcciones</Text>
                                    {apiAddresses.map((d) => (
                                        <TouchableOpacity
                                            key={d.idDireccion}
                                            style={[s.dirCard, selectedDir === d.idDireccion && s.dirCardActive]}
                                            onPress={() => setSelectedDir(d.idDireccion)}
                                        >
                                            <View style={s.dirRadio}>
                                                {selectedDir === d.idDireccion && <View style={s.dirRadioDot} />}
                                            </View>
                                            <View style={s.dirInfo}>
                                                <Text style={s.dirAddr}>{d.descripcionDireccion}</Text>
                                                {d.descripcionBarrio && (
                                                    <Text style={s.dirSub}>{d.descripcionBarrio}</Text>
                                                )}
                                                <Text style={s.dirSub}>
                                                    {d.descripcionMunicipio}, {d.descripcionDepartamento}
                                                </Text>
                                                {d.esPrincipal && (
                                                    <Text style={s.dirPrincipal}>Principal</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <Text style={s.sectionLabel}>Agregar dirección</Text>
                                    {([
                                        { key: "descripcionDireccion",    placeholder: "Dirección *" },
                                        { key: "descripcionBarrio",       placeholder: "Barrio (opcional)" },
                                        { key: "descripcionMunicipio",    placeholder: "Municipio *" },
                                        { key: "descripcionDepartamento", placeholder: "Departamento *" },
                                    ] as const).map(({ key, placeholder }) => (
                                        <TextInput
                                            key={key}
                                            style={s.input}
                                            placeholder={placeholder}
                                            placeholderTextColor={COLORS.mutedDark}
                                            value={newDir[key]}
                                            onChangeText={(v) => setNewDir((p) => ({ ...p, [key]: v }))}
                                        />
                                    ))}
                                    <TouchableOpacity
                                        style={[s.addDirBtn, loading && { opacity: 0.6 }]}
                                        onPress={handleAgregarDireccion}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <ActivityIndicator color="#fff" size="small" />
                                            : <Text style={s.addDirTxt}>Guardar dirección</Text>
                                        }
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>

                        {/* Resumen del total */}
                        <View style={s.totalRow}>
                            <Text style={s.totalLabel}>Total a pagar</Text>
                            <Text style={s.totalValue}>${finalTotal.toLocaleString("es-CO")}</Text>
                        </View>

                        {/* Botón confirmar → lanza Bold */}
                        <TouchableOpacity
                            style={[s.confirmBtn, (!selectedDir || loading) && s.confirmBtnDisabled]}
                            onPress={handlePagarConBold}
                            disabled={!selectedDir || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Feather name="credit-card" size={16} color="#fff" />
                                    <Text style={s.confirmTxt}>Ir a pagar →</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={s.boldInfo}>
                            Pagarás en la pasarela de Bold: PSE · Nequi · Tarjeta · Bancolombia
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
});

export default CartScreen;

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root:   { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, gap: 12, paddingBottom: 100 },
    count:  { fontSize: 13, color: COLORS.muted, marginBottom: 4 },

    // ── Footer ──
    footer: {
        padding: 20,
        paddingBottom: 28,
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 6,
    },
    checkoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.lg,
        height: 54,
        elevation: 6,
    },
    checkoutTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
    boldBadge:   { textAlign: "center", fontSize: 10, color: COLORS.muted },

    // ── Modal overlay / sheet ──
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: COLORS.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
        maxHeight: "80%",
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sheetTitle:  { fontSize: 18, fontWeight: "800", color: COLORS.text },
    sheetScroll: { maxHeight: 300 },

    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },

    // ── Dirección ──
    dirCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        marginBottom: 10,
    },
    dirCardActive: { borderColor: COLORS.orange, backgroundColor: "#fff8ed" },
    dirRadio:      {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: COLORS.orange,
        alignItems: "center", justifyContent: "center", marginTop: 2,
    },
    dirRadioDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.orange },
    dirInfo:       { flex: 1 },
    dirAddr:       { fontSize: 14, fontWeight: "700", color: COLORS.text },
    dirSub:        { fontSize: 12, color: COLORS.muted, marginTop: 2 },
    dirPrincipal:  { fontSize: 11, color: COLORS.orange, fontWeight: "700", marginTop: 4 },

    // ── Formulario dirección ──
    input: {
        height: 48,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 14,
        color: COLORS.text,
        backgroundColor: COLORS.card,
        marginBottom: 10,
    },
    addDirBtn: {
        backgroundColor: COLORS.text,
        borderRadius: 12,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    addDirTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },

    // ── Total y botón confirmar ──
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        marginTop: 8,
    },
    totalLabel:  { fontSize: 14, color: COLORS.muted },
    totalValue:  { fontSize: 18, fontWeight: "900", color: COLORS.orange },
    confirmBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.lg,
        marginTop: 8,
        elevation: 4,
    },
    confirmBtnDisabled: { opacity: 0.45 },
    confirmTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
    boldInfo:   { textAlign: "center", fontSize: 10, color: COLORS.muted, marginTop: 10, lineHeight: 16 },

    // ── Pantalla procesando ──
    centeredScreen: {
        flex: 1,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    procesandoCard: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 32,
        alignItems: "center",
        gap: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: "100%",
    },
    procesandoTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
    procesandoSub:   { fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 20 },

    // ── Pantalla resultado ──
    resultCard: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 32,
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: "100%",
    },
    resultIcon:       { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    resultIconGreen:  { backgroundColor: "#DCFCE7" },
    resultIconRed:    { backgroundColor: "#FEE2E2" },
    resultIconYellow: { backgroundColor: "#FEF3C7" },
    resultTitle:      { fontSize: 20, fontWeight: "800", color: COLORS.text },
    resultSub:        { fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 20 },
    resultRef: {
        backgroundColor: COLORS.amber,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    resultRefTxt:          { fontSize: 13, fontWeight: "700", color: COLORS.orange },
    resultBtn: {
        width: "100%",
        height: 50,
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    resultBtnSecondary:    { backgroundColor: "transparent", borderWidth: 1.5, borderColor: COLORS.border },
    resultBtnTxt:          { color: "#fff", fontSize: 15, fontWeight: "700" },
    resultBtnSecondaryTxt: { color: COLORS.muted },
} as any);
