import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

export interface MenuItem {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    route?: string;
    danger?: boolean;
}

interface ProfileMenuProps {
    items: MenuItem[];
    onItemPress: (item: MenuItem) => void;
    showLogout: boolean;
}

// Componente hijo con su propio handler — sin hooks condicionales
const ProfileMenuItem = memo(function ProfileMenuItem({
    item,
    onItemPress,
    showBorder,
}: {
    item: MenuItem;
    onItemPress: (item: MenuItem) => void;
    showBorder: boolean;
}) {
    const handlePress = useCallback(() => onItemPress(item), [item, onItemPress]);

    return (
        <TouchableOpacity
            style={[s.menuItem, showBorder && s.menuBorder]}
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityRole="menuitem"
        >
            <View style={[s.menuIcon, item.danger && s.menuIconDanger]}>
                <Feather
                    name={item.icon}
                    size={17}
                    color={item.danger ? COLORS.red : COLORS.orange}
                />
            </View>
            <Text style={[s.menuLabel, item.danger && s.menuLabelDanger]}>
                {item.label}
            </Text>
            <Feather name="chevron-right" size={15} color={COLORS.mutedDark} />
        </TouchableOpacity>
    );
});

const ProfileMenu = memo(function ProfileMenu({ items, onItemPress, showLogout }: ProfileMenuProps) {
    const visibleItems = items.filter((item) => !item.danger || showLogout);

    return (
        <View style={s.menuCard}>
            {visibleItems.map((item, i) => (
                <ProfileMenuItem
                    key={item.label}
                    item={item}
                    onItemPress={onItemPress}
                    showBorder={i < visibleItems.length - 1}
                />
            ))}
        </View>
    );
});

export default ProfileMenu;

const s = StyleSheet.create({
    menuCard: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
    },
    menuIconDanger: { backgroundColor: "#fff0f0" },
    menuLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.text },
    menuLabelDanger: { color: COLORS.red },
});
