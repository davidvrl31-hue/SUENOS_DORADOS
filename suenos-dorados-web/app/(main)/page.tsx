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
      const cat = apiCategorias.find((c) => c.idCategoria === p.idCategoria);
      const variante = apiVariantes.find((v) => v.idProducto === p.idProducto && v.estado);
      
      return {
        id: p.idProducto,
        name: p.nombreProducto,
        price: variante ? Number(variante.precio) : 0,
        originalPrice: undefined, // TODO: Implementar campo de precio anterior si se requiere
        image: p.imagenUrl || PLACEHOLDER_IMAGE,
        category: cat?.nombreCategoria ?? "Sin categoría",
        slug: p.slug,
        descripcion: p.descripcionProducto ?? undefined,
        badge: variante && variante.stock === 0 ? "Agotado" : undefined,
      };
    });

  const categoryNames = ["Todo", ...apiCategorias.map((c) => c.nombreCategoria)];

  // Estado vacío manejado en el componente cliente
  return <HomeClient products={products} categories={categoryNames} />;
}

