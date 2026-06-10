import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/theme";
import { useProducts } from "../../context/ProductsContext";

interface Props {
    active: string;
    onSelect: (cat: string) => void;
    /** true = usa IDs numéricos (Home), false = usa nombres directos (Explore) */
    useIds?: boolean;
}

export default function CategoryChips({ active, onSelect, useIds = false }: Props) {
    const { categorias } = useProducts();

    // Construir lista de chips desde la API
    const items = useIds
        ? [
            { key: "0", label: "Todo" },
            ...categorias.map((c) => ({ key: String(c.idCategoria), label: c.nombreCategoria })),
          ]
        : [
            { key: "Todo", label: "Todo" },
            ...categorias.map((c) => ({ key: c.nombreCategoria, label: c.nombreCategoria })),
          ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.scroll}
        >
            {items.map((item) => {
                const isActive = active === item.key;
                return (
                    <TouchableOpacity
                        key={item.key}
                        onPress={() => onSelect(item.key)}
                        style={[s.chip, isActive && s.chipActive]}
                        activeOpacity={0.75}
                    >
                        <Text style={[s.chipTxt, isActive && s.chipTxtActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    scroll: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        alignItems: "center",
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignSelf: "flex-start",
    },
    chipActive: {
        backgroundColor: COLORS.amber,
        borderColor: COLORS.amberBorder,
    },
    chipTxt: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.mutedDark,
        lineHeight: 18,
    },
    chipTxtActive: {
        color: COLORS.amberAccent,
        fontWeight: "700",
    },
});
