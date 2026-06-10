"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, Bell, User, Search, Menu, X } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { useState } from "react";
import Sidebar from "./Sidebar";
import SignTooltip from "./SignTooltip";

export default function Navbar() {
  const { cart, favorites, notifications, user } = useApp();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/busqueda", label: "Catálogo" },
    { href: "/carrito", label: "Carrito" },
    { href: "/favoritos", label: "Favoritos" },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu size={22} className="text-gray-700" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.jpeg"
                  alt="Sueños Dorados"
                  width={44}
                  height={44}
                  className="rounded-full object-cover border border-gray-100 shadow-sm"
                  priority
                />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-base text-gray-900">Sueños Dorados</span>
                  <span className="text-xs text-gray-400">Sofá · Cama · Baño</span>
                </div>
              </Link>
            </div>

            {/* Center: Nav links (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <SignTooltip key={l.href} label={l.label}>
                  <Link
                    href={l.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === l.href
                        ? "bg-primary-light text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                </SignTooltip>
              ))}
            </div>

            {/* Right: Search + Icons */}
            <div className="flex items-center gap-1">
              {/* Search bar desktop */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2 w-48 lg:w-64">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/busqueda?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
              </div>

              {/* Search icon mobile */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Buscar"
              >
                <Search size={20} className="text-gray-700" />
              </button>

              {/* Notifications */}
              <Link href="/notificaciones" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Favorites */}
              <Link href="/favoritos" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Heart size={20} className="text-gray-700" />
                {favorites.length > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/carrito" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart size={20} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <Link href="/perfil" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <User size={20} className={pathname === "/perfil" ? "text-primary" : "text-gray-700"} />
              </Link>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3">
              <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
                <Search size={16} className="text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar productos..."
                  className="bg-transparent text-sm outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/busqueda?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
