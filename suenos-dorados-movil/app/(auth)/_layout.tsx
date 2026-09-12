import { Stack } from "expo-router";
import React, { memo } from "react";

const AuthLayout = memo(function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#fffdf9" },
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    );
});

export default AuthLayout;
