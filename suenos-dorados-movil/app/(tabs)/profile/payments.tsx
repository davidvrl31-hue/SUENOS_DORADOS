import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormField from "../../../components/profile/FormField";
import FormModal from "../../../components/profile/FormModal";
import FormToggle from "../../../components/profile/FormToggle";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/Toast";
import { PAYMENT_TYPES, PaymentType } from "../../../constants/profile";
import { COLORS } from "../../../constants/theme";
import { PaymentMethod, useOrders } from "../../../context/OrdersContext";

const EMPTY_FORM = { type: "tarjeta" as PaymentType, label: "", details: "", isDefault: false };

export default function Payments() {
    const { payments, addPayment, updatePayment, deletePayment } = useOrders();
    const { showToast } = useToast();

    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<PaymentMethod | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModalVisible(true);
    };

    const openEdit = (p: PaymentMethod) => {
        setEditing(p);
        setForm({ type: p.type, label: p.label, details: p.details, isDefault: p.isDefault });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.label.trim()) {
            showToast("Ingresá un nombre para este método", "error");
            return;
        }
        if (editing) {
            await updatePayment({ ...form, id: editing.id });
            showToast("Método de pago actualizado ✅");
        } else {
            await addPayment(form);
            showToast("Método de pago guardado ✅");
        }
        setModalVisible(false);
    };

    const handleDelete = async (id: string) => {
        await deletePayment(id);
        showToast("Método eliminado", "info");
    };

    const payIcon = (type: PaymentType) =>
        PAYMENT_TYPES.find((t) => t.type === type)?.icon ?? "credit-card";

    const getIconColor = (type: PaymentType) => {
        if (type === "efectivo") return COLORS.green;
        if (type === "pse") return COLORS.blue;
        return COLORS.orange;
    };

    const getIconBgStyle = (type: PaymentType) => {
        if (type === "efectivo") return s.iconBoxGreen;
        if (type === "pse") return s.iconBoxBlue;
        return {};
    };

    return (
        <View style={s.root}>
            <ProfileScreenHeader
                title="Métodos de pago"
                rightButton={{ icon: "plus", onPress: openNew, variant: "primary" }}
            />

            {payments.length === 0 ? (
                <EmptyState
                    icon="credit-card"
                    title="Sin métodos de pago"
                    subtitle="Agregá una tarjeta u otro método para pagar más rápido"
                    actionLabel="Agregar método"
                    onAction={openNew}
                />
            ) : (
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                    {payments.map((p) => (
                        <View key={p.id} style={s.card}>
                            <View style={s.cardLeft}>
                                <View style={[s.iconBox, getIconBgStyle(p.type)]}>
                                    <Feather name={payIcon(p.type)} size={18} color={getIconColor(p.type)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={s.labelRow}>
                                        <Text style={s.payLabel}>{p.label}</Text>
                                        {p.isDefault && (
                                            <View style={s.defaultBadge}>
                                                <Text style={s.defaultTxt}>Principal</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={s.payType}>
                                        {PAYMENT_TYPES.find((t) => t.type === p.type)?.label}
                                    </Text>
                                    {p.details ? <Text style={s.payDetails}>{p.details}</Text> : null}
                                </View>
                            </View>
                            <View style={s.actions}>
                                <TouchableOpacity style={s.actionBtn} onPress={() => openEdit(p)}>
                                    <Feather name="edit-2" size={15} color={COLORS.orange} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[s.actionBtn, s.actionBtnDanger]}
                                    onPress={() => handleDelete(p.id)}
                                >
                                    <Feather name="trash-2" size={15} color={COLORS.red} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            <FormModal
                visible={modalVisible}
                title={editing ? "Editar método" : "Nuevo método de pago"}
                onClose={() => setModalVisible(false)}
            >
                <Text style={s.fieldLabel}>Tipo de método *</Text>
                <View style={s.typeRow}>
                    {PAYMENT_TYPES.map((t) => (
                        <TouchableOpacity
                            key={t.type}
                            style={[s.typeChip, form.type === t.type && s.typeChipActive]}
                            onPress={() => setForm((f) => ({ ...f, type: t.type }))}
                        >
                            <Feather
                                name={t.icon}
                                size={16}
                                color={form.type === t.type ? COLORS.orange : COLORS.muted}
                            />
                            <Text style={[s.typeTxt, form.type === t.type && s.typeTxtActive]}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <FormField
                    label={form.type === "tarjeta" ? "Nombre en la tarjeta *" : "Nombre / alias *"}
                    placeholder={
                        form.type === "tarjeta"
                            ? "Visa ****1234"
                            : form.type === "pse"
                                ? "Bancolombia PSE"
                                : "Efectivo en casa"
                    }
                    value={form.label}
                    onChangeText={(t) => setForm((f) => ({ ...f, label: t }))}
                />

                <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>Detalles adicionales</Text>
                    <TextInput
                        style={s.input}
                        placeholder={
                            form.type === "tarjeta"
                                ? "Titular: Juan García"
                                : form.type === "pse"
                                    ? "NIT o cédula"
                                    : "Notas adicionales"
                        }
                        placeholderTextColor={COLORS.mutedDark}
                        value={form.details}
                        onChangeText={(t) => setForm((f) => ({ ...f, details: t }))}
                    />
                </View>

                <FormToggle
                    label="Establecer como método principal"
                    value={form.isDefault}
                    onToggle={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                />

                <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                    <Text style={s.saveBtnTxt}>{editing ? "Guardar cambios" : "Agregar método"}</Text>
                </TouchableOpacity>
            </FormModal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, gap: 12, paddingBottom: 100 },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    cardLeft: { flex: 1, flexDirection: "row", gap: 12 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
    },
    iconBoxGreen: { backgroundColor: "#dcfce7" },
    iconBoxBlue: { backgroundColor: "#dbeafe" },
    labelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
    payLabel: { fontSize: 14, fontWeight: "800", color: COLORS.text },
    defaultBadge: {
        backgroundColor: COLORS.orange + "20",
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    defaultTxt: { fontSize: 10, fontWeight: "700", color: COLORS.orange },
    payType: { fontSize: 12, color: COLORS.muted, marginBottom: 2 },
    payDetails: { fontSize: 12, color: COLORS.text },
    actions: { gap: 8 },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
    },
    actionBtnDanger: { backgroundColor: "#fff0f0" },
    fieldLabel: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
    typeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    typeChip: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typeChipActive: { backgroundColor: COLORS.amber, borderColor: COLORS.amberBorder },
    typeTxt: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
    typeTxtActive: { color: COLORS.amberAccent, fontWeight: "700" },
    fieldWrap: { marginBottom: 14 },
    input: {
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    saveBtn: {
        backgroundColor: COLORS.orange,
        borderRadius: 14,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    saveBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
});