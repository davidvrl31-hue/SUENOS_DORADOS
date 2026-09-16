import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface AuthBannersProps {
    onLogin: () => void;
    onRegister: () => void;
}

const AuthBanners = memo(function AuthBanners({ onLogin, onRegister }: AuthBannersProps) {
    return (
        <>
            <TouchableOpacity
                style={s.banner}
                onPress={onLogin}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Iniciar sesión"
            >
                <View style={s.bannerLeft}>
                    <View style={s.bannerIcon}>
                        <Feather name="log-in" size={18} color={COLORS.orange} />
                    </View>
                    <View>
                        <Text style={s.bannerTitle}>Iniciá sesión</Text>
                        <Text style={s.bannerSub}>Accedé a todos los beneficios</Text>
                    </View>
                </View>
                <Feather name="chevron-right" size={16} color={COLORS.orange} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[s.banner, s.bannerLast]}
                onPress={onRegister}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Crear cuenta"
            >
                <View style={s.bannerLeft}>
                    <View style={s.bannerIcon}>
                        <Feather name="user-plus" size={18} color={COLORS.orange} />
                    </View>
                    <View>
                        <Text style={s.bannerTitle}>Crea tu cuenta</Text>
                        <Text style={s.bannerSub}>Es gratis y rápido</Text>
                    </View>
                </View>
                <Feather name="chevron-right" size={16} color={COLORS.orange} />
            </TouchableOpacity>
        </>
    );
});

export default AuthBanners;

const s = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.amber,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    bannerLast: { marginBottom: 20 },
    bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    bannerIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    bannerTitle: { fontSize: 14, fontWeight: "800", color: COLORS.text },
    bannerSub: { fontSize: 12, color: COLORS.mutedDark, marginTop: 2 },
});
