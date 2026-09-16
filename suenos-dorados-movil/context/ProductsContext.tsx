import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SueñosDoradosAPI, Categoria, Producto, VarianteProducto, Color, Medida } from "../services/api.service";

// ─── Types ────────────────────────────────────────────────────────────────────

const PLACEHOLDER = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export interface ProductoUI {
  id: string;
  name: string;
  desc: string;
  category: string;
  idCategoria: number;
  price: number;         // precio mínimo de variantes
  originalPrice?: number;
  badge?: string;
  image: string;
  slug: string;
  accent?: string;
  cardBg?: string;
}

interface ProductsContextType {
  productos: ProductoUI[];
  categorias: Categoria[];
  variantes: VarianteProducto[];
  colores: Color[];
  medidas: Medida[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getVariantesByProducto: (idProducto: number) => VarianteProducto[];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProductsContext = createContext<ProductsContextType | null>(null);

// Colores decorativos por categoría
const CAT_COLORS: Record<string, { accent: string; cardBg: string }> = {
  Edredones:  { accent: "#f5a742", cardBg: "#fef3e2" },
  Sábanas:    { accent: "#5b9bd5", cardBg: "#f0f7ff" },
  Cobijas:    { accent: "#9b72cf", cardBg: "#f5f0ff" },
  Cortinas:   { accent: "#4caf82", cardBg: "#f0faf5" },
  Toallas:    { accent: "#e05c5c", cardBg: "#fff0f0" },
};

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState<ProductoUI[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [variantes, setVariantes] = useState<VarianteProducto[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cats, prods, vars, cols, meds] = await Promise.all([
        SueñosDoradosAPI.getCategorias(),
        SueñosDoradosAPI.getProductos(),
        SueñosDoradosAPI.getVariantes(),
        SueñosDoradosAPI.getColores(),
        SueñosDoradosAPI.getMedidas(),
      ]);

      setCategorias(cats);
      setVariantes(vars);
      setColores(cols);
      setMedidas(meds);

      // Mapear productos con precio mínimo de sus variantes
      const mapped: ProductoUI[] = prods
        .filter((p) => p.estadoProducto)
        .map((p) => {
          const cat = cats.find((c) => c.idCategoria === p.idCategoria);
          const catNombre = cat?.nombreCategoria ?? "Sin categoría";
          const varsProd = vars.filter((v) => v.idProducto === p.idProducto && v.estado);
          const precios = varsProd.map((v) => Number(v.precio));
          const precioMin = precios.length > 0 ? Math.min(...precios) : 0;
          const precioMax = precios.length > 0 ? Math.max(...precios) : 0;
          const deco = CAT_COLORS[catNombre] ?? { accent: "#f5a742", cardBg: "#fef3e2" };

          return {
            id: String(p.idProducto),
            name: p.nombreProducto,
            desc: p.descripcionProducto ?? catNombre,
            category: catNombre,
            idCategoria: p.idCategoria,
            price: precioMin,
            originalPrice: precioMax > precioMin ? precioMax : undefined,
            image: p.imagenUrl || PLACEHOLDER,
            slug: p.slug,
            accent: deco.accent,
            cardBg: deco.cardBg,
          };
        });

      setProductos(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, []); // eslint-disable-line

  const getVariantesByProducto = useCallback(
    (idProducto: number) => variantes.filter((v) => v.idProducto === idProducto),
    [variantes]
  );

  return (
    <ProductsContext.Provider value={{
      productos, categorias, variantes, colores, medidas,
      isLoading, error, reload, getVariantesByProducto,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
