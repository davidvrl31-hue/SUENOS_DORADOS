import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";
import { useCart } from "../../context/CartContext";

// ─── Ícono de tab con label ───────────────────────────────────────────────────
const TabIcon = memo(function TabIcon({
  icon,
  label,
  focused,
  badge,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={[s.wrap, focused && s.wrapActive]}>
      <View>
        <Feather name={icon} size={20} color={focused ? COLORS.orange : COLORS.muted} />
        {badge != null && badge > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[s.label, focused && s.labelActive]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </View>
  );
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home" label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="shopping-cart" label="Carrito" focused={focused} badge={count} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="heart" label="Favoritos" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="user" label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    minWidth: 64,
  },
  wrapActive: { backgroundColor: COLORS.amber },
  label: { fontSize: 10, fontWeight: "500", color: COLORS.muted },
  labelActive: { color: COLORS.orange, fontWeight: "700" },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeTxt: { fontSize: 9, fontWeight: "800", color: "#fff" },
});
