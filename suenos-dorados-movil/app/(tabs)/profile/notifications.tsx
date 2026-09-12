import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import { useToast } from "../../../components/ui/Toast";
import { COLORS, RADIUS } from "../../../constants/theme";
import { useApp } from "@/context/AppContext";

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    order: { bg: "#DCFCE7", text: "#16A34A", icon: "package" },
    promo: { bg: "#FEF3C7", text: "#CA8A04", icon: "tag" },
    delivery: { bg: "#DBEAFE", text: "#2563EB", icon: "truck" },
    app: { bg: "#E9D5FF", text: "#9333EA", icon: "smartphone" },
};

const NotificationsScreen = memo(function NotificationsScreen() {
    const { notifications } = useApp();
    const unread = notifications.filter((n) => !n.read);
    const read = notifications.filter((n) => n.read);

    return (
        <View style={s.root}>
            <ProfileScreenHeader title="Notificaciones" />
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* Unread Banner */}
                {unread.length > 0 && (
                    <View style={s.banner}>
                        <Feather name="bell" size={16} color={COLORS.orange} />
                        <Text style={s.bannerText}>
                            Tienes {unread.length} notificación{unread.length > 1 ? "es" : ""} sin leer
                        </Text>
                    </View>
                )}

                {notifications.length === 0 && (
                    <View style={s.emptyContainer}>
                        <View style={s.emptyIcon}>
                            <Feather name="bell" size={36} color={COLORS.orange} />
                        </View>
                        <Text style={s.emptyTitle}>No hay notificaciones</Text>
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
                                const colors = TYPE_COLORS[notif.type] || TYPE_COLORS.order;
                                return (
                                    <View key={notif.id} style={[s.notificationCard, s.unreadCard]}>
                                        <View style={[s.notifIcon, { backgroundColor: colors.bg }]}>
                                            <Feather name={colors.icon as any} size={18} color={colors.text} />
                                        </View>
                                        <View style={s.notifContent}>
                                            <Text style={s.notifTitle}>{notif.title}</Text>
                                            <Text style={s.notifMessage}>{notif.message}</Text>
                                            <Text style={s.notifTime}>{notif.time}</Text>
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
                                const colors = TYPE_COLORS[notif.type] || TYPE_COLORS.order;
                                return (
                                    <View key={notif.id} style={s.notificationCard}>
                                        <View style={[s.notifIcon, { backgroundColor: colors.bg }]}>
                                            <Feather name={colors.icon as any} size={18} color={colors.text} />
                                        </View>
                                        <View style={s.notifContent}>
                                            <Text style={[s.notifTitle, s.readTitle]}>{notif.title}</Text>
                                            <Text style={[s.notifMessage, s.readMessage]}>{notif.message}</Text>
                                            <Text style={[s.notifTime, s.readTime]}>{notif.time}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
});

export default NotificationsScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, paddingBottom: 40 },
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.amber,
        borderWidth: 1,
        borderColor: "#F5D99A",
        borderRadius: RADIUS.md,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 20,
    },
    bannerText: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.orange,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.muted,
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    notificationsList: {
        gap: 12,
    },
    notificationCard: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        opacity: 0.7,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.orange,
        opacity: 1,
    },
    notifIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
    },
    notifContent: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    notifMessage: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 4,
        lineHeight: 18,
    },
    notifTime: {
        fontSize: 12,
        color: COLORS.mutedDark,
        marginTop: 6,
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
    },
});
