"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus, Plus, Trash2, ShoppingBag, Truck,
  Loader2, MapPin, ChevronDown, ChevronUp, CreditCard, X,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import type { CartItem } from "@/app/context/AppContext";
import { SueñosDoradosAPI, DireccionAPI } from "@/src/services/api.service";

const DIR_VACIO = {
  nombreDestinatario:      "",
  telefonoContacto:        "",
  documentoIdentidad:      "",
  pais:                    "Colombia",
  descripcionDepartamento: "",
  descripcionMunicipio:    "",
  descripcionDireccion:    "",
  complemento:             "",
  descripcionBarrio:       "",
  codigoPostal:            "",
  indicaciones:            "",
  etiqueta:                "Casa",
  esPrincipal:             true,
};

export default function CarritoPage() {
  const { cart, removeFromCart, updateQty, clearCart, user, loadOrders } = useApp();
  const router = useRouter();

  const [step,    setStep]    = useState<"cart" | "redirigiendo">("cart");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── Direcciones ───────────────────────────────────────────────────────────
  const [direcciones,      setDirecciones]   = useState<DireccionAPI[]>([]);
  const [idDireccionSel,   setIdDir]         = useState<number | null>(null);
  const [loadingDirs,      setLoadingDirs]   = useState(false);
  const [showNuevaDireccion, setShowNueva]   = useState(false);
  const [savingDir,        setSavingDir]     = useState(false);
  const [dirError,         setDirError]      = useState("");
  const [dirForm,          setDirForm]       = useState(DIR_VACIO);

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const subtotal         = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const envio            = subtotal >= 100_000 ? 0 : 15_000;
  const total            = subtotal + envio;
  const faltaEnvioGratis = Math.max(0, 100_000 - subtotal);

  const cargarDirecciones = async () => {
    if (!user?.token) return;
    setLoadingDirs(true);
    try {
      const dirs = await SueñosDoradosAPI.getDirecciones(user.token);
      setDirecciones(dirs);
      if (dirs.length > 0 && !idDireccionSel) {
        const principal = dirs.find((d) => d.esPrincipal) ?? dirs[0];
        setIdDir(principal.idDireccion);
      }
    } catch { /* silencioso */ }
    finally { setLoadingDirs(false); }
  };

  useEffect(() => { cargarDirecciones(); }, [user?.token]); // eslint-disable-line

  // Guardar nueva dirección con campos completos
  const handleGuardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    if (!dirForm.descripcionDireccion.trim() || !dirForm.descripcionBarrio.trim() ||
        !dirForm.descripcionMunicipio.trim()  || !dirForm.descripcionDepartamento.trim() ||
        !dirForm.nombreDestinatario.trim()    || !dirForm.telefonoContacto.trim()) {
      setDirError("Completa todos los campos obligatorios (*)");
      return;
    }
    setSavingDir(true);
    setDirError("");
    try {
      const nueva = await SueñosDoradosAPI.crearDireccion(user.token, {
        nombreDestinatario:      dirForm.nombreDestinatario.trim(),
        telefonoContacto:        dirForm.telefonoContacto.trim(),
        documentoIdentidad:      dirForm.documentoIdentidad.trim() || undefined,
        pais:                    "Colombia",
        descripcionDepartamento: dirForm.descripcionDepartamento.trim(),
        descripcionMunicipio:    dirForm.descripcionMunicipio.trim(),
        descripcionDireccion:    dirForm.descripcionDireccion.trim(),
        complemento:             dirForm.complemento.trim() || undefined,
        descripcionBarrio:       dirForm.descripcionBarrio.trim(),
        codigoPostal:            dirForm.codigoPostal.trim() || undefined,
        indicaciones:            dirForm.indicaciones.trim() || undefined,
        etiqueta:                dirForm.etiqueta || "Casa",
        esPrincipal:             dirForm.esPrincipal,
      });
      setDirecciones((prev) => [...prev, nueva]);
      setIdDir(nueva.idDireccion);
      setShowNueva(false);
      setDirForm(DIR_VACIO);
    } catch (err) {
      setDirError(err instanceof Error ? err.message : "Error al guardar dirección");
    } finally { setSavingDir(false); }
  };

  // ── CHECKOUT ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!user) { router.push("/login"); return; }
    if (!idDireccionSel) {
      setError("Selecciona o agrega una dirección de entrega");
      setShowNueva(true);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const orderData = await SueñosDoradosAPI.crearPedido(user.token, {
        idDireccion: idDireccionSel,
        items: cart.map((item) => ({
          idVariante:     item.idVariante ?? 1,
          cantidad:       item.quantity,
          precioUnitario: item.price,
        })),
        costoEnvio: envio,
      });

      const { checkoutUrl, linkId, referenceId } = await SueñosDoradosAPI.crearLinkDePago(
        user.token,
        {
          idPedido:        orderData.idPedido,
          totalCOP:        Math.round(total),
          descripcion:     `Pedido #${orderData.idPedido} — Sueños Dorados`,
          correoComprador: user.email,
        }
      );

      clearCart();
      await loadOrders();
      sessionStorage.setItem("bold_link_id",  linkId);
      sessionStorage.setItem("bold_reference", referenceId);
      sessionStorage.setItem("bold_pedido_id", String(orderData.idPedido));
      setStep("redirigiendo");
      setTimeout(() => { window.location.href = checkoutUrl; }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el pago");
    } finally { setLoading(false); }
  };

  // ── Carrito vacío ─────────────────────────────────────────────────────────
  if (cart.length === 0 && step === "cart") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-5">
          <ShoppingBag size={36} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-sm mb-6">Agrega productos desde el catálogo para verlos acá</p>
        <Link href="/busqueda" className="btn-primary max-w-xs">Ir a comprar</Link>
      </div>
    );
  }

  // ── Redirigiendo a Bold ───────────────────────────────────────────────────
  if (step === "redirigiendo") {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="card p-10 flex flex-col items-center gap-6 rounded-3xl border border-gray-100 shadow-lg">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center">
            <CreditCard size={36} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Preparando tu pago...</h2>
            <p className="text-sm text-gray-500">
              Te llevamos a la pasarela de Bold donde podrás pagar con PSE,
              Nequi, tarjeta o Bancolombia.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Conectando con Bold...
          </div>
        </div>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi carrito</h1>
      <p className="text-sm text-gray-500">
        {cart.length} {cart.length === 1 ? "producto" : "productos"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Lista de productos ── */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div key={`${item.id}-${item.idVariante ?? 0}`} className="card p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/producto/${item.id}?variante=${item.idVariante}`}
                  className="relative w-full sm:w-24 h-44 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";
                    }}
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {item.category && (
                    <span className="inline-flex w-fit text-[10px] font-semibold uppercase tracking-wider bg-primary-light text-primary px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  )}
                  <Link href={`/producto/${item.id}?variante=${item.idVariante}`}>
                    <h3 className="text-sm font-bold text-gray-800 leading-snug hover:text-primary transition-colors break-words">
                      {item.name}
                    </h3>
                  </Link>
                  {item.sku && <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>}
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-primary font-bold text-base">
                      ${item.price.toLocaleString("es-CO")}
                      <span className="text-xs font-normal text-gray-400 ml-1">/ unidad</span>
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-500">
                        Subtotal: <strong className="text-gray-700">${(item.price * item.quantity).toLocaleString("es-CO")}</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1, item.idVariante)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors active:scale-95">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1, item.idVariante)}
                        disabled={item.stockDisponible !== undefined && item.quantity >= item.stockDisponible}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={item.stockDisponible !== undefined && item.quantity >= item.stockDisponible ? `Máximo: ${item.stockDisponible}` : undefined}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.idVariante)}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Panel derecho ── */}
        <div className="space-y-4">

          {/* Barra envío gratis */}
          {faltaEnvioGratis > 0 && (
            <div className="card p-4 bg-primary-light">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={16} className="text-primary" />
                <p className="text-sm font-medium text-primary">
                  Agrega ${faltaEnvioGratis.toLocaleString("es-CO")} más para envío gratis
                </p>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (subtotal / 100_000) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* ── Dirección ── */}
          {user ? (
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-primary" /> Dirección de entrega
                </h3>
                <button
                  onClick={() => { setShowNueva((v) => !v); setDirError(""); }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {showNuevaDireccion
                    ? <><ChevronUp size={12} /> Cerrar</>
                    : <><Plus size={12} /> Nueva</>}
                </button>
              </div>

              {loadingDirs ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" /> Cargando...
                </div>
              ) : direcciones.length === 0 && !showNuevaDireccion ? (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-500 mb-2">No tienes direcciones guardadas</p>
                  <button onClick={() => setShowNueva(true)} className="text-xs text-primary font-semibold hover:underline">
                    + Agregar dirección
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {direcciones.map((d) => (
                    <label key={d.idDireccion}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        idDireccionSel === d.idDireccion ? "border-primary bg-primary-light" : "border-gray-200 hover:border-primary/50"
                      }`}>
                      <input type="radio" name="direccion"
                        checked={idDireccionSel === d.idDireccion}
                        onChange={() => { setIdDir(d.idDireccion); setError(""); }}
                        className="mt-0.5 accent-primary flex-shrink-0" />
                      <div className="text-xs min-w-0">
                        {d.etiqueta && (
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wide">{d.etiqueta}</p>
                        )}
                        {d.nombreDestinatario && (
                          <p className="font-semibold text-gray-800">{d.nombreDestinatario}</p>
                        )}
                        <p className="text-gray-700">{d.descripcionDireccion}</p>
                        {d.complemento && <p className="text-gray-500">{d.complemento}</p>}
                        <p className="text-gray-500">
                          {[d.descripcionBarrio, d.descripcionMunicipio, d.descripcionDepartamento].filter(Boolean).join(", ")}
                        </p>
                        {d.esPrincipal && <span className="text-primary font-semibold">Principal</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Formulario nueva dirección inline — compacto */}
              {showNuevaDireccion && (
                <form onSubmit={handleGuardarDireccion} className="space-y-2.5 border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-700">Nueva dirección</p>
                  {dirError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">{dirError}</div>
                  )}

                  {/* Etiqueta */}
                  <div className="flex gap-1.5">
                    {["Casa", "Trabajo", "Otra"].map((e) => (
                      <button key={e} type="button"
                        onClick={() => setDirForm((p) => ({ ...p, etiqueta: e }))}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 transition-colors ${
                          dirForm.etiqueta === e ? "border-primary bg-primary-light text-primary" : "border-gray-200 text-gray-400"
                        }`}>{e}</button>
                    ))}
                  </div>

                  <input type="text" placeholder="Nombre destinatario *" className="input-field text-sm"
                    value={dirForm.nombreDestinatario}
                    onChange={(e) => setDirForm((p) => ({ ...p, nombreDestinatario: e.target.value }))} required />

                  <div className="grid grid-cols-2 gap-2">
                    <input type="tel" placeholder="Teléfono *" className="input-field text-sm"
                      value={dirForm.telefonoContacto}
                      onChange={(e) => setDirForm((p) => ({ ...p, telefonoContacto: e.target.value }))} required />
                    <input type="text" placeholder="Cédula / NIT" className="input-field text-sm"
                      value={dirForm.documentoIdentidad}
                      onChange={(e) => setDirForm((p) => ({ ...p, documentoIdentidad: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Departamento *" className="input-field text-sm"
                      value={dirForm.descripcionDepartamento}
                      onChange={(e) => setDirForm((p) => ({ ...p, descripcionDepartamento: e.target.value }))} required />
                    <input type="text" placeholder="Municipio *" className="input-field text-sm"
                      value={dirForm.descripcionMunicipio}
                      onChange={(e) => setDirForm((p) => ({ ...p, descripcionMunicipio: e.target.value }))} required />
                  </div>

                  <input type="text" placeholder="Dirección (Calle, Carrera, #...) *" className="input-field text-sm"
                    value={dirForm.descripcionDireccion}
                    onChange={(e) => setDirForm((p) => ({ ...p, descripcionDireccion: e.target.value }))} required />

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Barrio / Sector *" className="input-field text-sm"
                      value={dirForm.descripcionBarrio}
                      onChange={(e) => setDirForm((p) => ({ ...p, descripcionBarrio: e.target.value }))} required />
                    <input type="text" placeholder="Apto / Piso / Bloque" className="input-field text-sm"
                      value={dirForm.complemento}
                      onChange={(e) => setDirForm((p) => ({ ...p, complemento: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Código postal" className="input-field text-sm"
                      value={dirForm.codigoPostal}
                      onChange={(e) => setDirForm((p) => ({ ...p, codigoPostal: e.target.value }))} />
                    <div className="flex items-center gap-2 pl-1">
                      <input type="checkbox" id="esPrincipalCart" checked={dirForm.esPrincipal}
                        onChange={(e) => setDirForm((p) => ({ ...p, esPrincipal: e.target.checked }))}
                        className="accent-primary w-4 h-4" />
                      <label htmlFor="esPrincipalCart" className="text-xs text-gray-600 cursor-pointer">Principal</label>
                    </div>
                  </div>

                  <input type="text" placeholder="Indicaciones (punto de referencia...)" className="input-field text-sm"
                    value={dirForm.indicaciones}
                    onChange={(e) => setDirForm((p) => ({ ...p, indicaciones: e.target.value }))} />

                  <button type="submit" disabled={savingDir}
                    className="w-full bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {savingDir ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : "Guardar dirección"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="card p-4 text-center space-y-2">
              <MapPin size={20} className="text-primary mx-auto" />
              <p className="text-sm text-gray-600">
                <Link href="/login" className="text-primary font-semibold hover:underline">Inicia sesión</Link>{" "}
                para guardar tu dirección y finalizar el pedido
              </p>
            </div>
          )}

          {/* ── Resumen ── */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-gray-900">Resumen del pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className={envio === 0 ? "text-green-600 font-medium" : ""}>
                  {envio === 0 ? "Gratis" : `$${envio.toLocaleString("es-CO")}`}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-primary">${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>
            )}

            <button onClick={handleCheckout} disabled={loading}
              className="btn-primary mt-2 w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Procesando...</> : <><CreditCard size={16} /> Ir a pagar →</>}
            </button>

            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-400">Métodos de pago aceptados</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["PSE", "Nequi", "Tarjeta", "Bancolombia"].map((m) => (
                  <span key={m} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">Pago seguro · Bold Colombia</p>
            </div>

            <Link href="/busqueda" className="block text-center text-sm text-primary hover:underline">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
