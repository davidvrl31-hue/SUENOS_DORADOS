import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/Toast";
import { COLORS, RADIUS } from "../../../constants/theme";
import { useCart } from "../../../context/CartContext";
import { FavoriteItem, useFavorites } from "../../../context/FavoritesContext";
import { fmt } from "../../../utils/format";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

const FavoriteItemCard = memo(function FavoriteItemCard({
    item,
    onAddToCart,
    onRemove,
    onPress,
}: {
    item: FavoriteItem;
    onAddToCart: (item: FavoriteItem) => void;
    onRemove: (item: FavoriteItem) => void;
    onPress: (item: FavoriteItem) => void;
}) {
    const handleAdd = useCallback(() => onAddToCart(item), [item, onAddToCart]);
    const handleRemove = useCallback(() => onRemove(item), [item, onRemove]);
    const handlePress = useCallback(() => onPress(item), [item, onPress]);

    const imageUri = item.image && item.image.trim() !== "" ? item.image : PLACEHOLDER_IMAGE;

    return (
        <TouchableOpacity style={s.card} onPress={handlePress} activeOpacity={0.85}>
            <Image source={{ uri: imageUri }} style={s.thumb} resizeMode="cover" />
            <View style={s.flex}>
                <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                <View style={s.priceRow}>
                    <Text style={s.price}>{fmt(item.price)}</Text>
                    {item.originalPrice && (
                        <Text style={s.priceOrig}>{fmt(item.originalPrice)}</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={s.addBtn}
                    onPress={handleAdd}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar ${item.name} al carrito`}
                >
                    <Feather name="shopping-cart" size={13} color="#fff" />
                    <Text style={s.addBtnTxt}>Agregar al carrito</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={s.removeBtn}
                onPress={handleRemove}
                accessibilityRole="button"
                accessibilityLabel="Quitar de favoritos"
            >
                <Feather name="heart" size={18} color={COLORS.orange} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
});

const FavoritesScreen = memo(function FavoritesScreen() {
    const router = useRouter();
    const { favorites, toggleFavorite } = useFavorites();
    const { addItem } = useCart();
    const { showToast } = useToast();

    const handleAddToCart = useCallback(
        (item: FavoriteItem) => {
            addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
            showToast(`${item.name} agregado al carrito 🛒`);
        },
        [addItem, showToast],
    );

    const handleRemove = useCallback(
        (item: FavoriteItem) => {
            toggleFavorite(item);
            showToast("Eliminado de favoritos", "info");
        },
        [toggleFavorite, showToast],
    );

    // Navegar al detalle del producto
    const handlePress = useCallback(
        (item: FavoriteItem) => {
            const idProducto = item.id.split("-")[0];
            router.push({
                pathname: "/product/[id]",
                params: { id: idProducto },
            });
        },
        [router],
    );

    const goToExplore = useCallback(() => router.push("/(tabs)/home/explore"), [router]);

    if (favorites.length === 0) {
        return (
            <View style={s.root}>
                <EmptyState
                    icon="heart"
                    title="Sin favoritos aún"
                    subtitle="Tocá el corazón en cualquier producto para guardarlo acá"
                    actionLabel="Ver productos"
                    onAction={goToExplore}
                />
            </View>
        );
    }

    return (
        <View style={s.root}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.count}>
                    {favorites.length} producto{favorites.length !== 1 ? "s" : ""} guardado
                    {favorites.length !== 1 ? "s" : ""}
                </Text>

                {favorites.map((item) => (
                    <FavoriteItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={handleAddToCart}
                        onRemove={handleRemove}
                        onPress={handlePress}
                    />
                ))}
            </ScrollView>
        </View>
    );
});

export default FavoritesScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, gap: 12, paddingBottom: 100 },
    count: { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
    flex: { flex: 1 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    thumb: { width: 70, height: 70, borderRadius: RADIUS.md, backgroundColor: COLORS.amber },
    name: { fontSize: 14, fontWeight: "700", color: COLORS.text, lineHeight: 19 },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    price: { fontSize: 14, fontWeight: "800", color: COLORS.orange },
    priceOrig: { fontSize: 12, color: COLORS.muted, textDecorationLine: "line-through" },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 8,
        backgroundColor: COLORS.orange,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    addBtnTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
    removeBtn: { padding: 8 },
});
