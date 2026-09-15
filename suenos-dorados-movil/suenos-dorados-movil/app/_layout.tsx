import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ToastProvider } from "../components/ui/Toast";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { OrdersProvider } from "../context/OrdersContext";
import { ProductsProvider } from "../context/ProductsContext";
import "./global.css";

// Mantener splash hasta que las fuentes carguen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Alias genérico "Inter" para que los estilos que usen fontFamily: "Inter" funcionen
    Inter: Inter_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // No renderizar nada hasta que las fuentes estén listas
  if (!fontsLoaded) return null;

  return (
    <AppProvider>
      <AuthProvider>
        <ProductsProvider>
          <OrdersProvider>
            <CartProvider>
              <FavoritesProvider>
                <ToastProvider>
                  <Stack screenOptions={{ headerShown: false }} />
                </ToastProvider>
              </FavoritesProvider>
            </CartProvider>
          </OrdersProvider>
        </ProductsProvider>
      </AuthProvider>
    </AppProvider>
  );
}
