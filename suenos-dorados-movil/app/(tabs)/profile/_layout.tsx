import { Stack } from "expo-router";
import React, { memo, useCallback } from "react";
import AppHeader from "../../../components/header/AppHeader";

const ProfileLayout = memo(function ProfileLayout() {
    const renderProfileHeader = useCallback(() => <AppHeader showSearch={false} title="Mi perfil" />, []);

    return (
        <Stack
            screenOptions={{
                // Las sub-pantallas manejan su propio header internamente
                // para evitar el encabezado duplicado
                headerShown: false,
                contentStyle: { backgroundColor: "#fffdf9" },
            }}
        >
            {/* La pantalla principal de perfil sí usa AppHeader */}
            <Stack.Screen name="index" options={{ headerShown: true, header: renderProfileHeader }} />
            <Stack.Screen name="orders" />
            <Stack.Screen name="addresses" />
            <Stack.Screen name="payments" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="support" />
        </Stack>
    );
});

export default ProfileLayout;
