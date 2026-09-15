import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface CompactHeaderProps {
    title: string;
    subtitle: string;
}

/**
 * Header compacto para móvil - ocupa menos espacio vertical que AuthFormHeader
 */
const CompactHeader = memo(function CompactHeader({ title, subtitle }: CompactHeaderProps) {
    return (
        <View style={s.header}>
            <View style={s.content}>
                <View style={s.logoCircle}>
                    <Image
                        source={require("../../assets/images/logo.jpeg")}
                        style={s.logoImg}
                        resizeMode="cover"
                    />
                </View>
                <View style={s.textContent}>
                    <Text style={s.brand}>SUEÑOS DORADOS</Text>
                    <Text style={s.title}>{title}</Text>
                    <Text style={s.subtitle}>{subtitle}</Text>
                </View>
            </View>
        </View>
    );
});

export default CompactHeader;

const s = StyleSheet.create({
    header: {
        backgroundColor: COLORS.orange,
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomRightRadius: 24,
        borderBottomLeftRadius: 24,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.5)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    logoImg: {
        width: "100%",
        height: "100%",
    },
    textContent: {
        flex: 1,
    },
    brand: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: "700",
        marginBottom: 2,
    },
    title: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 2,
    },
    subtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
    },
});
