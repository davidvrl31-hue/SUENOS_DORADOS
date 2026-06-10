import { Stack } from "expo-router";
import React, { memo, useCallback } from "react";
import AppHeader from "../../../components/header/AppHeader";

const HomeLayout = memo(function HomeLayout() {
    const renderHeader = useCallback(() => <AppHeader showSearch />, []);

    return (
        <Stack
            screenOptions={{
                header: renderHeader,
                contentStyle: { backgroundColor: "#fffdf9" },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="explore"options={{
                    headerShown: false,
                }} />
        </Stack>
    );
});

export default HomeLayout;
