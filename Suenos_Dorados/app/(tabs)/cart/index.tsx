import { Feather } from "@expo/vector-icons";
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

const CartScreen = memo(function CartScreen() {
    const router = useRouter();
    const { items, updateQty, clearCart, total } = useCart();
    const { placeOrder, apiAddresses, loadAddresses, isLoadingAddresses, addAddress } = useOrders();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [selectedDir, setSelectedDir] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    // Form nueva dirección
    const [newDir, setNewDir] = useState({
        descripcionDireccion: "",
        descripcionMunicipio: "",
        descripcionDepartamento: "",
        descripcionBarrio: "",
    });

    const shipping = useMemo(() => (total >= 100000 ? 0 : 15000), [total]);
    const finalTotal = useMemo(() => total + shipping, [total, shipping]);

    // Cargar direcciones al abrir el modal
    useEffect(() => {
        if (showModal && user?.token) loadAddresses();
    }, [showModal]); // eslint-disable-line

    // Auto-seleccionar dirección principal
    useEffect(() => {
        if (apiAddresses.length > 0 && !selectedDir) {
            const principal = apiAddresses.find((d) => d.esPrincipal) ?? apiAddresses[0];
            setSelectedDir(principal.idDireccion);
        }
    }, [apiAddresses]); // eslint-disable-line

    const handleCheckout = useCallback(() => {
        if (items.length === 0) return;
        if (!user) { router.push("/(auth)/login"); return; }
        setShowModal(true);
    }, [items, user, router]);

    const handleConfirmOrder = useCallback(async () => {
        setProcessing(true);
        try {
            let idDireccion = selectedDir;

            // Si no hay dirección seleccionada, crear una con el formulario
            if (!idDireccion) {
                if (!newDir.descripcionDireccion.trim() || !newDir.descripcionMunicipio.trim() || !newDir.descripcionDepartamento.trim()) {
                    showToast("Completa dirección, municipio y departamento", "info");
                    setProcessing(false);
                    return;
                }
                await addAddress({
                    id: "",
                    label: "Casa",
                    fullAddress: newDir.descripcionDireccion.trim(),
                    city: `${newDir.descripcionMunicipio.trim()}, ${newDir.descripcionDepartamento.trim()}`,
                    phone: "",
                    isDefault: true,
                });
                // Recargar direcciones para obtener el ID real
                await loadAddresses();
                showToast("Dirección guardada. Intenta confirmar de nuevo.", "info");
                setProcessing(false);
                return;
            }

            await placeOrder(items, finalTotal, idDireccion, shipping);
            clearCart();
            setShowModal(false);
            showToast("¡Pedido realizado con éxito! 🎉");
            setTimeout(() => router.push("/(tabs)/profile"), 300);
        } catch (e) {
            showToast(e instanceof Error ? e.message : "Error al procesar el pedido", "info");
        } finally {
            setProcessing(false);
        }
    }, [selectedDir, newDir, items, finalTotal, shipping, placeOrder, addAddress, loadAddresses, clearCart, showToast, router]);

    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    if (items.length === 0) {
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

            <View style={s.footer}>
                <TouchableOpacity
                    style={s.checkoutBtn}
                    onPress={handleCheckout}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    <Text style={s.checkoutTxt}>Finalizar compra</Text>
                    <Feather name="arrow-right" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Modal de dirección */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
                <View style={s.overlay}>
                    <View style={s.sheet}>
                        <View style={s.sheetHeader}>
                            <Text style={s.sheetTitle}>Dirección de entrega</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Feather name="x" size={22} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

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
                                                {selectedDir === d.idDireccion && (
                                                    <View style={s.dirRadioDot} />
                                                )}
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
                                    {[
                                        { key: "descripcionDireccion", placeholder: "Dirección *" },
                                        { key: "descripcionBarrio", placeholder: "Barrio (opcional)" },
                                        { key: "descripcionMunicipio", placeholder: "Municipio *" },
                                        { key: "descripcionDepartamento", placeholder: "Departamento *" },
                                    ].map(({ key, placeholder }) => (
                                        <TextInput
                                            key={key}
                                            style={s.input}
                                            placeholder={placeholder}
                                            placeholderTextColor={COLORS.mutedDark}
                                            value={newDir[key as keyof typeof newDir]}
                                            onChangeText={(v) => setNewDir((p) => ({ ...p, [key]: v }))}
                                        />
                                    ))}
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[s.confirmBtn, processing && { opacity: 0.6 }]}
                            onPress={handleConfirmOrder}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={s.confirmTxt}>Confirmar pedido</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
});

export default CartScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, gap: 12, paddingBottom: 100 },
    count: { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
    footer: {
        padding: 20,
        paddingBottom: 28,
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
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
    // Modal
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
        maxHeight: "75%",
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sheetTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
    sheetScroll: { maxHeight: 340 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },
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
    dirRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.orange,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    dirRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.orange,
    },
    dirInfo: { flex: 1 },
    dirAddr: { fontSize: 14, fontWeight: "700", color: COLORS.text },
    dirSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
    dirPrincipal: { fontSize: 11, color: COLORS.orange, fontWeight: "700", marginTop: 4 },
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
    confirmBtn: {
        height: 52,
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.lg,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        elevation: 4,
    },
    confirmTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
