import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { useProducts } from "../../context/ProductsContext";
import ProductCard from "../ui/ProductCard";

interface Props {
    categoryFilter?: string;
}

const Recent = memo(function Recent({ categoryFilter = "Todo" }: Props) {
    const router = useRouter();
    const { productos } = useProducts();

    const products = useMemo(
        () =>
            productos
                .filter((p) =>
                    categoryFilter === "Todo" || p.category === categoryFilter
                )
                .slice(-4),
        [productos, categoryFilter],
    );

    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    if (products.length === 0) return null;

    return (
        <View style={s.container}>
            <View style={s.secRow}>
                <Text style={s.secTitle}>Recién agregados</Text>
                <TouchableOpacity
                    style={s.secLink}
                    onPress={goToExplore}
                    accessibilityRole="link"
                >
                    <Text style={s.secLinkTxt}>Ver todo</Text>
                    <Feather name="chevron-right" size={14} color={COLORS.orange} />
                </TouchableOpacity>
            </View>
            <View style={s.list}>
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} variant="list" />
                ))}
            </View>
        </View>
    );
});

export default Recent;

const s = StyleSheet.create({
    container: { paddingHorizontal: 20 },
    secRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    secTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text },
    secLink: { flexDirection: "row", alignItems: "center", gap: 2 },
    secLinkTxt: { fontSize: 13, color: COLORS.orange, fontWeight: "600" },
    list: { gap: 10 },
});
