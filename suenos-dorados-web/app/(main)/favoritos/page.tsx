"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useApp } from "@/app/context/AppContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function FavoritosPage() {
  const { favorites, toggleFavorite, addToCart } = useApp();

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <Heart size={36} className="text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sin favoritos aún</h2>
        <p className="text-gray-500 text-sm mb-6">
          Toca el corazón en cualquier producto para guardarlo aquí
        </p>
        <Link href="/busqueda" className="btn-primary max-w-xs">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Favoritos</h1>
        <span className="text-sm text-gray-500">{favorites.length} {favorites.length === 1 ? "producto guardado" : "productos guardados"}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((item) => (
          <div key={item.id} className="card overflow-hidden flex gap-4 p-4 group">
            {/* Imagen clickeable → navega al detalle */}
            <Link href={`/producto/${item.id}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 block hover:opacity-90 transition-opacity">
              <img
                src={item.image && item.image.trim() !== "" ? item.image : PLACEHOLDER_IMAGE}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">{item.category}</p>
              {/* Nombre clickeable → navega al detalle */}
              <Link href={`/producto/${item.id}`}>
                <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 hover:text-primary transition-colors">{item.name}</h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold text-sm">
                  ${item.price.toLocaleString("es-CO")}
                </span>
                {item.originalPrice && (
                  <span className="text-gray-400 text-xs line-through">
                    ${item.originalPrice.toLocaleString("es-CO")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => addToCart(item)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingCart size={13} />
                  Agregar
                </button>
                <button
                  onClick={() => toggleFavorite(item)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Quitar de favoritos"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


