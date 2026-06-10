import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

const Hero = memo(function Hero() {
    const router = useRouter();
    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    return (
        <View style={s.hero}>
            <View style={s.heroLeft}>
                <View style={s.chip}>
                    <Text style={s.chipTxt}>Invierno 2026</Text>
                </View>
                <Text style={s.title}>El descanso{"\n"}que merecés</Text>
                <Text style={s.sub}>Hasta 30% off en toda la colección</Text>
                <TouchableOpacity
                    style={s.cta}
                    onPress={goToExplore}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Ver colección"
                >
                    <Text style={s.ctaTxt}>Ver colección</Text>
                    <Feather name="arrow-right" size={14} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={s.heroRight}>
                <Feather name="moon" size={48} color={COLORS.orange} style={{ opacity: 0.25 }} />
            </View>
        </View>
    );
});

export default Hero;

const s = StyleSheet.create({
    hero: {
        margin: 20,
        marginBottom: 16,
        backgroundColor: COLORS.amber,
        borderRadius: 20,
        padding: 22,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f5e0b0",
    },
    heroLeft: { flex: 1 },
    heroRight: { paddingLeft: 10 },
    chip: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipTxt: { fontSize: 11, fontWeight: "700", color: COLORS.muted },
    title: { fontSize: 24, fontWeight: "900", color: COLORS.text, lineHeight: 28, marginBottom: 8 },
    sub: { fontSize: 13, color: COLORS.muted, marginBottom: 18, lineHeight: 18 },
    cta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: COLORS.orange,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    ctaTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
});