import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

const Hero = memo(function Hero() {
    const router = useRouter();
    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    return (
        <View style={s.hero}>
            <View style={s.chip}>
                <Text style={s.chipTxt}>Nueva colección</Text>
            </View>
            <Text style={s.title}>El descanso{"\n"}que mereces</Text>
            <Text style={s.sub}>Hasta 30% off en toda la colección</Text>
            <TouchableOpacity
                style={s.cta}
                onPress={goToExplore}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ver colección"
            >
                <Text style={s.ctaTxt}>Ver colección</Text>
                <Feather name="chevron-right" size={16} color={COLORS.orange} />
            </TouchableOpacity>
        </View>
    );
});

export default Hero;

const s = StyleSheet.create({
    hero: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.xl,
        padding: 24,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    chip: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: RADIUS.full,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 12,
    },
    chipTxt: { fontSize: 11, fontWeight: "700", color: "#fff" },
    title: {
        fontSize: 28,
        fontWeight: "900",
        color: "#fff",
        lineHeight: 34,
        marginBottom: 8,
    },
    sub: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: 20,
        lineHeight: 20,
    },
    cta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ctaTxt: { color: COLORS.orange, fontSize: 14, fontWeight: "700" },
});