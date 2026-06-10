"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User, Package, MapPin, CreditCard, Bell, HelpCircle,
  ChevronRight, LogIn, UserPlus, LogOut, Edit2, Check, X, Loader2
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI } from "@/src/services/api.service";

export default function PerfilPage() {
  const { user, setUser, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", telefono: "" });
  const [editError, setEditError] = useState("");

  const startEdit = () => {
    setEditForm({
      nombre: user?.name ?? "",
      apellido: user?.apellido ?? "",
      telefono: user?.telefono ?? "",
    });
    setEditing(true);
    setEditError("");
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    if (!user) return;
    setSaving(true);
    setEditError("");
    try {
      await SueñosDoradosAPI.actualizarPerfil(user.token, {
        nombreUsuario: editForm.nombre,
        apellidoUsuario: editForm.apellido,
        telefono: editForm.telefono || undefined,
      });
      setUser({ ...user, name: editForm.nombre, apellido: editForm.apellido, telefono: editForm.telefono });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { href: "/mis-pedidos", label: "Mis pedidos", icon: Package, desc: "Historial de compras" },
    { href: "/mis-direcciones", label: "Mis direcciones", icon: MapPin, desc: "Gestiona tus direcciones" },
    { href: "/metodos-pago", label: "Métodos de pago", icon: CreditCard, desc: "Tarjetas y más" },
    { href: "/notificaciones", label: "Notificaciones", icon: Bell, desc: "Alertas y avisos" },
    { href: "/ayuda", label: "Ayuda y soporte", icon: HelpCircle, desc: "Preguntas frecuentes" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de usuario */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                <User size={28} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {user ? (
                  editing ? (
                    <div className="space-y-2">
                      <input
                        className="input-field text-sm py-1.5"
                        placeholder="Nombre"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      />
                      <input
                        className="input-field text-sm py-1.5"
                        placeholder="Apellido"
                        value={editForm.apellido}
                        onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                      />
                      <input
                        className="input-field text-sm py-1.5"
                        placeholder="Teléfono"
                        value={editForm.telefono}
                        onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                      />
                      {editError && <p className="text-red-500 text-xs">{editError}</p>}
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving}
                          className="flex-1 bg-primary text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60">
                          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Guardar
                        </button>
                        <button onClick={cancelEdit} disabled={saving}
                          className="flex-1 border border-gray-200 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <X size={12} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{user.name} {user.apellido}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          {user.telefono && <p className="text-xs text-gray-400 mt-0.5">{user.telefono}</p>}
                        </div>
                        <button onClick={startEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors ml-2">
                          <Edit2 size={14} className="text-gray-400" />
                        </button>
                      </div>
                      <span className="inline-block mt-2 text-xs bg-primary-light text-primary font-medium px-2 py-0.5 rounded-full">
                        {user.idRol === 1 ? "Administrador" : "Cliente"}
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <p className="font-semibold text-gray-700">Invitado</p>
                    <p className="text-sm text-gray-400">Inicia sesión para continuar</p>
                  </>
                )}
              </div>
            </div>

            {!user && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/login" className="btn-primary text-sm py-2.5">
                  <span className="flex items-center justify-center gap-2">
                    <LogIn size={16} /> Iniciar sesión
                  </span>
                </Link>
                <Link href="/registro" className="btn-outline text-sm py-2.5">
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus size={16} /> Crear cuenta
                  </span>
                </Link>
              </div>
            )}
          </div>

          {user && (
            <button onClick={logout}
              className="w-full card p-4 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              <span className="font-semibold text-sm">Cerrar sesión</span>
            </button>
          )}
        </div>

        {/* Menú de opciones */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map(({ href, label, icon: Icon, desc }) => (
              <Link key={href} href={href}
                className="card flex items-center justify-between p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
