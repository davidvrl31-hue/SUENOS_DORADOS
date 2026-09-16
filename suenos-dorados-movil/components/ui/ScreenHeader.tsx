import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface ScreenHeaderProps {
    title: string;
    /** Nodo opcional en el lado derecho (ej: botón "+" para agregar) */
    right?: React.ReactNode;
}

const ScreenHeader = memo(function ScreenHeader({ title, right }: ScreenHeaderProps) {
    const router = useRouter();
    const handleBack = useCallback(() => router.back(), [router]);

    return (
        <View style={s.header}>
            <TouchableOpacity
                style={s.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
                accessibilityLabel="Volver"
                accessibilityRole="button"
            >
                <Feather name="arrow-left" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={s.title}>{title}</Text>
            {right ? right : <View style={s.placeholder} />}
        </View>
    );
});

export default ScreenHeader;

const s = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.bg,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    title: { fontSize: 17, fontWeight: "800", color: COLORS.text },
    placeholder: { width: 40 },
});
