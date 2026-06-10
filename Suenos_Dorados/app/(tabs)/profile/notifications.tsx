import React, { memo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import NotificationBanner from "../../../components/profile/NotificationBanner";
import NotificationCard from "../../../components/profile/NotificationCard";
import { NOTIFICATION_ITEMS } from "../../../constants/profile";
import { COLORS, RADIUS } from "../../../constants/theme";

const NotificationsScreen = memo(function NotificationsScreen() {
    const unreadCount = NOTIFICATION_ITEMS.filter((n) => !n.read).length;

    return (
        <View style={s.root}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <NotificationBanner count={unreadCount} />

                <View style={s.list}>
                    {NOTIFICATION_ITEMS.map((item, i) => (
                        <View key={item.id}>
                            <NotificationCard item={item} />
                            {i < NOTIFICATION_ITEMS.length - 1 && <View style={s.divider} />}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
});

export default NotificationsScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 16, paddingBottom: 100 },
    list: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 68,
    },
});
