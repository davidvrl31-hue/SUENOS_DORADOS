"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, PackageX } from "lucide-react";
import { useApp, Product } from "@/app/context/AppContext";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { toggleFavorite, favorites, stockMap } = useApp();
  const router = useRouter();
  const isFav = favorites.some((f) => f.id === product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  // Stock en tiempo real desde WebSocket — fallback al stock del catálogo
  const stockActual = stockMap[product.idVariante ?? 0] ?? product.stock ?? 1;
  const agotado = stockActual === 0;

  const handleComprar = () => {
    if (agotado) return;
    router.push(`/producto/${product.id}`);
  };

  return (
    <div className="card overflow-hidden group hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <Link href={`/producto/${product.id}`}>
          <div className={`relative ${compact ? "h-36" : "h-48"} bg-gray-100 cursor-pointer`}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${agotado ? "opacity-50 grayscale" : ""}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {agotado ? (
            <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <PackageX size={10} /> Agotado
            </span>
          ) : product.badge ? (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {product.badge}
            </span>
          ) : null}
          {discount && !agotado && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorito */}
        <button
          onClick={() => toggleFavorite(product)}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
          aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            size={16}
            className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.category}</p>
        <Link href={`/producto/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mb-2 hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className={`font-bold text-sm ${agotado ? "text-gray-400" : "text-primary"}`}>
            ${product.price.toLocaleString("es-CO")}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              ${product.originalPrice.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        {agotado ? (
          <button
            disabled
            className="w-full bg-gray-200 text-gray-400 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <PackageX size={14} />
            Sin stock
          </button>
        ) : (
          <button
            onClick={handleComprar}
            className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart size={14} />
            Ver y comprar
          </button>
        )}
      </div>
    </div>
  );
}
