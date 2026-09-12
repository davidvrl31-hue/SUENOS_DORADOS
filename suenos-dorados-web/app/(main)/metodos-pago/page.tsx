"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CreditCard, Plus, X, Trash2, Star,
  Landmark, Banknote, ShieldCheck,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoMetodo = "tarjeta" | "pse" | "efectivo";

interface MetodoPago {
  id: string;
  tipo: TipoMetodo;
  label: string;
  detalle: string;
  esPrincipal: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = (idUsuario: number) => `sd_metodos_pago_${idUsuario}`;

const iconoMetodo = (tipo: TipoMetodo) => {
  if (tipo === "tarjeta") return CreditCard;
  if (tipo === "pse")     return Landmark;
  return Banknote;
};

const labelTipo = (tipo: TipoMetodo) => {
  if (tipo === "tarjeta") return "Tarjeta";
  if (tipo === "pse")     return "PSE";
  return "Efectivo / Contraentrega";
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MetodosPagoPage() {
  const { user } = useApp();
  const [metodos, setMetodos]       = useState<MetodoPago[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [tab, setTab]               = useState<TipoMetodo>("tarjeta");
  const [form, setForm]             = useState({ numero: "", titular: "", banco: "", esPrincipal: false });
  const [formError, setFormError]   = useState("");

  // Cargar desde localStorage al montar
  useEffect(() => {
    if (!user?.idUsuario) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY(user.idUsuario));
      if (saved) setMetodos(JSON.parse(saved));
    } catch { /* noop */ }
  }, [user?.idUsuario]);

  // Persistir cada vez que cambia la lista
  useEffect(() => {
    if (!user?.idUsuario) return;
    localStorage.setItem(STORAGE_KEY(user.idUsuario), JSON.stringify(metodos));
  }, [metodos, user?.idUsuario]);

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validaciones por tipo
    if (tab === "tarjeta") {
      const nums = form.numero.replace(/\s/g, "");
      if (nums.length < 13 || nums.length > 19 || !/^\d+$/.test(nums)) {
        setFormError("Ingresa un número de tarjeta válido (13-19 dígitos)");
        return;
      }
      if (!form.titular.trim()) {
        setFormError("Ingresa el nombre del titular");
        return;
      }
    }
    if (tab === "pse" && !form.banco.trim()) {
      setFormError("Ingresa el nombre del banco");
      return;
    }

    const nuevo: MetodoPago = {
      id: `${Date.now()}`,
      tipo: tab,
      label:
        tab === "tarjeta"
          ? `•••• •••• •••• ${form.numero.replace(/\s/g, "").slice(-4)}`
          : tab === "pse"
          ? form.banco.trim()
          : "Efectivo / Contraentrega",
      detalle:
        tab === "tarjeta" ? form.titular.trim() : "",
      esPrincipal: form.esPrincipal || metodos.length === 0,
    };

    // Si el nuevo es principal, quitar principal a los demás
    setMetodos((prev) => {
      const actualizados = nuevo.esPrincipal
        ? prev.map((m) => ({ ...m, esPrincipal: false }))
        : prev;
      return [...actualizados, nuevo];
    });

    setForm({ numero: "", titular: "", banco: "", esPrincipal: false });
    setShowModal(false);
  };

  const handleEliminar = (id: string) =>
    setMetodos((prev) => prev.filter((m) => m.id !== id));

  const handleSetPrincipal = (id: string) =>
    setMetodos((prev) =>
      prev.map((m) => ({ ...m, esPrincipal: m.id === id }))
    );

  const abrirModal = () => {
    setForm({ numero: "", titular: "", banco: "", esPrincipal: false });
    setFormError("");
    setTab("tarjeta");
    setShowModal(true);
  };

  // ── Sin sesión ───────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
          <CreditCard size={28} className="text-primary" />
        </div>
        <p className="font-semibold text-gray-700 mb-2">Inicia sesión para ver tus métodos de pago</p>
        <Link href="/login" className="btn-primary max-w-xs mt-2">Iniciar sesión</Link>
      </div>
    );
  }

  // ── Vista principal ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Encabezado único — flecha solo en escritorio para evitar duplicados en móvil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/perfil" className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Métodos de pago</h1>
        </div>
        {/* Botón compacto */}
        <button onClick={abrirModal}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Agregar
        </button>
      </div>

      {/* Aviso de seguridad */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <ShieldCheck size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Tus datos de pago se almacenan de forma segura en este dispositivo.
          El cobro real se procesa al finalizar tu compra.
        </p>
      </div>

      {/* Lista vacía */}
      {metodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
            <CreditCard size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-gray-700">Sin métodos de pago</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Agrega una tarjeta, PSE o elige pago contra entrega
          </p>
          <button onClick={abrirModal} className="btn-primary max-w-xs">
            Agregar método
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {metodos.map((m) => {
            const Icono = iconoMetodo(m.tipo);
            return (
              <div key={m.id}
                className={`card p-4 flex items-center gap-4 ${
                  m.esPrincipal ? "border-primary/30 bg-primary-light/20" : ""
                }`}>
                <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icono size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                    {m.esPrincipal && (
                      <span className="flex items-center gap-1 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                        <Star size={8} className="fill-white" /> Principal
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {labelTipo(m.tipo)}
                    </span>
                  </div>
                  {m.detalle && <p className="text-xs text-gray-500 mt-0.5">{m.detalle}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!m.esPrincipal && (
                    <button onClick={() => handleSetPrincipal(m.id)}
                      title="Establecer como principal"
                      className="p-1.5 hover:bg-primary-light rounded-lg transition-colors">
                      <Star size={14} className="text-primary" />
                    </button>
                  )}
                  <button onClick={() => handleEliminar(m.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal agregar método ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">

            {/* Header modal */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">Nuevo método de pago</h2>
              <button onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(["tarjeta", "pse", "efectivo"] as TipoMetodo[]).map((t) => (
                <button key={t} onClick={() => { setTab(t); setFormError(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    tab === t ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {t === "tarjeta" ? "Tarjeta" : t === "pse" ? "PSE" : "Efectivo"}
                </button>
              ))}
            </div>

            {/* Error */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleAgregar} className="space-y-4">

              {/* Tarjeta */}
              {tab === "tarjeta" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Número de tarjeta <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="0000 1111 2222 3333"
                      maxLength={19}
                      className="input-field"
                      value={form.numero}
                      onChange={(e) => {
                        // Auto-formato con espacios cada 4 dígitos
                        const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const fmt = val.replace(/(.{4})/g, "$1 ").trim();
                        setForm({ ...form, numero: fmt });
                        setFormError("");
                      }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Nombre del titular <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="Como aparece en la tarjeta"
                      className="input-field"
                      value={form.titular}
                      onChange={(e) => { setForm({ ...form, titular: e.target.value }); setFormError(""); }} />
                  </div>
                </>
              )}

              {/* PSE */}
              {tab === "pse" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Banco <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Ej: Bancolombia, Davivienda..."
                    className="input-field"
                    value={form.banco}
                    onChange={(e) => { setForm({ ...form, banco: e.target.value }); setFormError(""); }} />
                </div>
              )}

              {/* Efectivo */}
              {tab === "efectivo" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                  <p className="text-sm font-semibold text-amber-800">Pago contra entrega</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    El pago se realiza al momento de recibir tu pedido en efectivo.
                    Disponible en ciudades principales.
                  </p>
                </div>
              )}

              {tab !== "efectivo" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.esPrincipal}
                    onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-gray-600">Establecer como método principal</span>
                </label>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl
                             hover:bg-gray-50 transition-colors text-sm">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
