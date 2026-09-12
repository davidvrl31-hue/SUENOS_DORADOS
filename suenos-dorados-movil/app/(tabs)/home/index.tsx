import React, { memo, useState } from "react";
import { ScrollView, View } from "react-native";
import Categorias from "../../../components/index/Categorias";
import Featured from "../../../components/index/Featured";
import Hero from "../../../components/index/Hero";
import PromoBanner from "../../../components/index/PromoBanner";
import Recent from "../../../components/index/Recent";
import Stats from "../../../components/index/Stats";
import { COLORS } from "../../../constants/theme";
import { useProducts } from "../../../context/ProductsContext";

const HomeScreen = memo(function HomeScreen() {
    const { categorias } = useProducts();
    const [activeCat, setActiveCat] = useState("0"); // "0" = Todo

    // Nombre de la categoría activa para filtrar componentes
    const categoryName =
        activeCat === "0"
            ? "Todo"
            : categorias.find((c) => String(c.idCategoria) === activeCat)?.nombreCategoria ?? "Todo";

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Hero />
                <Stats />
                <Categorias active={activeCat} onSelect={setActiveCat} />
                <Featured categoryFilter={categoryName} />
                <PromoBanner />
                <Recent categoryFilter={categoryName} />
            </ScrollView>
        </View>
    );
});

export default HomeScreen;
