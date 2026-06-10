"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI } from "@/src/services/api.service";

export default function LoginPage() {
  const { setUser } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await SueñosDoradosAPI.login({
        correoElectronico: email,
        contrasena: password,
      });
      setUser({
        idUsuario: res.usuario.idUsuario,
        name: res.usuario.nombreUsuario,
        apellido: res.usuario.apellidoUsuario,
        email: res.usuario.correoElectronico,
        telefono: res.usuario.telefono,
        idRol: res.usuario.idRol,
        token: res.access_token,
      });
      router.push("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 card overflow-hidden shadow-lg">

        {/* Panel izquierdo — branding */}
        <div className="relative bg-primary p-12 flex-col justify-between hidden lg:flex">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/logo.jpeg"
              alt="Sueños Dorados"
              width={56}
              height={56}
              className="rounded-full object-cover border-2 border-white/40 shadow-lg"
            />
            <div>
              <p className="text-white font-bold text-lg leading-tight">Sueños Dorados</p>
              <p className="text-white/70 text-xs">Sofá · Cama · Baño</p>
            </div>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"
              alt="Sueños Dorados"
              fill
              className="object-cover opacity-80"
            />
          </div>
          <div>
            <h2 className="text-white font-bold text-3xl leading-tight mb-3">
              El descanso<br />que mereces
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Accede a tu cuenta y disfruta de envíos rápidos, ofertas exclusivas
              y el mejor catálogo de ropa de cama premium.
            </p>
            <div className="flex gap-3 mt-6 flex-wrap">
              {["Envío gratis", "Garantía 6 meses", "Devolución 30 días"].map((b) => (
                <span key={b} className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {b}
                </span>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs mt-8">© 2026 Sueños Dorados</p>
        </div>

        {/* Panel derecho — formulario */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.jpeg"
                alt="Sueños Dorados"
                width={40}
                height={40}
                className="rounded-full object-cover border border-gray-100 shadow-sm"
              />
              <p className="text-primary font-semibold text-sm">Sueños Dorados</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo</h1>
            <p className="text-gray-400 mt-1">Inicia sesión para continuar</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="tu@ejemplo.com"
                  className="input-field pl-9"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Tu contraseña"
                  className="input-field pl-9 pr-10"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-base py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Iniciando sesión...</>
              ) : (
                "INICIAR SESIÓN"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
