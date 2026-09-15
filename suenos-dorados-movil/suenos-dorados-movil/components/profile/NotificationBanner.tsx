import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface NotificationBannerProps {
    count: number;
}

export default function NotificationBanner({ count }: NotificationBannerProps) {
    if (count === 0) return null;

    return (
        <View style={s.banner}>
            <Feather name="bell" size={14} color={COLORS.amberAccent} />
            <Text style={s.bannerTxt}>
                Tenés {count} notificación{count > 1 ? "es" : ""} sin leer
            </Text>
        </View>
    );
}

const s = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.amber,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
    },
    bannerTxt: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.amberAccent,
    },
});
