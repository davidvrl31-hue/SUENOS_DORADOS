import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { useApp } from "@/context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W = Math.min(288, SCREEN_W * 0.78); // 288px como la web

const NAV_ITEMS: {
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    route: string;
    badgeType?: 'cart' | 'favorites';
}[] = [
    { label: "Inicio", icon: "home", route: "/(tabs)/home" },
    { label: "Carrito", icon: "shopping-cart", route: "/(tabs)/cart", badgeType: 'cart' },
    { label: "Favoritos", icon: "heart", route: "/(tabs)/favorites", badgeType: 'favorites' },
    { label: "Mis pedidos", icon: "package", route: "/(tabs)/profile/orders" },
    { label: "Mi perfil", icon: "user", route: "/(tabs)/profile" },
];

const HELP_ITEMS: {
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    route: string;
    badgeType?: 'notifications';
}[] = [
    { label: "Notificaciones", icon: "bell", route: "/(tabs)/profile/notifications", badgeType: 'notifications' },
    { label: "Ayuda y soporte", icon: "help-circle", route: "/(tabs)/profile/support" },
];

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const AppDrawer = memo(function AppDrawer({ isOpen, onClose }: DrawerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { count } = useCart();
    const { favorites } = useFavorites();
    const { user, isAuthenticated, logout } = useAuth();
    const { notifications } = useApp();
    const translateX = useRef(new Animated.Value(-DRAWER_W)).current;
    
    // Notificaciones no leídas
    const unreadNotifications = notifications.filter(n => !n.read).length;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: isOpen ? 0 : -DRAWER_W,
            useNativeDriver: true,
            damping: 22,
            stiffness: 200,
        }).start();
    }, [isOpen, translateX]);

    const navigate = useCallback(
        (route: string) => {
            onClose();
            setTimeout(() => router.push(route as any), 250);
        },
        [onClose, router],
    );

    const handleLogout = useCallback(async () => {
        onClose();
        await logout();
        setTimeout(() => router.replace("/(auth)/login"), 300);
    }, [onClose, logout, router]);

    const goToProfile = useCallback(() => navigate("/(tabs)/profile"), [navigate]);
    const goToLogin = useCallback(() => navigate("/(auth)/login"), [navigate]);

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={s.backdrop} />
            </TouchableWithoutFeedback>

            <Animated.View style={[s.drawer, { transform: [{ translateX }] }]}>
                <SafeAreaView style={s.flex}>

                    {/* Header */}
                    <View style={s.header}>
                        <View style={s.headerContent}>
                            <Image
                                source={require("../../assets/images/logo.jpeg")}
                                style={s.logo}
                                resizeMode="cover"
                            />
                            <View style={s.flex}>
                                <Text style={s.brandName}>Sueños Dorados</Text>
                                <Text style={s.brandTagline}>Sofá · Cama · Baño</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={s.closeBtn}
                            accessibilityLabel="Cerrar menú"
                            accessibilityRole="button"
                        >
                            <Feather name="x" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View style={s.userSection}>
                        {isAuthenticated && user ? (
                            <View>
                                <Text style={s.userName}>{user.name}</Text>
                                <Text style={s.userEmail}>{user.email}</Text>
                            </View>
                        ) : (
                            <View>
                                <Text style={s.guestLabel}>Invitado</Text>
                                <View style={s.authLinks}>
                                    <TouchableOpacity onPress={goToLogin}>
                                        <Text style={s.authLink}>Iniciar sesión</Text>
                                    </TouchableOpacity>
                                    <Text style={s.authSeparator}>|</Text>
                                    <TouchableOpacity onPress={() => navigate("/(auth)/register")}>
                                        <Text style={s.authLink}>Registrarse</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Nav principal */}
                    <View style={s.menuSection}>
                        <Text style={s.sectionLabel}>MENÚ</Text>
                        {NAV_ITEMS.map((item) => {
                            const active = pathname === item.route;
                            let badgeCount = 0;
                            if (item.badgeType === 'cart') badgeCount = count;
                            if (item.badgeType === 'favorites') badgeCount = favorites.length;
                            
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[s.menuItem, active && s.menuItemActive]}
                                    onPress={() => navigate(item.route)}
                                    activeOpacity={0.7}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected: active }}
                                >
                                    <View style={s.menuItemLeft}>
                                        <Feather 
                                            name={item.icon} 
                                            size={18} 
                                            color={active ? COLORS.orange : COLORS.text} 
                                        />
                                        <Text style={[s.menuItemLabel, active && s.menuItemLabelActive]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    {badgeCount > 0 && (
                                        <View style={s.badge}>
                                            <Text style={s.badgeText}>{badgeCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Ayuda */}
                    <View style={s.menuSection}>
                        <Text style={s.sectionLabel}>AYUDA</Text>
                        {HELP_ITEMS.map((item) => {
                            const active = pathname === item.route;
                            let badgeCount = 0;
                            if (item.badgeType === 'notifications') badgeCount = unreadNotifications;
                            
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[s.menuItem, active && s.menuItemActive]}
                                    onPress={() => navigate(item.route)}
                                    activeOpacity={0.7}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected: active }}
                                >
                                    <View style={s.menuItemLeft}>
                                        <Feather 
                                            name={item.icon} 
                                            size={18} 
                                            color={active ? COLORS.orange : COLORS.text} 
                                        />
                                        <Text style={[s.menuItemLabel, active && s.menuItemLabelActive]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    {badgeCount > 0 && (
                                        <View style={s.badge}>
                                            <Text style={s.badgeText}>{badgeCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Footer */}
                    <View style={s.footer}>
                        {isAuthenticated ? (
                            <TouchableOpacity
                                style={s.logoutBtn}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Cerrar sesión"
                            >
                                <Feather name="log-out" size={18} color={COLORS.red} />
                                <Text style={s.logoutText}>Cerrar sesión</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={s.loginBtn}
                                onPress={goToLogin}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Iniciar sesión"
                            >
                                <Feather name="log-in" size={18} color={COLORS.orange} />
                                <Text style={s.loginText}>Iniciar sesión</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={s.copyright}>Sueños Dorados © 2026</Text>
                    </View>

                </SafeAreaView>
            </Animated.View>
        </Modal>
    );
});

export default AppDrawer;

const s = StyleSheet.create({
    flex: { flex: 1 },
    backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    drawer: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_W,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
    },
    // Header naranja
    header: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.4)",
    },
    brandName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
        lineHeight: 20,
    },
    brandTagline: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 2,
    },
    closeBtn: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    // User section
    userSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: "rgba(245, 166, 35, 0.05)",
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 2,
    },
    guestLabel: {
        fontSize: 14,
        color: COLORS.muted,
        marginBottom: 8,
    },
    authLinks: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    authLink: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.orange,
    },
    authSeparator: {
        fontSize: 14,
        color: "#d1d5db",
    },
    // Menu sections
    menuSection: {
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        marginBottom: 2,
    },
    menuItemActive: {
        backgroundColor: "rgba(245, 166, 35, 0.1)",
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    menuItemLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.text,
    },
    menuItemLabelActive: {
        color: COLORS.orange,
        fontWeight: "600",
    },
    badge: {
        backgroundColor: COLORS.orange,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#ffffff",
    },
    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        marginBottom: 8,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.red,
    },
    loginBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        marginBottom: 8,
    },
    loginText: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.orange,
    },
    copyright: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: "center",
    },
});
