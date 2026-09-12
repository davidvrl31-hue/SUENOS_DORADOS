"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft, Plus, Trash2, Loader2, Star, X } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI, DireccionAPI } from "@/src/services/api.service";

const FORM_VACIO = {
  nombreDestinatario:     "",
  telefonoContacto:       "",
  documentoIdentidad:     "",
  pais:                   "Colombia",
  descripcionDepartamento:"",
  descripcionMunicipio:   "",
  descripcionDireccion:   "",
  complemento:            "",
  descripcionBarrio:      "",
  codigoPostal:           "",
  indicaciones:           "",
  etiqueta:               "Casa",
  esPrincipal:            false,
};

export default function MisDireccionesPage() {
  const { user } = useApp();
  const [direcciones, setDirecciones] = useState<DireccionAPI[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [form,        setForm]        = useState(FORM_VACIO);

  const cargar = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const dirs = await SueñosDoradosAPI.getDirecciones(user.token);
      setDirecciones(dirs);
    } catch { setError("Error al cargar direcciones"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { cargar(); }, [user?.token]); // eslint-disable-line

  const abrirModal = () => { setForm(FORM_VACIO); setError(""); setShowModal(true); };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    if (!form.descripcionDireccion.trim() || !form.descripcionMunicipio.trim() ||
        !form.descripcionDepartamento.trim() || !form.descripcionBarrio.trim()) {
      setError("Completa todos los campos obligatorios (*)");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await SueñosDoradosAPI.crearDireccion(user.token, {
        nombreDestinatario:      form.nombreDestinatario.trim()     || undefined,
        telefonoContacto:        form.telefonoContacto.trim()       || undefined,
        documentoIdentidad:      form.documentoIdentidad.trim()     || undefined,
        pais:                    form.pais.trim()                   || "Colombia",
        descripcionDepartamento: form.descripcionDepartamento.trim(),
        descripcionMunicipio:    form.descripcionMunicipio.trim(),
        descripcionDireccion:    form.descripcionDireccion.trim(),
        complemento:             form.complemento.trim()            || undefined,
        descripcionBarrio:       form.descripcionBarrio.trim(),
        codigoPostal:            form.codigoPostal.trim()           || undefined,
        indicaciones:            form.indicaciones.trim()           || undefined,
        etiqueta:                form.etiqueta.trim()               || "Casa",
        esPrincipal:             form.esPrincipal,
      });
      setShowModal(false);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id: number) => {
    if (!user?.token) return;
    try {
      await SueñosDoradosAPI.eliminarDireccion(user.token, id);
      setDirecciones((prev) => prev.filter((d) => d.idDireccion !== id));
    } catch { setError("Error al eliminar dirección"); }
  };

  const f = (key: keyof typeof FORM_VACIO) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setError("");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <MapPin size={36} className="text-primary mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia sesión</h2>
        <Link href="/login" className="btn-primary max-w-xs mt-4">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/perfil" className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Mis direcciones</h1>
        </div>
        {/* Botón compacto — solo ícono + texto corto */}
        <button
          onClick={abrirModal}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      {/* ── Lista de direcciones ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 size={24} className="text-primary animate-spin" />
          <span className="text-gray-500 text-sm">Cargando...</span>
        </div>
      ) : direcciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
            <MapPin size={28} className="text-primary" />
          </div>
          <p className="text-gray-500 font-medium">No tienes direcciones guardadas</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Agrega una para poder realizar pedidos</p>
          <button onClick={abrirModal} className="btn-primary max-w-xs">Agregar dirección</button>
        </div>
      ) : (
        <div className="space-y-3">
          {direcciones.map((d) => (
            <div
              key={d.idDireccion}
              className={`card p-4 flex items-start gap-4 ${d.esPrincipal ? "border-primary/40 bg-primary-light/20" : ""}`}
            >
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Etiqueta + badge principal */}
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">
                    {d.etiqueta ?? "Casa"}
                  </span>
                  {d.esPrincipal && (
                    <span className="flex items-center gap-1 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                      <Star size={8} className="fill-white" /> Principal
                    </span>
                  )}
                </div>
                {/* Destinatario */}
                {d.nombreDestinatario && (
                  <p className="text-sm font-semibold text-gray-800">{d.nombreDestinatario}</p>
                )}
                {/* Dirección */}
                <p className="text-sm text-gray-700">{d.descripcionDireccion}</p>
                {d.complemento && <p className="text-xs text-gray-500">{d.complemento}</p>}
                {/* Barrio, municipio, departamento */}
                <p className="text-xs text-gray-500">
                  {[d.descripcionBarrio, d.descripcionMunicipio, d.descripcionDepartamento]
                    .filter(Boolean).join(", ")}
                </p>
                {/* País y código postal */}
                <p className="text-xs text-gray-400">
                  {d.pais ?? "Colombia"}
                  {d.codigoPostal ? ` · CP ${d.codigoPostal}` : ""}
                </p>
                {/* Teléfono */}
                {d.telefonoContacto && (
                  <p className="text-xs text-gray-400 mt-0.5">📞 {d.telefonoContacto}</p>
                )}
                {/* Indicaciones */}
                {d.indicaciones && (
                  <p className="text-xs text-gray-400 italic mt-0.5">💬 {d.indicaciones}</p>
                )}
              </div>
              <button
                onClick={() => handleEliminar(d.idDireccion)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal formulario ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-gray-900 text-lg">Nueva dirección</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Formulario scrolleable */}
            <form onSubmit={handleGuardar} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">
                  {error}
                </div>
              )}

              {/* ── Etiqueta ── */}
              <div>
                <label className="label-field">Etiqueta de la dirección</label>
                <div className="flex gap-2 flex-wrap">
                  {["Casa", "Trabajo", "Otra"].map((e) => (
                    <button
                      key={e} type="button"
                      onClick={() => setForm((p) => ({ ...p, etiqueta: e }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                        form.etiqueta === e
                          ? "border-primary bg-primary-light text-primary"
                          : "border-gray-200 text-gray-500 hover:border-primary/40"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Destinatario ── */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Datos del destinatario</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Nombre completo <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="Ej: María García"
                    value={form.nombreDestinatario} onChange={f("nombreDestinatario")} required />
                </div>
                <div>
                  <label className="label-field">Teléfono / WhatsApp <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="Ej: 300 123 4567" type="tel"
                    value={form.telefonoContacto} onChange={f("telefonoContacto")} required />
                </div>
              </div>
              <div>
                <label className="label-field">Cédula / NIT <span className="text-red-500">*</span></label>
                <input className="input-field" placeholder="Ej: 1234567890"
                  value={form.documentoIdentidad} onChange={f("documentoIdentidad")} required />
              </div>

              {/* ── Ubicación ── */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Ubicación</p>
              <div>
                <label className="label-field">País</label>
                <input className="input-field bg-gray-50" value={form.pais} readOnly />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Departamento <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="Ej: Antioquia"
                    value={form.descripcionDepartamento} onChange={f("descripcionDepartamento")} required />
                </div>
                <div>
                  <label className="label-field">Municipio / Ciudad <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="Ej: Medellín"
                    value={form.descripcionMunicipio} onChange={f("descripcionMunicipio")} required />
                </div>
              </div>

              {/* ── Dirección física ── */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Dirección física</p>
              <div>
                <label className="label-field">Dirección principal <span className="text-red-500">*</span></label>
                <input className="input-field" placeholder="Ej: Calle 10 # 25-40"
                  value={form.descripcionDireccion} onChange={f("descripcionDireccion")} required />
              </div>
              <div>
                <label className="label-field">Complemento (Apto, Piso, Bloque...)</label>
                <input className="input-field" placeholder="Ej: Apto 301, Torre B"
                  value={form.complemento} onChange={f("complemento")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Barrio / Sector <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="Ej: El Poblado"
                    value={form.descripcionBarrio} onChange={f("descripcionBarrio")} required />
                </div>
                <div>
                  <label className="label-field">Código postal</label>
                  <input className="input-field" placeholder="Ej: 050021"
                    value={form.codigoPostal} onChange={f("codigoPostal")} />
                </div>
              </div>
              <div>
                <label className="label-field">Indicaciones adicionales</label>
                <textarea className="input-field resize-none" rows={2}
                  placeholder="Ej: Casa de color beige, portón negro, timbre dañado..."
                  value={form.indicaciones}
                  onChange={(e) => { setForm((p) => ({ ...p, indicaciones: e.target.value })); }} />
              </div>

              {/* ── Principal ── */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.esPrincipal}
                  onChange={(e) => setForm((p) => ({ ...p, esPrincipal: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded" />
                <span className="text-sm text-gray-600">Establecer como dirección principal</span>
              </label>
            </form>

            {/* Footer fijo */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} disabled={saving}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 text-sm">
                Cancelar
              </button>
              <button
                onClick={handleGuardar as any}
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : "Guardar dirección"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
