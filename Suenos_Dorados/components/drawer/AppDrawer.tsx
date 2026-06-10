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
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W = SCREEN_W * 0.78;

const NAV_ITEMS: {
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    route: string;
    badge?: boolean;
}[] = [
    { label: "Inicio", icon: "home", route: "/(tabs)/home" },
    { label: "Carrito", icon: "shopping-cart", route: "/(tabs)/cart", badge: true },
    { label: "Favoritos", icon: "heart", route: "/(tabs)/favorites" },
    { label: "Mis pedidos", icon: "package", route: "/(tabs)/profile/orders" },
    { label: "Mi perfil", icon: "user", route: "/(tabs)/profile" },
];

const HELP_ITEMS: {
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    route: string;
}[] = [
    { label: "Notificaciones", icon: "bell", route: "/(tabs)/profile/notifications" },
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
    const { user, isAuthenticated, logout } = useAuth();
    const translateX = useRef(new Animated.Value(-DRAWER_W)).current;

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

                    {/* Branding */}
                    <View style={s.drawerHeader}>
                        <View style={s.logoWrap}>
                            <Image
                                source={require("../../assets/images/logo.jpeg")}
                                style={s.logoCircle}
                                resizeMode="cover"
                            />
                            <View>
                                <Text style={s.logoName}>Sueños Dorados</Text>
                                <Text style={s.logoSub}>Sofá · Cama · Baño</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={s.closeBtn}
                            accessibilityLabel="Cerrar menú"
                            accessibilityRole="button"
                        >
                            <Feather name="x" size={16} color={COLORS.mutedDark} />
                        </TouchableOpacity>
                    </View>

                    {/* Usuario */}
                    {isAuthenticated && user ? (
                        <TouchableOpacity
                            style={s.userCard}
                            onPress={goToProfile}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Ver perfil"
                        >
                            <View style={s.userAvatar}>
                                <Text style={s.userInitial}>{user.name[0].toUpperCase()}</Text>
                            </View>
                            <View style={s.flex}>
                                <Text style={s.userName} numberOfLines={1}>{user.name}</Text>
                                <Text style={s.userEmail} numberOfLines={1}>{user.email}</Text>
                            </View>
                            <Feather name="chevron-right" size={14} color={COLORS.mutedDark} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={s.loginCard}
                            onPress={goToLogin}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Iniciar sesión"
                        >
                            <Feather name="log-in" size={15} color={COLORS.orange} />
                            <Text style={s.loginCardTxt}>Iniciá sesión para continuar</Text>
                            <Feather name="chevron-right" size={14} color={COLORS.orange} />
                        </TouchableOpacity>
                    )}

                    {/* Promo */}
                    <View style={s.promoChip}>
                        <Feather name="truck" size={13} color="#a06010" style={s.promoIcon} />
                        <Text style={s.promoTxt}>Envío gratis en compras +$100.000 COP</Text>
                    </View>

                    {/* Nav principal */}
                    <Text style={s.groupLabel}>MENÚ</Text>
                    <View style={s.navList}>
                        {NAV_ITEMS.map((item) => {
                            const active = pathname === item.route;
                            const showBadge = item.badge && count > 0;
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[s.navItem, active && s.navItemActive]}
                                    onPress={() => navigate(item.route)}
                                    activeOpacity={0.7}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected: active }}
                                >
                                    <View style={[s.navIconBox, active && s.navIconBoxActive]}>
                                        <Feather name={item.icon} size={17} color={active ? COLORS.orange : COLORS.mutedDark} />
                                        {showBadge && (
                                            <View style={s.navBadge}>
                                                <Text style={s.navBadgeTxt}>{count > 9 ? "9+" : count}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
                                    {showBadge && !active && (
                                        <View style={s.countChip}>
                                            <Text style={s.countChipTxt}>{count}</Text>
                                        </View>
                                    )}
                                    {active && <Feather name="chevron-right" size={14} color={COLORS.orange} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={s.divider} />
                    <Text style={s.groupLabel}>AYUDA</Text>
                    <View style={s.navList}>
                        {HELP_ITEMS.map((item) => {
                            const active = pathname === item.route;
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[s.navItem, active && s.navItemActive]}
                                    onPress={() => navigate(item.route)}
                                    activeOpacity={0.7}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected: active }}
                                >
                                    <View style={[s.navIconBox, active && s.navIconBoxActive]}>
                                        <Feather name={item.icon} size={17} color={active ? COLORS.orange : COLORS.mutedDark} />
                                    </View>
                                    <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
                                    {active && <Feather name="chevron-right" size={14} color={COLORS.orange} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Cerrar sesión solo si logueado */}
                    {isAuthenticated && (
                        <>
                            <View style={s.divider} />
                            <View style={s.navList}>
                                <TouchableOpacity
                                    style={s.navItem}
                                    onPress={handleLogout}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cerrar sesión"
                                >
                                    <View style={s.navIconBoxDanger}>
                                        <Feather name="log-out" size={17} color={COLORS.red} />
                                    </View>
                                    <Text style={s.navLabelDanger}>Cerrar sesión</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Footer */}
                    <View style={s.footer}>
                        <Text style={s.footerTxt}>Sueños Dorados © 2025</Text>
                        <Text style={s.footerSub}>Hecho con amor en Colombia 🇨🇴</Text>
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
        backgroundColor: "rgba(45,37,32,0.45)",
    },
    drawer: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_W,
        backgroundColor: COLORS.bg,
        shadowColor: "#000",
        shadowOffset: { width: 8, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 24,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
    },
    drawerHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 16,
    },
    logoWrap: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    logoCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 2,
        borderColor: COLORS.amberBorder,
        overflow: "hidden",
    },
    logoName: { fontSize: 16, fontWeight: "800", color: COLORS.text },
    logoSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        backgroundColor: COLORS.amber,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    userAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.orange,
        alignItems: "center",
        justifyContent: "center",
    },
    userInitial: { fontSize: 16, fontWeight: "800", color: "#fff" },
    userName: { fontSize: 14, fontWeight: "700", color: COLORS.text },
    userEmail: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
    loginCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 12,
        marginBottom: 12,
        backgroundColor: COLORS.amber,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    loginCardTxt: { flex: 1, fontSize: 13, fontWeight: "600", color: COLORS.amberAccent },
    promoChip: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 18,
        backgroundColor: "#fef3e2",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: COLORS.amberBorder,
    },
    promoIcon: { marginRight: 6 },
    promoTxt: { fontSize: 12, color: "#8a6010", fontWeight: "600", flex: 1 },
    groupLabel: {
        paddingHorizontal: 20,
        marginBottom: 4,
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.muted,
        letterSpacing: 1.5,
    },
    navList: { paddingHorizontal: 12, gap: 1 },
    navItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        gap: 12,
    },
    navItemActive: { backgroundColor: COLORS.amber },
    navIconBox: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    navIconBoxActive: { backgroundColor: "#ffe8b8", borderColor: COLORS.amberBorder },
    navIconBoxDanger: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: "#fff0f0",
        borderWidth: 1,
        borderColor: "#fecaca",
        alignItems: "center",
        justifyContent: "center",
    },
    navLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text, flex: 1 },
    navLabelActive: { color: COLORS.amberAccent, fontWeight: "700" },
    navLabelDanger: { fontSize: 14, fontWeight: "600", color: COLORS.red, flex: 1 },
    navBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.orange,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 2,
    },
    navBadgeTxt: { fontSize: 9, fontWeight: "800", color: "#fff" },
    countChip: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countChipTxt: { fontSize: 11, fontWeight: "800", color: "#fff" },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 20,
        marginVertical: 12,
    },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: "center",
        gap: 3,
    },
    footerTxt: { fontSize: 12, color: COLORS.muted },
    footerSub: { fontSize: 11, color: COLORS.orange },
});
