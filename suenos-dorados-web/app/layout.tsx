import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

export const metadata: Metadata = {
  title: "Sueños Dorados - Sofá · Cama · Baño",
  description: "Tu tienda de ropa de cama y descanso premium. Cortinas, cobijas, edredones, toallas y más.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-gray-50">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
