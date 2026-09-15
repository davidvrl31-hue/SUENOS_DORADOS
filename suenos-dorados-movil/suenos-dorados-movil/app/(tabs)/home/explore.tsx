import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ProductCard from "../../../components/ui/ProductCard";
import { COLORS, RADIUS } from "../../../constants/theme";
import { useProducts } from "../../../context/ProductsContext";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const ExploreScreen = memo(function ExploreScreen() {
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);
    const { productos, categorias, isLoading } = useProducts();

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [category, setCategory] = useState("Todo");
    const [sortBy, setSortBy] = useState<SortOption>("default");
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 150);
        return () => clearTimeout(t);
    }, []);

    // Categorías dinámicas desde la API
    const categoryList = useMemo(
        () => ["Todo", ...categorias.map((c) => c.nombreCategoria)],
        [categorias]
    );

    const filtered = useMemo(() => {
        let result = productos.filter((p) => {
            const matchCat = category === "Todo" || p.category === category;
            const matchText = p.name.toLowerCase().includes(debouncedQuery.toLowerCase());
            const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
            return matchCat && matchText && matchPrice;
        });

        // Ordenamiento
        if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
        else if (sortBy === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));

        return result;
    }, [productos, category, debouncedQuery, sortBy, priceRange]);

    const handleBack = useCallback(() => router.back(), [router]);
    const clearQuery = useCallback(() => setQuery(""), []);
    const toggleFilters = useCallback(() => setShowFilters((p) => !p), []);
    const resetFilters = useCallback(() => {
        setSortBy("default");
        setPriceRange([0, 500000]);
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: typeof productos[0] }) => (
            <ProductCard product={item} variant="grid" />
        ),
        [],
    );

    const keyExtractor = useCallback(
        (item: typeof productos[0]) => item.id,
        [],
    );

    return (
        <View style={s.root}>
            {/* Header con buscador */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={handleBack}
                    activeOpacity={0.7}
                    accessibilityLabel="Volver"
                    accessibilityRole="button"
                >
                    <Feather name="arrow-left" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <View style={s.searchWrap}>
                    <Feather name="search" size={15} color="#9CA3AF" style={s.searchIcon} />
                    <TextInput
                        ref={inputRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Buscar edredones, cobijas..."
                        placeholderTextColor="#9CA3AF"
                        style={s.input}
                        autoCorrect={false}
                        autoCapitalize="none"
                        accessibilityLabel="Buscar productos"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={clearQuery} accessibilityRole="button">
                            <Feather name="x" size={16} color={COLORS.mutedDark} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={s.filterBtn}
                    onPress={toggleFilters}
                    activeOpacity={0.7}
                    accessibilityLabel="Filtros"
                    accessibilityRole="button"
                >
                    <Feather name="sliders" size={18} color={COLORS.orange} />
                </TouchableOpacity>
            </View>

            {/* Categorías */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.catScroll}
                style={s.catScrollView}
            >
                {categoryList.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[s.chip, category === cat && s.chipActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: category === cat }}
                    >
                        <Text style={[s.chipTxt, category === cat && s.chipTxtActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Contenido */}
            {isLoading ? (
                <View style={s.loading}>
                    <ActivityIndicator color={COLORS.orange} size="large" />
                    <Text style={s.loadingTxt}>Cargando productos...</Text>
                </View>
            ) : filtered.length === 0 ? (
                <View style={s.noResult}>
                    <Feather name="search" size={28} color={COLORS.mutedDark} />
                    <Text style={s.noResultTxt}>
                        {debouncedQuery
                            ? `Sin resultados para "${debouncedQuery}"`
                            : "No hay productos en esta categoría"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={keyExtractor}
                    numColumns={2}
                    columnWrapperStyle={s.row}
                    contentContainerStyle={s.grid}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            )}
        </View>
    );
});

export default ExploreScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.bg,
        zIndex: 10,
        elevation: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    searchWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderWidth: 0,
        borderColor: "transparent",
        borderRadius: RADIUS.md,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: COLORS.text },
    catScrollView: { flexGrow: 0, minHeight: 64, backgroundColor: COLORS.bg },
    catScroll: { paddingHorizontal: 20, paddingVertical: 14, gap: 8, alignItems: "center" },
    chip: {
        paddingHorizontal: 16,
        height: 36,
        justifyContent: "center",
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: { backgroundColor: COLORS.amber, borderColor: COLORS.amberBorder },
    chipTxt: { fontSize: 13, fontWeight: "600", color: COLORS.mutedDark },
    chipTxtActive: { color: COLORS.amberAccent, fontWeight: "700" },
    grid: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, gap: 12 },
    row: { gap: 12 },
    loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingTxt: { fontSize: 14, color: COLORS.muted },
    noResult: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
    noResultTxt: { fontSize: 14, color: COLORS.mutedDark },
});
