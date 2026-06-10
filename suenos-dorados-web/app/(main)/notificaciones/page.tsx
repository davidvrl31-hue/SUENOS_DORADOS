"use client";
import Link from "next/link";
import { ArrowLeft, Bell, Package, Tag, Truck, Smartphone } from "lucide-react";
import { useApp } from "@/app/context/AppContext";

const typeIcons = {
  order: Package,
  promo: Tag,
  delivery: Truck,
  app: Smartphone,
};

const typeColors = {
  order: "bg-green-100 text-green-600",
  promo: "bg-yellow-100 text-yellow-600",
  delivery: "bg-blue-100 text-blue-600",
  app: "bg-purple-100 text-purple-600",
};

export default function NotificacionesPage() {
  const { notifications } = useApp();
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/perfil" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
      </div>

      {unread.length > 0 && (
        <div className="bg-primary-light border border-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <p className="text-sm font-medium text-primary">
            Tienes {unread.length} notificación{unread.length > 1 ? "es" : ""} sin leer
          </p>
        </div>
      )}

      {unread.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sin leer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unread.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <div key={n.id} className="card p-4 flex gap-3 border-l-4 border-primary">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {read.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Anteriores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {read.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <div key={n.id} className="card p-4 flex gap-3 opacity-70">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-300 mt-1.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
