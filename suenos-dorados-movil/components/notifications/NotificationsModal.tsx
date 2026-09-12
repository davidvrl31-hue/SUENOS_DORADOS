import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS } from "../../constants/theme";
import { useApp } from "../../context/AppContext";

interface NotificationsModalProps {
    visible: boolean;
    onClose: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    order: { bg: "#DCFCE7", text: "#16A34A", icon: "package" },
    promo: { bg: "#FEF3C7", text: "#CA8A04", icon: "tag" },
    delivery: { bg: "#DBEAFE", text: "#2563EB", icon: "truck" },
    app: { bg: "#E9D5FF", text: "#9333EA", icon: "smartphone" },
};

const NotificationsModal = memo(function NotificationsModal({
    visible,
    onClose,
}: NotificationsModalProps) {
    const { notifications } = useApp();
    const unread = notifications.filter((n) => !n.read);
    const read = notifications.filter((n) => n.read);

    const handleBackdropPress = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <TouchableOpacity
                style={s.backdrop}
                activeOpacity={1}
                onPress={handleBackdropPress}
            >
                <TouchableOpacity activeOpacity={1} style={s.modalContainer}>
                    <SafeAreaView style={s.safeArea} edges={["top"]}>
                        <View style={s.modal}>
                            {/* Header */}
                            <View style={s.header}>
                                <View style={s.headerLeft}>
                                    <Feather name="bell" size={20} color={COLORS.orange} />
                                    <Text style={s.title}>Notificaciones</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={s.closeBtn}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cerrar notificaciones"
                                >
                                    <Feather name="x" size={20} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <ScrollView
                                style={s.scroll}
                                contentContainerStyle={s.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Unread Banner */}
                                {unread.length > 0 && (
                                    <View style={s.banner}>
                                        <Feather name="bell" size={14} color={COLORS.orange} />
                                        <Text style={s.bannerText}>
                                            {unread.length} sin leer
                                        </Text>
                                    </View>
                                )}

                                {notifications.length === 0 && (
                                    <View style={s.emptyContainer}>
                                        <View style={s.emptyIcon}>
                                            <Feather name="bell" size={28} color={COLORS.orange} />
                                        </View>
                                        <Text style={s.emptyTitle}>
                                            No hay notificaciones
                                        </Text>
                                        <Text style={s.emptySubtitle}>
                                            Te notificaremos sobre pedidos, ofertas y actualizaciones
                                        </Text>
                                    </View>
                                )}

                                {/* Unread Section */}
                                {unread.length > 0 && (
                                    <View style={s.section}>
                                        <Text style={s.sectionLabel}>SIN LEER</Text>
                                        <View style={s.notificationsList}>
                                            {unread.map((notif) => {
                                                const colors =
                                                    TYPE_COLORS[notif.type] || TYPE_COLORS.order;
                                                return (
                                                    <View
                                                        key={notif.id}
                                                        style={[s.notificationCard, s.unreadCard]}
                                                    >
                                                        <View
                                                            style={[
                                                                s.notifIcon,
                                                                { backgroundColor: colors.bg },
                                                            ]}
                                                        >
                                                            <Feather
                                                                name={colors.icon as any}
                                                                size={16}
                                                                color={colors.text}
                                                            />
                                                        </View>
                                                        <View style={s.notifContent}>
                                                            <Text style={s.notifTitle}>
                                                                {notif.title}
                                                            </Text>
                                                            <Text style={s.notifMessage}>
                                                                {notif.message}
                                                            </Text>
                                                            <Text style={s.notifTime}>
                                                                {notif.time}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {/* Read Section */}
                                {read.length > 0 && (
                                    <View style={s.section}>
                                        <Text style={s.sectionLabel}>ANTERIORES</Text>
                                        <View style={s.notificationsList}>
                                            {read.map((notif) => {
                                                const colors =
                                                    TYPE_COLORS[notif.type] || TYPE_COLORS.order;
                                                return (
                                                    <View key={notif.id} style={s.notificationCard}>
                                                        <View
                                                            style={[
                                                                s.notifIcon,
                                                                { backgroundColor: colors.bg },
                                                            ]}
                                                        >
                                                            <Feather
                                                                name={colors.icon as any}
                                                                size={16}
                                                                color={colors.text}
                                                            />
                                                        </View>
                                                        <View style={s.notifContent}>
                                                            <Text
                                                                style={[s.notifTitle, s.readTitle]}
                                                            >
                                                                {notif.title}
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    s.notifMessage,
                                                                    s.readMessage,
                                                                ]}
                                                            >
                                                                {notif.message}
                                                            </Text>
                                                            <Text style={[s.notifTime, s.readTime]}>
                                                                {notif.time}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
});

export default NotificationsModal;

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-start",
        paddingTop: 60,
    },
    modalContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 16,
    },
    modal: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        maxHeight: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.text,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: COLORS.amber,
        borderWidth: 1,
        borderColor: "#F5D99A",
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },
    bannerText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.orange,
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: COLORS.muted,
        letterSpacing: 1.2,
        marginBottom: 10,
    },
    notificationsList: {
        gap: 10,
    },
    notificationCard: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: COLORS.bg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        opacity: 0.7,
    },
    unreadCard: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.orange,
        opacity: 1,
        backgroundColor: COLORS.card,
    },
    notifIcon: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
    },
    notifContent: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },
    notifMessage: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 3,
        lineHeight: 16,
    },
    notifTime: {
        fontSize: 11,
        color: COLORS.mutedDark,
        marginTop: 4,
    },
    readTitle: {
        color: "#6B7280",
    },
    readMessage: {
        color: "#9CA3AF",
    },
    readTime: {
        color: "#D1D5DB",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.muted,
        textAlign: "center",
        paddingHorizontal: 30,
        lineHeight: 18,
    },
});
