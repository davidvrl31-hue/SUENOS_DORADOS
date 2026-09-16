import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface EmptyStateProps {
    icon: React.ComponentProps<typeof Feather>["name"];
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon,
    title,
    subtitle,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={s.wrap}>
            <View style={s.iconBox}>
                <Feather name={icon} size={32} color={COLORS.orange} />
            </View>
            <Text style={s.title}>{title}</Text>
            <Text style={s.sub}>{subtitle}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={s.btn} onPress={onAction} activeOpacity={0.85}>
                    <Text style={s.btnTxt}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 40,
    },
    iconBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        marginBottom: 4,
    },
    title: { fontSize: 18, fontWeight: "800", color: COLORS.text, textAlign: "center" },
    sub: { fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 20 },
    btn: {
        marginTop: 8,
        backgroundColor: COLORS.orange,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    btnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});