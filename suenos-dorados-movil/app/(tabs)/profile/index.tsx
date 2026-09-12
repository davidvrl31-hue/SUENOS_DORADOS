import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useToast } from "../../../components/ui/Toast";
import { COLORS, RADIUS } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";

// ─── Menú ─────────────────────────────────────────────────────────────────────
interface ProfileMenuItem {
    href: string;
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    desc: string;
}

const MENU_ITEMS: ProfileMenuItem[] = [
    { href: "/(tabs)/profile/orders",        label: "Mis pedidos",      icon: "package",     desc: "Historial de compras" },
    { href: "/(tabs)/profile/addresses",     label: "Mis direcciones",  icon: "map-pin",     desc: "Gestiona tus direcciones" },
    { href: "/(tabs)/profile/payments",      label: "Métodos de pago",  icon: "credit-card", desc: "Tarjetas y más" },
    { href: "/(tabs)/profile/notifications", label: "Notificaciones",   icon: "bell",        desc: "Alertas y avisos" },
    { href: "/(tabs)/profile/support",       label: "Ayuda y soporte",  icon: "help-circle", desc: "Preguntas frecuentes" },
];

// ─── Modal de edición de perfil ───────────────────────────────────────────────
interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    initialName: string;
    initialApellido: string;
    initialTelefono: string;
    onSave: (data: { nombreUsuario: string; apellidoUsuario: string; telefono: string }) => Promise<void>;
}

function EditProfileModal({ visible, onClose, initialName, initialApellido, initialTelefono, onSave }: EditProfileModalProps) {
    const [nombre, setNombre] = useState(initialName);
    const [apellido, setApellido] = useState(initialApellido);
    const [telefono, setTelefono] = useState(initialTelefono);
    const [saving, setSaving] = useState(false);

    // Sincronizar con valores externos cuando abre el modal
    const handleOpen = () => {
        setNombre(initialName);
        setApellido(initialApellido);
        setTelefono(initialTelefono);
    };

    const handleSave = async () => {
        if (!nombre.trim() || !apellido.trim()) return;
        setSaving(true);
        try {
            await onSave({ nombreUsuario: nombre.trim(), apellidoUsuario: apellido.trim(), telefono: telefono.trim() });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onShow={handleOpen}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={m.overlay}
            >
                <View style={m.sheet}>
                    {/* Handle */}
                    <View style={m.handle} />

                    {/* Header */}
                    <View style={m.header}>
                        <Text style={m.title}>Editar perfil</Text>
                        <TouchableOpacity onPress={onClose} style={m.closeBtn}>
                            <Feather name="x" size={20} color={COLORS.muted} />
                        </TouchableOpacity>
                    </View>

                    {/* Campos */}
                    <View style={m.fields}>
                        <View style={m.fieldGroup}>
                            <Text style={m.label}>Nombre *</Text>
                            <TextInput
                                style={m.input}
                                value={nombre}
                                onChangeText={setNombre}
                                placeholder="Tu nombre"
                                placeholderTextColor={COLORS.muted}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={m.fieldGroup}>
                            <Text style={m.label}>Apellido *</Text>
                            <TextInput
                                style={m.input}
                                value={apellido}
                                onChangeText={setApellido}
                                placeholder="Tu apellido"
                                placeholderTextColor={COLORS.muted}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={m.fieldGroup}>
                            <Text style={m.label}>Teléfono</Text>
                            <TextInput
                                style={m.input}
                                value={telefono}
                                onChangeText={setTelefono}
                                placeholder="+57 300 000 0000"
                                placeholderTextColor={COLORS.muted}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Botones */}
                    <View style={m.actions}>
                        <TouchableOpacity style={m.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                            <Text style={m.cancelTxt}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[m.saveBtn, (!nombre.trim() || !apellido.trim() || saving) && m.saveBtnDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.85}
                            disabled={!nombre.trim() || !apellido.trim() || saving}
                        >
                            <Text style={m.saveTxt}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
const ProfileScreen = memo(function ProfileScreen() {
    const router = useRouter();
    const { user, isAuthenticated, logout, updateProfile } = useAuth();
    const { showToast } = useToast();
    const [editModalOpen, setEditModalOpen] = useState(false);

    const handleMenuPress = useCallback((href: string) => {
        router.push(href as any);
    }, [router]);

    const handleLogout = useCallback(async () => {
        await logout();
        router.replace("/(auth)/login");
    }, [logout, router]);

    const goToLogin    = useCallback(() => router.push("/(auth)/login"), [router]);
    const goToRegister = useCallback(() => router.push("/(auth)/register"), [router]);

    const handleSaveProfile = useCallback(async (data: { nombreUsuario: string; apellidoUsuario: string; telefono: string }) => {
        try {
            await updateProfile(data);
            showToast("Perfil actualizado ✅");
        } catch {
            showToast("No se pudo actualizar el perfil", "error");
            throw new Error("update failed");
        }
    }, [updateProfile, showToast]);

    // Inicial del avatar
    const initial = isAuthenticated && user ? user.name[0]?.toUpperCase() ?? "?" : "?";

    return (
        <View style={s.root}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.title}>Mi perfil</Text>

                <View style={s.grid}>
                    {/* ── Tarjeta de usuario ── */}
                    <View style={s.userCard}>
                        {/* Avatar + info + lápiz */}
                        <View style={s.userTopRow}>
                            <View style={s.avatarCircle}>
                                <Text style={s.avatarInitial}>{initial}</Text>
                            </View>

                            <View style={s.userInfo}>
                                {isAuthenticated && user ? (
                                    <>
                                        <Text style={s.userName} numberOfLines={1}>
                                            {user.name} {user.apellido}
                                        </Text>
                                        <Text style={s.userEmail} numberOfLines={1}>
                                            {user.email}
                                        </Text>
                                        {user.telefono ? (
                                            <Text style={s.userPhone}>{user.telefono}</Text>
                                        ) : null}
                                        <View style={s.rolBadge}>
                                            <Text style={s.rolBadgeText}>
                                                {user.idRol === 1 ? "Administrador" : "Cliente"}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text style={s.guestName}>Invitado</Text>
                                        <Text style={s.guestDesc}>Inicia sesión para continuar</Text>
                                    </>
                                )}
                            </View>

                            {/* Botón lápiz de edición — solo si está autenticado */}
                            {isAuthenticated && user && (
                                <TouchableOpacity
                                    style={s.editBtn}
                                    onPress={() => setEditModalOpen(true)}
                                    activeOpacity={0.75}
                                    accessibilityLabel="Editar perfil"
                                    accessibilityRole="button"
                                >
                                    <Feather name="edit-2" size={16} color={COLORS.orange} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Botones auth / logout */}
                        {!isAuthenticated ? (
                            <View style={s.authButtons}>
                                <TouchableOpacity style={s.btnPrimary} onPress={goToLogin} activeOpacity={0.8}>
                                    <Feather name="log-in" size={16} color="#fff" />
                                    <Text style={s.btnPrimaryText}>Iniciar sesión</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.btnOutline} onPress={goToRegister} activeOpacity={0.8}>
                                    <Feather name="user-plus" size={16} color={COLORS.orange} />
                                    <Text style={s.btnOutlineText}>Crear cuenta</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={s.logoutCard} onPress={handleLogout} activeOpacity={0.8}>
                                <Feather name="log-out" size={18} color={COLORS.red} />
                                <Text style={s.logoutText}>Cerrar sesión</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Menú ── */}
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.href}
                            style={s.menuCard}
                            onPress={() => handleMenuPress(item.href)}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                        >
                            <View style={s.menuCardContent}>
                                <View style={s.menuIconBox}>
                                    <Feather name={item.icon} size={20} color={COLORS.orange} />
                                </View>
                                <View style={s.menuCardInfo}>
                                    <Text style={s.menuCardLabel}>{item.label}</Text>
                                    <Text style={s.menuCardDesc}>{item.desc}</Text>
                                </View>
                            </View>
                            <Feather name="chevron-right" size={18} color="#d1d5db" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Modal edición de perfil */}
            {isAuthenticated && user && (
                <EditProfileModal
                    visible={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    initialName={user.name}
                    initialApellido={user.apellido}
                    initialTelefono={user.telefono ?? ""}
                    onSave={handleSaveProfile}
                />
            )}
        </View>
    );
});

export default ProfileScreen;

// ─── Estilos pantalla ─────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 20,
    },
    grid: { gap: 12 },

    // Tarjeta usuario
    userCard: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        marginBottom: 8,
        gap: 16,
    },
    userTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.amber,
        borderWidth: 2,
        borderColor: COLORS.amberBorder,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    avatarInitial: { fontSize: 22, fontWeight: "800", color: COLORS.orange },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 3 },
    userEmail: { fontSize: 12, color: COLORS.muted, marginBottom: 2 },
    userPhone: { fontSize: 12, color: COLORS.mutedDark, marginBottom: 2 },
    rolBadge: {
        alignSelf: "flex-start",
        backgroundColor: COLORS.amber,
        borderRadius: 10,
        paddingHorizontal: 9,
        paddingVertical: 3,
        marginTop: 6,
    },
    rolBadgeText: { fontSize: 10, fontWeight: "700", color: COLORS.orange },
    guestName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
    guestDesc: { fontSize: 13, color: COLORS.muted, marginTop: 4 },

    // Botón lápiz
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.amber,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    // Auth buttons
    authButtons: { flexDirection: "row", gap: 12 },
    btnPrimary: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.md,
        paddingVertical: 12,
    },
    btnPrimaryText: { fontSize: 14, fontWeight: "600", color: "#fff" },
    btnOutline: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 2,
        borderColor: COLORS.orange,
        borderRadius: RADIUS.md,
        paddingVertical: 10,
    },
    btnOutlineText: { fontSize: 14, fontWeight: "600", color: COLORS.orange },

    logoutCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#fff0f0",
        borderRadius: RADIUS.md,
        paddingVertical: 12,
    },
    logoutText: { fontSize: 14, fontWeight: "600", color: COLORS.red },

    // Menú cards
    menuCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
    },
    menuCardContent: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    menuIconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
    },
    menuCardInfo: { flex: 1 },
    menuCardLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 2 },
    menuCardDesc: { fontSize: 12, color: COLORS.muted },
});

// ─── Estilos modal ────────────────────────────────────────────────────────────
const m = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: { fontSize: 18, fontWeight: "800", color: COLORS.text },
    closeBtn: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    fields: { gap: 14, marginBottom: 24 },
    fieldGroup: {},
    label: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
    input: {
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    actions: { flexDirection: "row", gap: 12 },
    cancelBtn: {
        flex: 1,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.bg,
    },
    cancelTxt: { fontSize: 14, fontWeight: "600", color: COLORS.muted },
    saveBtn: {
        flex: 2,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.orange,
    },
    saveBtnDisabled: { opacity: 0.45 },
    saveTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
});
