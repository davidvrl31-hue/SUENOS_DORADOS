import HomeClient from "@/components/HomeClient";
import { SueñosDoradosAPI } from "@/src/services/api.service";
import { PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES } from "@/app/data/products";
import { Product } from "@/app/context/AppContext";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

// Server Component: obtiene datos reales de la API y los pasa al cliente
export default async function HomePage() {
  const [apiCategorias, apiProductos] = await Promise.all([
    SueñosDoradosAPI.getCategorias(),
    SueñosDoradosAPI.getProductos(),
  ]);

  // Si la API tiene datos, usarlos; si no, fallback a mock
  const products: Product[] =
    apiProductos.length > 0
      ? apiProductos
          .filter((p) => p.estadoProducto)
          .map((p) => {
            const cat = apiCategorias.find((c) => c.idCategoria === p.idCategoria);
            return {
              id: p.idProducto,
              name: p.nombreProducto,
              price: 0, // El precio real viene de las variantes en la página de detalle
              image: PLACEHOLDER_IMAGE,
              category: cat?.nombreCategoria ?? "Sin categoría",
              slug: p.slug,
              descripcion: p.descripcionProducto ?? undefined,
            };
          })
      : MOCK_PRODUCTS;

  const categoryNames =
    apiCategorias.length > 0
      ? ["Todo", ...apiCategorias.map((c) => c.nombreCategoria)]
      : MOCK_CATEGORIES;

  return <HomeClient products={products} categories={categoryNames} />;
}
