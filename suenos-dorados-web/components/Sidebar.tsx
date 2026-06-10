"use client";
import Link from "next/link";
import Image from "next/image";
import { X, Home, ShoppingCart, Heart, Package, User, Bell, HelpCircle, LogIn, LogOut } from "lucide-react";
import { useApp } from "@/app/context/AppContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, setUser, cart, favorites, notifications } = useApp();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const menuItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/carrito", label: "Carrito", icon: ShoppingCart, badge: cartCount },
    { href: "/favoritos", label: "Favoritos", icon: Heart, badge: favorites.length },
    { href: "/mis-pedidos", label: "Mis pedidos", icon: Package },
    { href: "/perfil", label: "Mi perfil", icon: User },
  ];

  const ayudaItems = [
    { href: "/notificaciones", label: "Notificaciones", icon: Bell, badge: unreadCount },
    { href: "/ayuda", label: "Ayuda y soporte", icon: HelpCircle },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-primary p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Sueños Dorados"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-white/40 shadow"
            />
            <div>
              <p className="text-white font-bold text-base leading-tight">Sueños Dorados</p>
              <p className="text-white/80 text-xs">Sofá · Cama · Baño</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-white/70 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-gray-100 bg-primary/5">
          {user ? (
            <div>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Invitado</p>
              <div className="flex gap-3 mt-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Iniciar sesión
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/registro"
                  onClick={onClose}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="px-3 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Menú</p>
          {menuItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-primary/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                  {label}
                </span>
              </div>
              {badge !== undefined && badge > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          ))}

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2 mt-4">Ayuda</p>
          {ayudaItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-primary/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                  {label}
                </span>
              </div>
              {badge !== undefined && badge > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          {user ? (
            <button
              onClick={() => { setUser(null); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-red-50 transition-colors group"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="text-sm font-medium text-red-500">Cerrar sesión</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 transition-colors group"
            >
              <LogIn size={18} className="text-primary" />
              <span className="text-sm font-medium text-primary">Iniciar sesión</span>
            </Link>
          )}
          <p className="text-center text-xs text-gray-400 mt-2">Sueños Dorados © 2026</p>
        </div>
      </aside>
    </>
  );
}
