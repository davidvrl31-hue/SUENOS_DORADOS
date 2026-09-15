import { Stack } from "expo-router";
import React, { memo, useCallback } from "react";
import AppHeader from "../../../components/header/AppHeader";

const FavoritesLayout = memo(function FavoritesLayout() {
    const renderHeader = useCallback(() => <AppHeader showSearch={false} title="Favoritos" />, []);

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

export default FavoritesLayout;
