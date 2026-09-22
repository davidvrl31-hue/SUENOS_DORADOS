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

  // Mapear productos con precio real desde variantes + descuentos activos
  const products: Product[] = await Promise.all(
    apiProductos
      .filter((p) => p.estadoProducto)
      .map(async (p) => {
        const cat      = apiCategorias.find((c) => c.idCategoria === p.idCategoria);
        const varsProd = apiVariantes.filter((v) => v.idProducto === p.idProducto && v.estado);
        const variante   = varsProd.find((v) => v.stock > 0) ?? varsProd[0];
        const stockTotal = varsProd.reduce((s, v) => s + v.stock, 0);
        const precioBase = variante ? Number(variante.precio) : 0;

        // Cargar descuento activo si existe
        const descuento = await SueñosDoradosAPI.getDescuentoProducto(p.idProducto);
        const precioConDescuento = descuento
          ? Math.round(precioBase * (1 - descuento.porcentaje / 100))
          : precioBase;

        return {
          id:            p.idProducto,
          idVariante:    variante?.idVariante,
          name:          p.nombreProducto,
          price:         precioConDescuento,
          originalPrice: descuento ? precioBase : undefined,
          image:         p.imagenUrl || PLACEHOLDER_IMAGE,
          category:      cat?.nombreCategoria ?? "Sin categoría",
          slug:          p.slug,
          descripcion:   p.descripcionProducto ?? undefined,
          stock:         stockTotal,
          badge:         stockTotal === 0 ? "Agotado" : undefined,
          // Guardar el código del cupón para aplicarlo automáticamente en checkout
          codigoCupon:   descuento?.codigo,
        };
      })
  );

  const categoryNames = ["Todo", ...apiCategorias.map((c) => c.nombreCategoria)];

  return <HomeClient products={products} categories={categoryNames} />;
}

