import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NotificationItem } from "../../constants/profile";
import { COLORS, RADIUS } from "../../constants/theme";

const ICON_COLORS: Record<string, string> = {
    order: COLORS.orange,
    promo: "#9b72cf",
    delivered: COLORS.green,
    shipping: COLORS.blue,
    info: COLORS.mutedDark,
};

interface NotificationCardProps {
    item: NotificationItem;
}

const NotificationCard = memo(function NotificationCard({ item }: NotificationCardProps) {
    const iconColor = ICON_COLORS[item.type] ?? COLORS.orange;

    return (
        <TouchableOpacity
            style={[s.card, !item.read && s.cardUnread]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: !item.read }}
        >
            <View style={[s.iconWrap, { backgroundColor: item.read ? COLORS.amber : "#fff3dc" }]}>
                <Feather name={item.icon} size={18} color={iconColor} />
            </View>
            <View style={s.content}>
                <View style={s.titleRow}>
                    <Text style={s.title}>{item.title}</Text>
                    {!item.read && <View style={s.dot} />}
                </View>
                <Text style={s.message} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={s.time}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );
});

export default NotificationCard;

const s = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 16,
    },
    cardUnread: {
        backgroundColor: "#fffbf4",
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
    },
    content: {
        flex: 1,
        gap: 3,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
        flex: 1,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.orange,
    },
    message: {
        fontSize: 12,
        color: COLORS.muted,
        lineHeight: 17,
    },
    time: {
        fontSize: 11,
        color: COLORS.mutedDark,
        marginTop: 2,
    },
});
