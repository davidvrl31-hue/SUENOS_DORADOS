import HomeClient from "@/components/HomeClient";
import { SueñosDoradosAPI } from "@/src/services/api.service";
import { Product } from "@/app/context/AppContext";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

// Server Component: obtiene datos reales de la API
export default async function HomePage() {
  const [apiCategorias, apiProductos, apiVariantes] = await Promise.all([
    SueñosDoradosAPI.getCategorias(),
    SueñosDoradosAPI.getProductos(),
    SueñosDoradosAPI.getVariantes(),
  ]);

  // Mapear productos con precio real desde variantes
  const products: Product[] = apiProductos
    .filter((p) => p.estadoProducto)
    .map((p) => {
      const cat      = apiCategorias.find((c) => c.idCategoria === p.idCategoria);
      const varsProd = apiVariantes.filter((v) => v.idProducto === p.idProducto && v.estado);
      // Variante con stock > 0 o la primera disponible
      const variante   = varsProd.find((v) => v.stock > 0) ?? varsProd[0];
      const stockTotal = varsProd.reduce((s, v) => s + v.stock, 0);

      return {
        id:          p.idProducto,
        idVariante:  variante?.idVariante,
        name:        p.nombreProducto,
        price:       variante ? Number(variante.precio) : 0,
        image:       p.imagenUrl || PLACEHOLDER_IMAGE,
        category:    cat?.nombreCategoria ?? "Sin categoría",
        slug:        p.slug,
        descripcion: p.descripcionProducto ?? undefined,
        stock:       stockTotal,
        badge:       stockTotal === 0 ? "Agotado" : undefined,
      };
    });

  const categoryNames = ["Todo", ...apiCategorias.map((c) => c.nombreCategoria)];

  // Estado vacío manejado en el componente cliente
  return <HomeClient products={products} categories={categoryNames} />;
}

