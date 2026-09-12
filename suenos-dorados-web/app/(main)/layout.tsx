import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Sueños Dorados</h3>
              <p className="text-sm text-gray-500">
                Tu tienda de confianza para ropa de cama y descanso premium. Calidad y comodidad en cada producto.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Navegación</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-primary transition-colors">Inicio</a></li>
                <li><a href="/busqueda" className="hover:text-primary transition-colors">Catálogo</a></li>
                <li><a href="/mis-pedidos" className="hover:text-primary transition-colors">Mis pedidos</a></li>
                <li><a href="/ayuda" className="hover:text-primary transition-colors">Ayuda y soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>📧 soporte@suenosdorados.co</li>
                <li>📞 +57 300 000 0000</li>
                <li>🕐 Lun - Vie: 8am - 6pm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-6 pt-4 text-center text-xs text-gray-400">
            © 2026 Sueños Dorados. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
