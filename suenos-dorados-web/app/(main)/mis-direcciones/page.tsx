"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft, Plus, Trash2, Loader2, Star } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI, DireccionAPI } from "@/src/services/api.service";

export default function MisDireccionesPage() {
  const { user } = useApp();
  const [direcciones, setDirecciones] = useState<DireccionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    descripcionDireccion: "",
    descripcionBarrio: "",
    descripcionMunicipio: "",
    descripcionDepartamento: "",
    esPrincipal: false,
  });

  const cargar = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const dirs = await SueñosDoradosAPI.getDirecciones(user.token);
      setDirecciones(dirs);
    } catch {
      setError("Error al cargar direcciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [user?.token]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    if (!form.descripcionDireccion || !form.descripcionMunicipio || !form.descripcionDepartamento) {
      setError("Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await SueñosDoradosAPI.crearDireccion(user.token, {
        descripcionDireccion: form.descripcionDireccion,
        descripcionBarrio: form.descripcionBarrio || undefined,
        descripcionMunicipio: form.descripcionMunicipio,
        descripcionDepartamento: form.descripcionDepartamento,
        esPrincipal: form.esPrincipal,
      });
      setForm({ descripcionDireccion: "", descripcionBarrio: "", descripcionMunicipio: "", descripcionDepartamento: "", esPrincipal: false });
      setShowForm(false);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!user?.token) return;
    try {
      await SueñosDoradosAPI.eliminarDireccion(user.token, id);
      setDirecciones((prev) => prev.filter((d) => d.idDireccion !== id));
    } catch {
      setError("Error al eliminar dirección");
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/perfil" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mis direcciones</h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 btn-primary text-sm px-4 py-2">
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Formulario para agregar */}
      {showForm && (
        <form onSubmit={handleGuardar} className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Nueva dirección</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="Ej: Calle 10 # 5-20, Apto 301"
              className="input-field"
              value={form.descripcionDireccion}
              onChange={(e) => setForm({ ...form, descripcionDireccion: e.target.value })} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Barrio</label>
            <input type="text" placeholder="Ej: El Poblado"
              className="input-field"
              value={form.descripcionBarrio}
              onChange={(e) => setForm({ ...form, descripcionBarrio: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Municipio <span className="text-red-500">*</span>
              </label>
              <input type="text" placeholder="Ej: Medellín"
                className="input-field"
                value={form.descripcionMunicipio}
                onChange={(e) => setForm({ ...form, descripcionMunicipio: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Departamento <span className="text-red-500">*</span>
              </label>
              <input type="text" placeholder="Ej: Antioquia"
                className="input-field"
                value={form.descripcionDepartamento}
                onChange={(e) => setForm({ ...form, descripcionDepartamento: e.target.value })} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.esPrincipal}
              onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })}
              className="w-4 h-4 accent-primary rounded" />
            <span className="text-sm text-gray-600">Establecer como dirección principal</span>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} disabled={saving}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : "Guardar dirección"}
            </button>
          </div>
        </form>
      )}

      {/* Lista de direcciones */}
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
          <p className="text-sm text-gray-400 mt-1">Agrega una para poder realizar pedidos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {direcciones.map((d) => (
            <div key={d.idDireccion} className={`card p-4 flex items-start gap-4 ${d.esPrincipal ? "border-primary/30 bg-primary-light/30" : ""}`}>
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{d.descripcionDireccion}</p>
                  {d.esPrincipal && (
                    <span className="flex items-center gap-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      <Star size={10} className="fill-white" /> Principal
                    </span>
                  )}
                </div>
                {d.descripcionBarrio && <p className="text-xs text-gray-500 mt-0.5">{d.descripcionBarrio}</p>}
                <p className="text-xs text-gray-500">{d.descripcionMunicipio}, {d.descripcionDepartamento}</p>
              </div>
              <button onClick={() => handleEliminar(d.idDireccion)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
