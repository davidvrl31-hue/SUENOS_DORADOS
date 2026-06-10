"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { SueñosDoradosAPI, Producto, Categoria } from "@/src/services/api.service";
import { Product } from "@/app/context/AppContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

function mapToProduct(p: Producto, nombreCategoria: string): Product {
  return {
    id: p.idProducto,
    name: p.nombreProducto,
    price: 0,
    image: PLACEHOLDER_IMAGE,
    category: nombreCategoria,
    slug: p.slug,
    descripcion: p.descripcionProducto ?? undefined,
  };
}

function BusquedaContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [sortBy, setSortBy] = useState("relevancia");

  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          SueñosDoradosAPI.getCategorias(),
          SueñosDoradosAPI.getProductos(),
        ]);
        setCategorias(cats);
        const mapeados = prods
          .filter((p) => p.estadoProducto)
          .map((p) => {
            const cat = cats.find((c) => c.idCategoria === p.idCategoria);
            return mapToProduct(p, cat?.nombreCategoria ?? "Sin categoría");
          });
        setProductos(mapeados);
      } catch {
        // fallback silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const categoryNames = ["Todo", ...categorias.map((c) => c.nombreCategoria)];

  const filtered = productos
    .filter((p) => {
      const matchCat = activeCategory === "Todo" || p.category === activeCategory;
      const matchQ = query === "" || p.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    })
    .sort((a, b) => {
      if (sortBy === "precio-asc") return a.price - b.price;
      if (sortBy === "precio-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>

      {/* Barra de búsqueda */}
      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 gap-3 shadow-sm">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar cortinas, cobijas, edredones..."
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={16} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
          {categoryNames.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
              }`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal size={16} className="text-gray-400" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary bg-white">
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 size={24} className="text-primary animate-spin" />
          <span className="text-gray-500 text-sm">Cargando productos...</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? "producto encontrado" : "productos encontrados"}
            {query && <span> para &quot;<strong>{query}</strong>&quot;</span>}
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No encontramos productos</p>
              <p className="text-sm text-gray-400 mt-1">Intenta con otro término o categoría</p>
              <button onClick={() => { setQuery(""); setActiveCategory("Todo"); }}
                className="mt-4 text-primary text-sm font-medium hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BusquedaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16 gap-3">
        <Loader2 size={24} className="text-primary animate-spin" />
        <span className="text-gray-500 text-sm">Cargando...</span>
      </div>
    }>
      <BusquedaContent />
    </Suspense>
  );
}
