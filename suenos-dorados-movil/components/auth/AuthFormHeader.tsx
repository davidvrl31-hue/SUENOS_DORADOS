import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface AuthFormHeaderProps {
    title: string;
    subtitle: string;
}

const AuthFormHeader = memo(function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
    return (
        <View style={s.header}>
            <View style={s.logoWrap}>
                {/* Logo real de Sueños Dorados */}
                <View style={s.logoCircle}>
                    <Image
                        source={require("../../assets/images/logo.jpeg")}
                        style={s.logoImg}
                        resizeMode="cover"
                    />
                </View>
                <Text style={s.brand}>SUEÑOS DORADOS</Text>
                <Text style={s.tagline}>Sofá · Cama · Baño</Text>
                <Text style={s.title}>{title}</Text>
                <Text style={s.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
});

export default AuthFormHeader;

const s = StyleSheet.create({
    header: {
        backgroundColor: COLORS.orange,
        paddingTop: 32,
        paddingBottom: 28,
        paddingHorizontal: 20,
        borderBottomRightRadius: 32,
        borderBottomLeftRadius: 32,
    },
    logoWrap: { alignItems: "center" },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.6)",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    logoImg: {
        width: "100%",
        height: "100%",
    },
    brand: {
        color: "#ffffff",
        fontSize: 13,
        letterSpacing: 3,
        fontWeight: "800",
    },
    tagline: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 11,
        letterSpacing: 1,
        marginTop: 2,
        marginBottom: 10,
    },
    title: {
        color: "#ffffff",
        fontSize: 22,
        fontWeight: "800",
        marginTop: 4,
        textAlign: "center",
    },
    subtitle: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        marginTop: 4,
        textAlign: "center",
    },
});
