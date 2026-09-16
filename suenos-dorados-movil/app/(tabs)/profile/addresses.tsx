import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FormField from "../../../components/profile/FormField";
import FormModal from "../../../components/profile/FormModal";
import FormToggle from "../../../components/profile/FormToggle";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/Toast";
import { COLORS, RADIUS } from "../../../constants/theme";
import { Address, useOrders } from "../../../context/OrdersContext";

const EMPTY_FORM = { label: "", fullAddress: "", municipio: "", departamento: "", phone: "", isDefault: false };

export default function Addresses() {
    const { addresses, addAddress, updateAddress, deleteAddress } = useOrders();
    const { showToast } = useToast();

    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModalVisible(true);
    };

    const openEdit = (addr: Address) => {
        setEditing(addr);
        const [municipio, ...restDep] = addr.city.split(",");
        setForm({
            label:        addr.label,
            fullAddress:  addr.fullAddress,
            municipio:    municipio?.trim() ?? "",
            departamento: restDep.join(",").trim(),
            phone:        addr.phone,
            isDefault:    addr.isDefault,
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.label.trim() || !form.fullAddress.trim() || !form.municipio.trim() || !form.departamento.trim()) {
            showToast("Completá todos los campos obligatorios", "error");
            return;
        }
        const addrData = {
            ...form,
            city: `${form.municipio.trim()}, ${form.departamento.trim()}`,
        };
        if (editing) {
            await updateAddress({ ...addrData, id: editing.id, idDireccion: editing.idDireccion });
            showToast("Dirección actualizada ✅");
        } else {
            await addAddress(addrData);
            showToast("Dirección guardada ✅");
        }
        setModalVisible(false);
    };

    const handleDelete = async (id: string) => {
        await deleteAddress(id);
        showToast("Dirección eliminada", "info");
    };

    return (
        <View style={s.root}>
            <ProfileScreenHeader
                title="Mis direcciones"
                rightButton={{ icon: "plus", onPress: openNew, variant: "primary" }}
            />

            {addresses.length === 0 ? (
                <EmptyState
                    icon="map-pin"
                    title="Sin direcciones"
                    subtitle="Agregá una dirección de envío para agilizar tus compras"
                    actionLabel="Agregar dirección"
                    onAction={openNew}
                />
            ) : (
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                    {addresses.map((addr) => (
                        <View key={addr.id} style={s.card}>
                            <View style={s.cardLeft}>
                                <View style={s.iconBox}>
                                    <Feather name="map-pin" size={18} color={COLORS.orange} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={s.labelRow}>
                                        <Text style={s.addrLabel}>{addr.label}</Text>
                                        {addr.isDefault && (
                                            <View style={s.defaultBadge}>
                                                <Text style={s.defaultTxt}>Principal</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={s.addrFull}>{addr.fullAddress}</Text>
                                    <Text style={s.addrCity}>{addr.city}</Text>
                                    {addr.phone ? <Text style={s.addrPhone}>📞 {addr.phone}</Text> : null}
                                </View>
                            </View>
                            <View style={s.actions}>
                                <TouchableOpacity style={s.actionBtn} onPress={() => openEdit(addr)}>
                                    <Feather name="edit-2" size={15} color={COLORS.orange} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[s.actionBtn, s.actionBtnDanger]}
                                    onPress={() => handleDelete(addr.id)}
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
                title={editing ? "Editar dirección" : "Nueva dirección"}
                onClose={() => setModalVisible(false)}
            >
                <FormField
                    label="Etiqueta *"
                    placeholder="Ej: Casa, Oficina, Casa de mamá"
                    value={form.label}
                    onChangeText={(t) => setForm((f) => ({ ...f, label: t }))}
                />
                <FormField
                    label="Dirección completa *"
                    placeholder="Calle 123 # 45-67, Apto 8"
                    value={form.fullAddress}
                    onChangeText={(t) => setForm((f) => ({ ...f, fullAddress: t }))}
                    multiline
                />
                <FormField
                    label="Ciudad / Municipio *"
                    placeholder="Bogotá, Cali, Medellín..."
                    value={form.municipio}
                    onChangeText={(t) => setForm((f) => ({ ...f, municipio: t }))}
                />
                <FormField
                    label="Departamento *"
                    placeholder="Cundinamarca, Valle del Cauca..."
                    value={form.departamento}
                    onChangeText={(t) => setForm((f) => ({ ...f, departamento: t }))}
                />
                <FormField
                    label="Teléfono de contacto"
                    placeholder="+57 300 000 0000"
                    value={form.phone}
                    onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
                    keyboardType="phone-pad"
                />

                <FormToggle
                    label="Establecer como dirección principal"
                    value={form.isDefault}
                    onToggle={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                />

                <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                    <Text style={s.saveBtnTxt}>
                        {editing ? "Guardar cambios" : "Agregar dirección"}
                    </Text>
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
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
    },
    labelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    addrLabel: { fontSize: 14, fontWeight: "800", color: COLORS.text },
    defaultBadge: {
        backgroundColor: COLORS.orange + "20",
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    defaultTxt: { fontSize: 10, fontWeight: "700", color: COLORS.orange },
    addrFull: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
    addrCity: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
    addrPhone: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
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