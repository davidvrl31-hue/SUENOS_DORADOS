import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { OrdersProvider } from "../context/OrdersContext";
import { ProductsProvider } from "../context/ProductsContext";
import { ToastProvider } from "../components/ui/Toast";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <FavoritesProvider>
            <OrdersProvider>
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </ToastProvider>
            </OrdersProvider>
          </FavoritesProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
