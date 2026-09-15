import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { useProducts } from "../../context/ProductsContext";
import ProductCard from "../ui/ProductCard";

interface Props {
    categoryFilter?: string;
}

const Featured = memo(function Featured({ categoryFilter = "Todo" }: Props) {
    const router = useRouter();
    const { productos, isLoading } = useProducts();

    const products = useMemo(
        () =>
            productos.filter((p) => {
                const matchCat = categoryFilter === "Todo" || p.category === categoryFilter;
                return matchCat && p.price > 0;
            }).slice(0, 6),
        [productos, categoryFilter],
    );

    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    if (isLoading) {
        return (
            <View style={s.loading}>
                <ActivityIndicator color={COLORS.orange} />
            </View>
        );
    }

    if (products.length === 0) return null;

    return (
        <View style={s.container}>
            <View style={s.secRow}>
                <Text style={s.secTitle}>
                    {categoryFilter === "Todo" ? "Más vendidos" : categoryFilter}
                </Text>
                <TouchableOpacity
                    style={s.secLink}
                    onPress={goToExplore}
                    accessibilityRole="link"
                    accessibilityLabel="Ver todos los productos"
                >
                    <Text style={s.secLinkTxt}>Ver todo</Text>
                    <Feather name="chevron-right" size={14} color={COLORS.orange} />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.scrollContent}
            >
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} variant="featured" />
                ))}
            </ScrollView>
        </View>
    );
});

export default Featured;

const s = StyleSheet.create({
    container: { marginBottom: 32 },
    secRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    secTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text },
    secLink: { flexDirection: "row", alignItems: "center", gap: 2 },
    secLinkTxt: { fontSize: 13, color: COLORS.orange, fontWeight: "600" },
    scrollContent: { paddingHorizontal: 20, gap: 14 },
    loading: {
        height: 120,
        alignItems: "center",
        justifyContent: "center",
    },
});
