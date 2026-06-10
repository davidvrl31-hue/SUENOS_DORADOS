import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useState } from "react";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { useCart } from "../../context/CartContext";
import AppDrawer from "../drawer/AppDrawer";

interface AppHeaderProps {
    showSearch?: boolean;
    title?: string;
}

const AppHeader = memo(function AppHeader({ showSearch = true, title }: AppHeaderProps) {
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { count } = useCart();

    const openDrawer = useCallback(() => setDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);
    const goToCart = useCallback(() => router.push("/(tabs)/cart" as any), [router]);
    const goToProfile = useCallback(() => router.push("/(tabs)/profile" as any), [router]);
    // const goToExplore = useCallback(() => router.push("/(tabs)/explore" as any), [router]);
    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore" as any),[router]);


    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
            <AppDrawer isOpen={drawerOpen} onClose={closeDrawer} />

            <View style={s.header}>
                <View style={s.row}>
                    {/* Hamburger */}
                    <TouchableOpacity
                        style={s.menuBtn}
                        onPress={openDrawer}
                        activeOpacity={0.7}
                        accessibilityLabel="Abrir menú"
                        accessibilityRole="button"
                    >
                        <Feather name="menu" size={20} color={COLORS.text} />
                    </TouchableOpacity>

                    {/* Marca o título */}
                    <View style={s.center}>
                        {title ? (
                            <Text style={s.pageTitle}>{title}</Text>
                        ) : (
                            <View style={s.brandRow}>
                                <Image
                                    source={require("../../assets/images/logo.jpeg")}
                                    style={s.logoImg}
                                    resizeMode="cover"
                                />
                                <View>
                                    <Text style={s.storeName}>Sueños Dorados</Text>
                                    <Text style={s.storeSub}>Sofá · Cama · Baño</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Iconos derecha */}
                    <View style={s.rightIcons}>
                        {/* Carrito con badge */}
                        <TouchableOpacity
                            style={[s.iconBtn, s.cartBtn]}
                            onPress={goToCart}
                            activeOpacity={0.7}
                            accessibilityLabel={`Carrito, ${count} productos`}
                            accessibilityRole="button"
                        >
                            <Feather name="shopping-cart" size={18} color={COLORS.orange} />
                            {count > 0 && (
                                <View style={s.badge}>
                                    <Text style={s.badgeTxt}>{count > 9 ? "9+" : count}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Usuario */}
                        <TouchableOpacity
                            style={s.iconBtn}
                            onPress={goToProfile}
                            activeOpacity={0.7}
                            accessibilityLabel="Mi perfil"
                            accessibilityRole="button"
                        >
                            <Feather name="user" size={18} color={COLORS.mutedDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Buscador */}
                {showSearch && (
                    <TouchableOpacity
                        style={s.searchWrap}
                        activeOpacity={0.7}
                        onPress={goToExplore}
                        accessibilityLabel="Buscar productos"
                        accessibilityRole="search"
                    >
                        <Feather name="search" size={15} color={COLORS.mutedDark} style={s.searchIcon} />
                        <Text style={s.searchPlaceholder}>Buscar edredones, cobijas...</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
});

export default AppHeader;

const s = StyleSheet.create({
    header: {
        backgroundColor: COLORS.bg,
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    menuBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    center: { flex: 1 },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logoImg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: COLORS.amberBorder,
    },
    storeName: { fontSize: 16, fontWeight: "800", color: COLORS.text, letterSpacing: -0.3 },
    storeSub: { fontSize: 10, color: COLORS.muted, marginTop: 1 },
    pageTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
    rightIcons: { flexDirection: "row", gap: 8 },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    cartBtn: { backgroundColor: COLORS.amber, borderColor: COLORS.amberBorder },
    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.orange,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: COLORS.bg,
        paddingHorizontal: 2,
    },
    badgeTxt: { fontSize: 9, fontWeight: "800", color: "#fff" },
    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    searchIcon: { marginRight: 10 },
    searchPlaceholder: { flex: 1, fontSize: 14, color: COLORS.mutedDark },
});
