"use client";
import Link from "next/link";
import { Truck, Tag, Star, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/app/context/AppContext";
import { useState } from "react";

interface HomeClientProps {
  products: Product[];
  categories: string[];
}

export default function HomeClient({ products, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("Todo");

  const filtered =
    activeCategory === "Todo"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const bestSellers = products.filter((p) => p.badge === "Más vendido" || p.badge === "Popular");

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary to-amber-400 rounded-3xl overflow-hidden">
        <div className="px-8 py-10 text-white">
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full inline-block">
            Nueva colección
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
            El descanso<br />que mereces
          </h1>
          <p className="text-white/90 mt-2 text-sm">Hasta 30% off en toda la colección</p>
          <Link
            href="/busqueda"
            className="inline-flex items-center gap-2 mt-5 bg-white text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-light transition-colors text-sm"
          >
            Ver colección <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Beneficios */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { icon: Truck, label: "Envío gratis", sub: "+$100.000 COP" },
          { icon: Tag, label: "Descuento", sub: "Hasta 30% off" },
          { icon: Star, label: "Valoración", sub: "4.8 / 5 estrellas" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="card p-4 flex flex-col items-center text-center gap-1">
            <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
              <Icon size={18} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-gray-700">{label}</p>
            <p className="text-[10px] text-gray-400">{sub}</p>
          </div>
        ))}
      </section>

      {/* Filtro de categorías */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Más vendidos */}
      {activeCategory === "Todo" && bestSellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Más vendidos</h2>
            <Link href="/busqueda" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              Ver todo <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Todos los productos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {activeCategory === "Todo" ? "Todos los productos" : activeCategory}
          </h2>
          <span className="text-sm text-gray-400">
            {filtered.length === 0
              ? "Sin productos"
              : `${filtered.length} productos`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No hay productos en esta categoría aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
