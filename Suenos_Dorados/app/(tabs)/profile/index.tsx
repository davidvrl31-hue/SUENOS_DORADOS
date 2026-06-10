import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AuthBanners from "../../../components/profile/AuthBanners";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import ProfileMenu, { MenuItem } from "../../../components/profile/ProfileMenu";
import ProfileStats from "../../../components/profile/ProfileStats";
import { COLORS } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useOrders } from "../../../context/OrdersContext";
import { PROFILE_MENU_ITEMS } from "@/constants/profile";

const ProfileScreen = memo(function ProfileScreen() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { orders } = useOrders();

    const handleMenuItemPress = useCallback(
        async (item: MenuItem) => {
            if (item.danger) {
                await logout();
                router.replace("/(auth)/login");
                return;
            }
            if (item.route) {
                router.push(item.route as any);
            }
        },
        [logout, router],
    );

    const goToLogin = useCallback(() => router.push("/(auth)/login"), [router]);
    const goToRegister = useCallback(() => router.push("/(auth)/register"), [router]);

    return (
        <View style={s.root}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <ProfileHeader
                    name={user?.name ?? ""}
                    apellido={user?.apellido}
                    email={user?.email ?? ""}
                    telefono={user?.telefono}
                    idRol={user?.idRol}
                    isAuthenticated={isAuthenticated}
                />

                {isAuthenticated ? (
                    <ProfileStats orders={orders} />
                ) : (
                    <AuthBanners onLogin={goToLogin} onRegister={goToRegister} />
                )}

                <ProfileMenu
                    items={PROFILE_MENU_ITEMS}
                    onItemPress={handleMenuItemPress}
                    showLogout={isAuthenticated}
                />

                <Text style={s.version}>Sueños Dorados · v1.0.0</Text>
            </ScrollView>
        </View>
    );
});

export default ProfileScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
    version: { fontSize: 11, color: COLORS.mutedDark, textAlign: "center", marginTop: 24 },
});
