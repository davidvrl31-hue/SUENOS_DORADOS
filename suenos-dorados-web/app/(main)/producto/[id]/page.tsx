"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, ShoppingCart, Truck, Shield, RotateCcw, Star, Loader2 } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI, Producto, VarianteProducto, Color, Medida } from "@/src/services/api.service";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/app/context/AppContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart, replaceCartItem, toggleFavorite, favorites, cart } = useApp();

  const searchParams = useSearchParams();
  const queryVarianteId = searchParams.get("variante");

  const [producto, setProducto] = useState<Producto | null>(null);
  const [variantes, setVariantes] = useState<VarianteProducto[]>([]);
  const [allVars, setAllVars] = useState<VarianteProducto[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<VarianteProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [prod, vars, cols, meds, dbAllVars] = await Promise.all([
          SueñosDoradosAPI.getProducto(Number(id)),
          SueñosDoradosAPI.getVariantes(Number(id)),
          SueñosDoradosAPI.getColores(),
          SueñosDoradosAPI.getMedidas(),
          SueñosDoradosAPI.getVariantes(),
        ]);

        if (!prod) { setNotFound(true); return; }

        setProducto(prod);
        const variantesActivas = vars.filter((v) => v.estado);
        setVariantes(variantesActivas);
        setAllVars(dbAllVars);
        setColores(cols);
        setMedidas(meds);

        // Seleccionar variante solicitada por query param o la primera con stock
        let seleccionada = null;
        if (queryVarianteId) {
          seleccionada = variantesActivas.find((v) => v.idVariante === Number(queryVarianteId));
        }
        if (!seleccionada) {
          seleccionada = variantesActivas.find((v) => v.stock > 0) || variantesActivas[0] || null;
        }
        setVarianteSeleccionada(seleccionada);

        // Cargar relacionados de la misma categoría
        const todos = await SueñosDoradosAPI.getProductos(prod.idCategoria);
        setRelacionados(todos.filter((p) => p.idProducto !== prod.idProducto && p.estadoProducto).slice(0, 4));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id, queryVarianteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={36} className="text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !producto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-xl font-bold text-gray-700">Producto no encontrado</p>
        <Link href="/busqueda" className="mt-4 text-primary hover:underline">Ver catálogo</Link>
      </div>
    );
  }

  // Construir el objeto Product compatible con el contexto
  const precioActual = varianteSeleccionada ? Number(varianteSeleccionada.precio) : 0;
  const productParaCarrito: Product = {
    id:          producto.idProducto,
    name:        producto.nombreProducto,
    price:       precioActual,
    image:       producto.imagenUrl || PLACEHOLDER_IMAGE,
    category:    String(producto.idCategoria),
    slug:        producto.slug,
    descripcion: producto.descripcionProducto ?? undefined,
  };

  const isFav = favorites.some((f) => f.id === producto.idProducto);

  // Variante que ya está en el carrito para este producto (si existe)
  const itemEnCarrito = cart.find((i) => i.id === producto.idProducto);

  // Stock real de la variante seleccionada
  const stockActual = varianteSeleccionada?.stock ?? 0;
  const cantidadEnCarrito = cart.find(
    (i) => i.idVariante === varianteSeleccionada?.idVariante
  )?.quantity ?? 0;
  const puedeAgregar = stockActual > 0 && cantidadEnCarrito < stockActual;

  // Agrupar colores únicos disponibles en variantes
  const coloresDisponibles = colores.filter((c) =>
    variantes.some((v) => v.idColor === c.idColor)
  );

  // Agrupar medidas únicas disponibles en variantes
  const medidasDisponibles = medidas.filter((m) =>
    variantes.some((v) => v.idMedida === m.idMedida)
  );

  const getNombreColor = (idColor: number) =>
    colores.find((c) => c.idColor === idColor)?.nombreColor ?? "Color";
  const getNombreMedida = (idMedida: number) =>
    medidas.find((m) => m.idMedida === idMedida)?.nombreMedida ?? "Medida";

  const relacionadosComoProduct: Product[] = relacionados.map((r) => {
    const v = allVars.find((v) => v.idProducto === r.idProducto && v.estado);
    return {
      id: r.idProducto,
      name: r.nombreProducto,
      price: v ? Number(v.precio) : 0,
      image: r.imagenUrl || PLACEHOLDER_IMAGE,
      category: String(r.idCategoria),
      slug: r.slug,
    };
  });

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/busqueda" className="hover:text-primary transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium truncate">{producto.nombreProducto}</span>
      </div>

      <button onClick={() => window.history.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Imagen */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100">
            <Image src={producto.imagenUrl || PLACEHOLDER_IMAGE} alt={producto.nombreProducto} fill
              className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {!producto.estadoProducto && (
                <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  Agotado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-primary font-semibold uppercase tracking-wider">
              Sueños Dorados
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">
              {producto.nombreProducto}
            </h1>
            {producto.descripcionProducto && (
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                {producto.descripcionProducto}
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16}
                  className={s <= 4 ? "fill-primary text-primary" : "text-gray-200 fill-gray-200"} />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.0 (128 reseñas)</span>
          </div>

          {/* Precio */}
          <div className="flex items-end gap-3">
            {varianteSeleccionada ? (
              <span className="text-3xl font-bold text-primary">
                ${Number(varianteSeleccionada.precio).toLocaleString("es-CO")}
              </span>
            ) : (
              <span className="text-lg text-gray-400 font-medium">Selecciona una opción</span>
            )}
          </div>

          {/* Selector de medidas */}
          {medidasDisponibles.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Medida</p>
              <div className="flex flex-wrap gap-2">
                {medidasDisponibles.map((m) => {
                  const isSelected = varianteSeleccionada?.idMedida === m.idMedida;
                  return (
                    <button key={m.idMedida}
                      onClick={() => {
                        const v = variantes.find(
                          (va) => va.idMedida === m.idMedida &&
                            (varianteSeleccionada ? va.idColor === varianteSeleccionada.idColor : true) &&
                            va.stock > 0
                        ) ?? variantes.find((va) => va.idMedida === m.idMedida);
                        if (v) setVarianteSeleccionada(v);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-gray-600 hover:border-primary"
                      }`}>
                      {m.nombreMedida}
                      {m.anchoCm && m.largoCm ? ` (${m.anchoCm}×${m.largoCm}cm)` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selector de colores */}
          {coloresDisponibles.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: {varianteSeleccionada ? getNombreColor(varianteSeleccionada.idColor) : "—"}
              </p>
              <div className="flex flex-wrap gap-2">
                {coloresDisponibles.map((c) => {
                  const isSelected = varianteSeleccionada?.idColor === c.idColor;
                  const disponible = variantes.some((v) => v.idColor === c.idColor && v.stock > 0);
                  return (
                    <button key={c.idColor}
                      onClick={() => {
                        const v = variantes.find(
                          (va) => va.idColor === c.idColor &&
                            (varianteSeleccionada ? va.idMedida === varianteSeleccionada.idMedida : true) &&
                            va.stock > 0
                        ) ?? variantes.find((va) => va.idColor === c.idColor);
                        if (v) setVarianteSeleccionada(v);
                      }}
                      disabled={!disponible}
                      title={c.nombreColor}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        isSelected ? "border-primary scale-110 shadow-md" : "border-transparent hover:border-gray-400"
                      } ${!disponible ? "opacity-30 cursor-not-allowed" : ""}`}
                      style={{ backgroundColor: c.codigoHex ?? "#ccc" }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          {varianteSeleccionada && (
            <p className="text-xs text-gray-500">
              {stockActual > 0 ? (
                <>
                  <span className="text-green-600 font-medium">{stockActual} en stock</span>
                  {cantidadEnCarrito > 0 && (
                    <span className="text-primary ml-2">· {cantidadEnCarrito} en tu carrito</span>
                  )}
                </>
              ) : (
                <span className="text-red-500 font-medium">Sin stock</span>
              )}
              {varianteSeleccionada.sku && ` · SKU: ${varianteSeleccionada.sku}`}
            </p>
          )}

          {/* Alerta cuando se alcanza el límite de stock */}
          {varianteSeleccionada && stockActual > 0 && !puedeAgregar && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
              Ya tienes el máximo disponible ({stockActual} {stockActual === 1 ? "unidad" : "unidades"}) en tu carrito.
            </div>
          )}

          {/* Beneficios */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Envío gratis", sub: "+$100.000" },
              { icon: Shield, label: "Garantía", sub: "6 meses" },
              { icon: RotateCcw, label: "Devolución", sub: "30 días" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <Icon size={18} className="text-primary mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <p className="text-[10px] text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => addToCart(
                { ...productParaCarrito, price: precioActual },
                varianteSeleccionada?.idVariante,
                varianteSeleccionada?.sku,
              )}
              disabled={!varianteSeleccionada || !puedeAgregar}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              {!varianteSeleccionada
                ? "Selecciona una opción"
                : stockActual === 0
                ? "Sin stock"
                : !puedeAgregar
                ? "Límite de stock alcanzado"
                : "Agregar al carrito"}
            </button>
            <button
              onClick={() => toggleFavorite(productParaCarrito)}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-colors ${
                isFav ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-primary hover:bg-primary-light"
              }`}
              aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart size={20} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>
          </div>

          {/*
            Botón "Comprar ahora":
            - Si el producto YA está en carrito con la misma variante → va directo al carrito
            - Si la variante cambió respecto a la que está en carrito → reemplaza el ítem
            - Si no está en carrito → agrega y redirige
          */}
          <button
            onClick={() => {
              if (!varianteSeleccionada || stockActual === 0) return;
              const p = { ...productParaCarrito, price: precioActual };
              if (itemEnCarrito && itemEnCarrito.idVariante === varianteSeleccionada.idVariante) {
                // Ya está con la misma variante → ir al carrito directo
                window.location.href = "/carrito";
              } else if (itemEnCarrito) {
                // Variante diferente → reemplazar ítem
                replaceCartItem(
                  itemEnCarrito.idVariante,
                  p,
                  varianteSeleccionada.idVariante,
                  varianteSeleccionada.sku,
                );
              } else {
                // No existe → agregar y redirigir
                addToCart(p, varianteSeleccionada.idVariante, varianteSeleccionada.sku, true);
              }
            }}
            disabled={!varianteSeleccionada || stockActual === 0}
            className="w-full border-2 border-primary text-primary font-semibold py-3.5 rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {itemEnCarrito && itemEnCarrito.idVariante === varianteSeleccionada?.idVariante
              ? "Ir al carrito →"
              : itemEnCarrito
              ? "Actualizar y comprar ahora"
              : "Comprar ahora"}
          </button>
        </div>
      </div>

      {/* Productos relacionados */}
      {relacionadosComoProduct.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Productos relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relacionadosComoProduct.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
