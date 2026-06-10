"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus, Plus, Trash2, ShoppingBag, Truck,
  Loader2, CheckCircle2, MapPin, ChevronDown, ChevronUp,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI, DireccionAPI } from "@/src/services/api.service";

export default function CarritoPage() {
  const { cart, removeFromCart, updateQty, clearCart, user, loadOrders } = useApp();
  const router = useRouter();

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);

  // Direcciones
  const [direcciones, setDirecciones]   = useState<DireccionAPI[]>([]);
  const [idDireccionSel, setIdDir]      = useState<number | null>(null);
  const [loadingDirs, setLoadingDirs]   = useState(false);

  // Formulario nueva dirección inline
  const [showNuevaDireccion, setShowNueva] = useState(false);
  const [savingDir, setSavingDir]          = useState(false);
  const [dirError, setDirError]            = useState("");
  const [dirForm, setDirForm]              = useState({
    descripcionDireccion: "",
    descripcionBarrio: "",
    descripcionMunicipio: "",
    descripcionDepartamento: "",
    esPrincipal: true,
  });

  // Cálculos
  const subtotal            = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const envio               = subtotal >= 100000 ? 0 : 15000;
  const total               = subtotal + envio;
  const faltaEnvioGratis    = Math.max(0, 100000 - subtotal);

  // Cargar direcciones cuando hay usuario
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
    } catch {
      // silencioso — se muestra el formulario vacío
    } finally {
      setLoadingDirs(false);
    }
  };

  useEffect(() => { cargarDirecciones(); }, [user?.token]); // eslint-disable-line

  // Guardar nueva dirección
  const handleGuardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    if (!dirForm.descripcionDireccion.trim() || !dirForm.descripcionMunicipio.trim() || !dirForm.descripcionDepartamento.trim()) {
      setDirError("Completa dirección, municipio y departamento");
      return;
    }
    setSavingDir(true);
    setDirError("");
    try {
      const nueva = await SueñosDoradosAPI.crearDireccion(user.token, {
        descripcionDireccion: dirForm.descripcionDireccion.trim(),
        descripcionBarrio: dirForm.descripcionBarrio.trim() || undefined,
        descripcionMunicipio: dirForm.descripcionMunicipio.trim(),
        descripcionDepartamento: dirForm.descripcionDepartamento.trim(),
        esPrincipal: dirForm.esPrincipal,
      });
      setDirecciones((prev) => [...prev, nueva]);
      setIdDir(nueva.idDireccion);
      setShowNueva(false);
      setDirForm({ descripcionDireccion: "", descripcionBarrio: "", descripcionMunicipio: "", descripcionDepartamento: "", esPrincipal: true });
    } catch (err) {
      setDirError(err instanceof Error ? err.message : "Error al guardar dirección");
    } finally {
      setSavingDir(false);
    }
  };

  // Finalizar compra
  const handleCheckout = async () => {
    if (!user) { router.push("/login"); return; }

    if (!idDireccionSel) {
      setError("Debes seleccionar o agregar una dirección de entrega");
      setShowNueva(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await SueñosDoradosAPI.crearPedido(user.token, {
        idDireccion: idDireccionSel,
        items: cart.map((item) => ({
          idVariante: item.idVariante ?? 1,
          cantidad: item.quantity,
          precioUnitario: item.price,
        })),
        costoEnvio: envio,
      });
      clearCart();
      await loadOrders();
      setSuccess(true);
      setTimeout(() => router.push("/mis-pedidos"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla de éxito ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">¡Pedido realizado con éxito!</h2>
        <p className="text-gray-500 text-sm">Redirigiendo a tus pedidos...</p>
      </div>
    );
  }

  // ── Carrito vacío ────────────────────────────────────────────────────────────
  if (cart.length === 0) {
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

  // ── Vista principal ──────────────────────────────────────────────────────────
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
            <div key={`${item.id}-${item.idVariante ?? 0}`} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{item.category}</p>
                <h3 className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</h3>
                {item.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                <span className="text-primary font-bold text-sm mt-1 block">
                  ${item.price.toLocaleString("es-CO")}
                </span>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Panel derecho ── */}
        <div className="space-y-4">

          {/* Barra progreso envío gratis */}
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
                  style={{ width: `${Math.min(100, (subtotal / 100000) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* ── Sección dirección ── */}
          {user ? (
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-primary" /> Dirección de entrega
                </h3>
                <button
                  onClick={() => { setShowNueva((v) => !v); setDirError(""); }}
                  className="text-xs text-primary hover:underline flex items-center gap-1">
                  {showNuevaDireccion ? <><ChevronUp size={12} /> Cerrar</> : <><Plus size={12} /> Nueva</>}
                </button>
              </div>

              {/* Lista de direcciones existentes */}
              {loadingDirs ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" /> Cargando direcciones...
                </div>
              ) : direcciones.length === 0 && !showNuevaDireccion ? (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-500 mb-2">No tienes direcciones guardadas</p>
                  <button onClick={() => setShowNueva(true)}
                    className="text-xs text-primary font-semibold hover:underline">
                    + Agregar dirección
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {direcciones.map((d) => (
                    <label key={d.idDireccion}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        idDireccionSel === d.idDireccion
                          ? "border-primary bg-primary-light"
                          : "border-gray-200 hover:border-primary/50"
                      }`}>
                      <input type="radio" name="direccion"
                        checked={idDireccionSel === d.idDireccion}
                        onChange={() => { setIdDir(d.idDireccion); setError(""); }}
                        className="mt-0.5 accent-primary flex-shrink-0" />
                      <div className="text-xs min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{d.descripcionDireccion}</p>
                        {d.descripcionBarrio && <p className="text-gray-500">{d.descripcionBarrio}</p>}
                        <p className="text-gray-500">{d.descripcionMunicipio}, {d.descripcionDepartamento}</p>
                        {d.esPrincipal && <span className="text-primary font-semibold">Principal</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Formulario nueva dirección inline */}
              {showNuevaDireccion && (
                <form onSubmit={handleGuardarDireccion} className="space-y-3 border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-700">Nueva dirección</p>

                  {dirError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                      {dirError}
                    </div>
                  )}

                  <input type="text" placeholder="Dirección *"
                    className="input-field text-sm"
                    value={dirForm.descripcionDireccion}
                    onChange={(e) => setDirForm({ ...dirForm, descripcionDireccion: e.target.value })} />

                  <input type="text" placeholder="Barrio (opcional)"
                    className="input-field text-sm"
                    value={dirForm.descripcionBarrio}
                    onChange={(e) => setDirForm({ ...dirForm, descripcionBarrio: e.target.value })} />

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Municipio *"
                      className="input-field text-sm"
                      value={dirForm.descripcionMunicipio}
                      onChange={(e) => setDirForm({ ...dirForm, descripcionMunicipio: e.target.value })} />
                    <input type="text" placeholder="Departamento *"
                      className="input-field text-sm"
                      value={dirForm.descripcionDepartamento}
                      onChange={(e) => setDirForm({ ...dirForm, descripcionDepartamento: e.target.value })} />
                  </div>

                  <button type="submit" disabled={savingDir}
                    className="w-full bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl
                               hover:bg-gray-700 transition-colors flex items-center justify-center gap-2
                               disabled:opacity-60">
                    {savingDir
                      ? <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                      : "Guardar dirección"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="card p-4 text-center space-y-2">
              <MapPin size={20} className="text-primary mx-auto" />
              <p className="text-sm text-gray-600">
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Inicia sesión
                </Link>{" "}para guardar tu dirección y finalizar el pedido
              </p>
            </div>
          )}

          {/* ── Resumen de costos ── */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-gray-900">Resumen del pedido</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
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
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* El botón SIEMPRE está habilitado — la lógica interna maneja cada caso */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary mt-2 w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                : "Finalizar compra →"}
            </button>

            <Link href="/busqueda" className="block text-center text-sm text-primary hover:underline">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
