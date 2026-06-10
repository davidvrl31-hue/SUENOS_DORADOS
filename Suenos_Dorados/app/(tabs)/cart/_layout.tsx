import { Stack } from "expo-router";
import React, { memo, useCallback } from "react";
import AppHeader from "../../../components/header/AppHeader";

const CartLayout = memo(function CartLayout() {
    const renderHeader = useCallback(() => <AppHeader showSearch={false} title="Mi carrito" />, []);

    return (
        <Stack
            screenOptions={{
                header: renderHeader,
                contentStyle: { backgroundColor: "#fffdf9" },
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
});

export default CartLayout;
