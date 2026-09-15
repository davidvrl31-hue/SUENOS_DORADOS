import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useToast } from "../../components/ui/Toast";
import { API, Color, Medida, Producto, VarianteProducto } from "../../services/api.service";
import { COLORS, RADIUS } from "../../constants/theme";
import { fmt } from "../../utils/format";

const { width } = Dimensions.get("window");
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function ProductDetailScreen() {
  const { id, variante: queryVarianteId } = useLocalSearchParams();
  const router  = useRouter();
  const { items, addItem, replaceItem } = useCart();
  const { toggleFavorite, isFavorite }  = useFavorites();
  const { showToast } = useToast();

  const [producto,  setProducto]  = useState<Producto | null>(null);
  const [variantes, setVariantes] = useState<VarianteProducto[]>([]);
  const [colores,   setColores]   = useState<Color[]>([]);
  const [medidas,   setMedidas]   = useState<Medida[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [medidaSel, setMedidaSel] = useState<number | null>(null);
  const [colorSel,  setColorSel]  = useState<number | null>(null);

  // Cargar datos
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const prodId = Number(id);
        const [prod, vars, cols, meds] = await Promise.all([
          API.getProducto(prodId),
          API.getVariantes(prodId),
          API.getColores(),
          API.getMedidas(),
        ]);
        if (prod) {
          setProducto(prod);
          const activeVars = vars.filter((v) => v.estado);
          setVariantes(activeVars);
          setColores(cols);
          setMedidas(meds);
          let initialVar = queryVarianteId
            ? activeVars.find((v) => v.idVariante === Number(queryVarianteId))
            : null;
          if (!initialVar) initialVar = activeVars.find((v) => v.stock > 0) || activeVars[0] || null;
          if (initialVar) { setMedidaSel(initialVar.idMedida); setColorSel(initialVar.idColor); }
        }
      } catch {
        showToast("Error al cargar el producto", "info");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, queryVarianteId]); // eslint-disable-line

  // Variante seleccionada según medida + color
  const selectedVar = useCallback((): VarianteProducto | null => {
    if (!medidaSel || !colorSel) return variantes[0] || null;
    return (
      variantes.find((v) => v.idMedida === medidaSel && v.idColor === colorSel) ??
      variantes.find((v) => v.idMedida === medidaSel) ??
      variantes[0] ?? null
    );
  }, [medidaSel, colorSel, variantes]);

  const selVar = selectedVar();

  const coloresDisponibles = colores.filter((c) => variantes.some((v) => v.idColor === c.idColor));
  const medidasDisponibles = medidas.filter((m) => variantes.some((v) => v.idMedida === m.idMedida));

  const getNombreColor  = (id: number) => colores.find((c) => c.idColor  === id)?.nombreColor  ?? "Color";
  const getNombreMedida = (id: number) => medidas.find((m) => m.idMedida === id)?.nombreMedida ?? "Medida";

  // ── Estado del favorito ──
  const favKey = producto
    ? `${producto.idProducto}-${selVar?.idVariante ?? (variantes[0]?.idVariante ?? "")}`
    : "";
  const fav = isFavorite(favKey);

  // ── Ítem en carrito para ESTE producto ──
  const itemEnCarrito = items.find((i) => i.id.startsWith(`${producto?.idProducto}-`));
  const cantidadEnCarrito = items.find((i) => i.idVariante === selVar?.idVariante)?.qty ?? 0;
  const stockActual = selVar?.stock ?? 0;
  const inStock     = stockActual > 0;
  const puedeAgregar = inStock && cantidadEnCarrito < stockActual;

  // ── Helper: construye el ítem del carrito ──
  const buildCartItem = () => {
    if (!producto || !selVar) return null;
    return {
      id:               `${producto.idProducto}-${selVar.idVariante}`,
      name:             `${producto.nombreProducto} (${getNombreColor(selVar.idColor)} / ${getNombreMedida(selVar.idMedida)})`,
      price:            Number(selVar.precio),
      image:            producto.imagenUrl || PLACEHOLDER_IMAGE,
      idVariante:       selVar.idVariante,
      stockDisponible:  selVar.stock,
    };
  };

  // ── Agregar al carrito (respeta stock) ──
  const handleAddToCart = () => {
    if (!inStock) { showToast("Variante agotada", "info"); return; }
    if (!puedeAgregar) {
      showToast(`Stock máximo: ${stockActual} unidad${stockActual === 1 ? "" : "es"}`, "info");
      return;
    }
    const item = buildCartItem();
    if (!item) return;
    addItem(item);
    showToast("¡Agregado al carrito! 🛒");
  };

  // ── Comprar ahora ──
  // - Misma variante en carrito → ir al carrito directamente
  // - Variante diferente en carrito → reemplazar y navegar
  // - No está en carrito → agregar y navegar
  const handleBuyNow = () => {
    if (!inStock) return;
    const item = buildCartItem();
    if (!item) return;

    if (itemEnCarrito && itemEnCarrito.idVariante === selVar?.idVariante) {
      // Ya está con la misma variante → ir directo
      router.push("/(tabs)/cart");
    } else if (itemEnCarrito) {
      // Variante diferente → reemplazar sin duplicar
      replaceItem(itemEnCarrito.idVariante, item);
      router.push("/(tabs)/cart");
    } else {
      // No existe → agregar y navegar
      addItem(item);
      router.push("/(tabs)/cart");
    }
  };

  // ── Toggle favorito ──
  const handleToggleFavorite = () => {
    if (!producto || !selVar) return;
    toggleFavorite({
      id:    favKey,
      name:  `${producto.nombreProducto} (${getNombreColor(selVar.idColor)} / ${getNombreMedida(selVar.idMedida)})`,
      price: Number(selVar.precio),
      image: producto.imagenUrl || PLACEHOLDER_IMAGE,
    });
    showToast(fav ? "Eliminado de favoritos" : "Agregado a favoritos ❤️", fav ? "info" : "success");
  };

  // ── Estados de carga y error ──
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.orange} />
        <Text style={s.loadingTxt}>Cargando producto...</Text>
      </View>
    );
  }
  if (!producto) {
    return (
      <View style={s.center}>
        <View style={s.emptyIconBox}><Feather name="frown" size={32} color={COLORS.orange} /></View>
        <Text style={s.errorTxt}>Producto no encontrado</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
          <Text style={s.retryBtnTxt}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Texto del botón "Comprar ahora"
  const buyNowLabel = itemEnCarrito && itemEnCarrito.idVariante === selVar?.idVariante
    ? "Ir al carrito →"
    : itemEnCarrito
    ? "Actualizar y comprar"
    : "Comprar ahora";

  return (
    <SafeAreaView style={s.container}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Detalle del producto</Text>
        {/* Corazón: rojo si es favorito */}
        <TouchableOpacity
          style={[s.iconBtn, fav && s.iconBtnFav]}
          onPress={handleToggleFavorite}
        >
          <Feather
            name="heart"
            size={20}
            color={fav ? "#EF4444" : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>

        {/* ── Imagen hero ── */}
        <View style={s.imgWrapper}>
          <Image
            source={{ uri: producto.imagenUrl || PLACEHOLDER_IMAGE }}
            style={s.image}
            resizeMode="cover"
          />
          <View style={s.categoryBadge}>
            <Text style={s.categoryBadgeTxt}>Sueños Dorados</Text>
          </View>
          {!inStock && (
            <View style={s.agotadoBadge}>
              <Text style={s.agotadoBadgeTxt}>Agotado</Text>
            </View>
          )}
        </View>

        {/* ── Tarjeta de info ── */}
        <View style={s.infoCard}>

          {/* Nombre */}
          <Text style={s.nameTxt}>{producto.nombreProducto}</Text>

          {/* Precio + stock */}
          <View style={s.priceStockRow}>
            <Text style={s.priceTxt}>
              {selVar ? fmt(Number(selVar.precio)) : "$0"}
            </Text>
            {inStock ? (
              <View style={s.stockGreen}>
                <Feather name="check-circle" size={11} color="#16A34A" />
                <Text style={s.stockGreenTxt}>En stock · {stockActual} u.</Text>
              </View>
            ) : (
              <View style={s.stockRed}>
                <Text style={s.stockRedTxt}>Agotado</Text>
              </View>
            )}
          </View>

          {/* Desglose IVA */}
          {selVar && (
            <Text style={s.ivaTxt}>
              Base: ${Math.round(Number(selVar.precio) / 1.19).toLocaleString("es-CO")} + IVA 19%: ${Math.round(Number(selVar.precio) - Number(selVar.precio) / 1.19).toLocaleString("es-CO")} · IVA incluido
            </Text>
          )}

          {/* Alerta cantidad en carrito */}
          {cantidadEnCarrito > 0 && inStock && (
            <Text style={s.cartHint}>
              {cantidadEnCarrito} en tu carrito
              {cantidadEnCarrito >= stockActual ? " (máximo disponible)" : ""}
            </Text>
          )}

          {selVar && <Text style={s.skuTxt}>SKU: {selVar.sku} · Ref: {selVar.referencia}</Text>}

          <View style={s.divider} />

          {/* ── Selector Medida ── */}
          {medidasDisponibles.length > 0 && (
            <View style={s.selectorSec}>
              <Text style={s.selectorLabel}>
                Tamaño / Medida
                {medidaSel ? <Text style={s.selectorVal}> · {getNombreMedida(medidaSel)}</Text> : null}
              </Text>
              <View style={s.chipsRow}>
                {medidasDisponibles.map((m) => {
                  const active = medidaSel === m.idMedida;
                  return (
                    <TouchableOpacity
                      key={m.idMedida}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => setMedidaSel(m.idMedida)}
                    >
                      <Text style={[s.chipTxt, active && s.chipTxtActive]}>{m.nombreMedida}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Selector Color ── */}
          {coloresDisponibles.length > 0 && (
            <View style={s.selectorSec}>
              <Text style={s.selectorLabel}>
                Color
                {colorSel ? <Text style={s.selectorVal}> · {getNombreColor(colorSel)}</Text> : null}
              </Text>
              <View style={s.colorsRow}>
                {coloresDisponibles.map((c) => {
                  const hex    = c.codigoHex || "#CCCCCC";
                  const active = colorSel === c.idColor;
                  return (
                    <TouchableOpacity
                      key={c.idColor}
                      style={[s.colorOuter, active && s.colorOuterActive]}
                      onPress={() => setColorSel(c.idColor)}
                    >
                      <View style={[s.colorInner, { backgroundColor: hex }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={s.divider} />

          {/* ── Descripción ── */}
          <Text style={s.descLabel}>Descripción</Text>
          <Text style={s.descTxt}>
            {producto.descripcionProducto ||
              "Este artículo de Sueños Dorados ha sido fabricado con estándares de alta calidad para brindarte el máximo descanso, confort y suavidad."}
          </Text>

          {/* ── Beneficios (igual que en web) ── */}
          <View style={s.beneficiosRow}>
            {[
              { icon: "truck",          label: "Envío gratis", sub: "+$100.000" },
              { icon: "shield",         label: "Garantía",     sub: "6 meses" },
              { icon: "rotate-ccw",     label: "Devolución",   sub: "30 días" },
            ].map(({ icon, label, sub }) => (
              <View key={label} style={s.beneficioCard}>
                <Feather name={icon as any} size={18} color={COLORS.orange} />
                <Text style={s.beneficioLabel}>{label}</Text>
                <Text style={s.beneficioSub}>{sub}</Text>
              </View>
            ))}
          </View>

          {/* Espacio bajo el footer */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── Footer fijo ── */}
      <View style={s.footer}>
        {/* Botón Agregar al carrito */}
        <TouchableOpacity
          style={[s.addBtn, !inStock || !puedeAgregar ? s.addBtnDisabled : null]}
          onPress={handleAddToCart}
          disabled={!inStock || !puedeAgregar}
        >
          <Feather name="shopping-cart" size={18} color="#FFF" />
          <Text style={s.addBtnTxt}>
            {!inStock ? "Sin stock" : !puedeAgregar ? "Stock máximo" : "Agregar al carrito"}
          </Text>
        </TouchableOpacity>

        {/* Botón Comprar ahora */}
        <TouchableOpacity
          style={[s.buyBtn, !inStock && s.buyBtnDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock}
        >
          <Text style={s.buyBtnTxt}>{buyNowLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg, padding: 24 },
  loadingTxt: { marginTop: 12, fontSize: 14, color: COLORS.muted },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.amber, alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  errorTxt: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 20 },
  retryBtn: { backgroundColor: COLORS.orange, paddingHorizontal: 28, paddingVertical: 12, borderRadius: RADIUS.md },
  retryBtnTxt: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },
  // Corazón rojo — igual que en web
  iconBtnFav: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
  },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "800", color: COLORS.text, marginHorizontal: 8 },

  // Imagen
  imgWrapper: { width, height: width * 0.85, backgroundColor: "#ECEFF1", position: "relative" },
  image: { width: "100%", height: "100%" },
  categoryBadge: {
    position: "absolute", top: 14, left: 14,
    backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryBadgeTxt: { fontSize: 11, fontWeight: "700", color: COLORS.orange, letterSpacing: 0.5 },
  agotadoBadge: {
    position: "absolute", top: 14, right: 14,
    backgroundColor: "#FEE2E2", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  agotadoBadgeTxt: { fontSize: 11, fontWeight: "700", color: "#C62828" },

  // Tarjeta
  infoCard: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20, padding: 20, paddingTop: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 6,
  },
  nameTxt: { fontSize: 20, fontWeight: "800", color: COLORS.text, lineHeight: 26, marginBottom: 10 },

  priceStockRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  priceTxt: { fontSize: 24, fontWeight: "900", color: COLORS.orange },
  stockGreen: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  stockGreenTxt: { fontSize: 11, fontWeight: "700", color: "#16A34A" },
  stockRed: { backgroundColor: "#FFEBEE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  stockRedTxt: { fontSize: 11, fontWeight: "700", color: "#C62828" },

  cartHint: { fontSize: 12, color: COLORS.orange, fontWeight: "600", marginBottom: 4 },
  skuTxt: { fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  ivaTxt: { fontSize: 11, color: COLORS.mutedDark, marginBottom: 4, lineHeight: 16 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },

  // Selectores
  selectorSec: { marginBottom: 18 },
  selectorLabel: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  selectorVal: { fontWeight: "600", color: COLORS.orange },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.orange, backgroundColor: COLORS.amber },
  chipTxt: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  chipTxtActive: { color: COLORS.orange },

  // Colores
  colorsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  colorOuter: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: "transparent",
    justifyContent: "center", alignItems: "center",
  },
  colorOuterActive: { borderColor: COLORS.orange },
  colorInner: { width: 24, height: 24, borderRadius: 12, borderWidth: 0.5, borderColor: "#B0BEC5" },

  // Descripción
  descLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  descTxt: { fontSize: 13, color: COLORS.muted, lineHeight: 21 },

  // Beneficios
  beneficiosRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  beneficioCard: {
    flex: 1, alignItems: "center", backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, padding: 12, gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  beneficioLabel: { fontSize: 11, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  beneficioSub:   { fontSize: 10, color: COLORS.muted, textAlign: "center" },

  // Footer — dos botones lado a lado como en web
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  addBtn: {
    flex: 1, height: 50,
    backgroundColor: COLORS.orange, borderRadius: RADIUS.md,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  addBtnDisabled: { opacity: 0.45 },
  addBtnTxt: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  buyBtn: {
    flex: 1, height: 50,
    borderWidth: 2, borderColor: COLORS.orange,
    borderRadius: RADIUS.md,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "transparent",
  },
  buyBtnDisabled: { opacity: 0.45 },
  buyBtnTxt: { color: COLORS.orange, fontWeight: "700", fontSize: 14 },
} as any);
