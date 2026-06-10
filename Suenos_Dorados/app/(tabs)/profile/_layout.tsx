import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { memo, useCallback } from "react";
import { TouchableOpacity } from "react-native";
import AppHeader from "../../../components/header/AppHeader";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import { COLORS, RADIUS } from "../../../constants/theme";

const ProfileLayout = memo(function ProfileLayout() {
    const renderProfileHeader = useCallback(() => <AppHeader showSearch={false} title="Mi perfil" />, []);

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: "#fffdf9" },
            }}
        >
            <Stack.Screen name="index" options={{ header: renderProfileHeader }} />
            <Stack.Screen
                name="orders"
                options={{
                    header: () => <ScreenHeader title="Mis pedidos" />,
                }}
            />
            <Stack.Screen
                name="addresses"
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Mis direcciones"
                            right={
                                <TouchableOpacity
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: RADIUS.md,
                                        backgroundColor: COLORS.amber,
                                        borderWidth: 1,
                                        borderColor: COLORS.amberBorder,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    accessibilityLabel="Agregar dirección"
                                    accessibilityRole="button"
                                >
                                    <Feather name="plus" size={20} color={COLORS.orange} />
                                </TouchableOpacity>
                            }
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="payments"
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Métodos de pago"
                            right={
                                <TouchableOpacity
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: RADIUS.md,
                                        backgroundColor: COLORS.amber,
                                        borderWidth: 1,
                                        borderColor: COLORS.amberBorder,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    accessibilityLabel="Agregar método de pago"
                                    accessibilityRole="button"
                                >
                                    <Feather name="plus" size={20} color={COLORS.orange} />
                                </TouchableOpacity>
                            }
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="notifications"
                options={{
                    header: () => <ScreenHeader title="Notificaciones" />,
                }}
            />
            <Stack.Screen
                name="support"
                options={{
                    header: () => <ScreenHeader title="Ayuda y soporte" />,
                }}
            />
        </Stack>
    );
});

export default ProfileLayout;
