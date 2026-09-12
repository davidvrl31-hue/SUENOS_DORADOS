"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, Circle, Loader2, ArrowLeft, MapPin } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { SueñosDoradosAPI, DireccionRegistroPayload } from "@/src/services/api.service";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

interface LegalState {
  terminos: boolean;
  privacidad: boolean;
  comunicaciones: boolean;
}

interface DireccionState {
  descripcionDepartamento: string;
  descripcionMunicipio: string;
  descripcionDireccion: string;
  complemento: string;
  descripcionBarrio: string;
  codigoPostal: string;
  etiqueta: string;
  telefonoContacto: string;
}

const INITIAL_DIRECCION: DireccionState = {
  descripcionDepartamento: "",
  descripcionMunicipio: "",
  descripcionDireccion: "",
  complemento: "",
  descripcionBarrio: "",
  codigoPostal: "",
  etiqueta: "",
  telefonoContacto: "",
};

// ─── Componente ────────────────────────────────────────────────────────────────

export default function RegistroPage() {
  const { setUser } = useApp();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    nombre: "", apellido: "", email: "", telefono: "", password: "", confirmPassword: "",
  });
  const [legal, setLegal] = useState<LegalState>({
    terminos: false, privacidad: false, comunicaciones: false,
  });
  const [direccion, setDireccion] = useState<DireccionState>(INITIAL_DIRECCION);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
    setApiError("");
  };

  const handleDireccionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDireccion({ ...direccion, [e.target.name]: e.target.value });
    setErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const handleLegal = (key: keyof LegalState) => {
    setLegal({ ...legal, [key]: !legal[key] });
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ── Validaciones ────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) e.apellido = "El apellido es requerido";
    if (!form.email.trim()) e.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo inválido";
    if (!form.password) e.password = "La contraseña es requerida";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (!form.confirmPassword) e.confirmPassword = "Confirma tu contraseña";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!legal.terminos) e.terminos = "Debes aceptar los Términos y Condiciones";
    if (!legal.privacidad) e.privacidad = "Debes autorizar el tratamiento de datos personales";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!direccion.descripcionDepartamento.trim()) e.descripcionDepartamento = "El departamento es requerido";
    if (!direccion.descripcionMunicipio.trim()) e.descripcionMunicipio = "La ciudad es requerida";
    if (!direccion.descripcionDireccion.trim()) e.descripcionDireccion = "La dirección es requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navegación entre pasos ───────────────────────────────────────────────────

  const handleNextStep1 = () => { if (validateStep1()) setStep(2); };
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) setStep(3);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const doRegister = async (dirPayload?: DireccionRegistroPayload) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await SueñosDoradosAPI.registro({
        nombreUsuario: form.nombre,
        apellidoUsuario: form.apellido,
        correoElectronico: form.email,
        contrasena: form.password,
        telefono: form.telefono || undefined,
        direccion: dirPayload,
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
      setApiError(err instanceof Error ? err.message : "Error al crear la cuenta");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  /** Registrar con dirección validada */
  const handleSubmitWithAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    await doRegister({
      descripcionDepartamento: direccion.descripcionDepartamento,
      descripcionMunicipio: direccion.descripcionMunicipio,
      descripcionDireccion: direccion.descripcionDireccion,
      complemento: direccion.complemento || undefined,
      descripcionBarrio: direccion.descripcionBarrio || undefined,
      codigoPostal: direccion.codigoPostal || undefined,
      etiqueta: direccion.etiqueta || "Casa",
      telefonoContacto: direccion.telefonoContacto || form.telefono || undefined,
      esPrincipal: true,
    });
  };

  /** Omitir dirección y registrar sin ella */
  const handleSkipAddress = async () => {
    await doRegister(undefined);
  };

  // ── Indicador de fortaleza de contraseña ────────────────────────────────────

  const passStrength = form.password.length === 0 ? 0
    : form.password.length < 4 ? 1
    : form.password.length < 6 ? 2
    : form.password.length < 8 ? 3 : 4;
  const passLabel = ["", "Muy débil", "Débil", "Regular", "Fuerte"][passStrength];
  const passColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400"][passStrength];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[80vh] flex items-center py-6">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 card overflow-hidden shadow-lg">

        {/* Panel izquierdo — solo visible en desktop */}
        <div className="relative bg-primary p-12 flex-col justify-between hidden lg:flex">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/logo.jpeg" alt="Sueños Dorados" width={56} height={56}
              className="rounded-full object-cover border-2 border-white/40 shadow-lg" />
            <div>
              <p className="text-white font-bold text-lg leading-tight">Sueños Dorados</p>
              <p className="text-white/70 text-xs">Sofá · Cama · Baño</p>
            </div>
          </div>
          <div className="relative h-56 rounded-2xl overflow-hidden mb-8">
            <Image src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80"
              alt="Sueños Dorados" fill className="object-cover opacity-80" />
          </div>
          <div>
            <h2 className="text-white font-bold text-3xl leading-tight mb-3">
              Únete a la familia<br />Sueños Dorados
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Crea tu cuenta y accede a descuentos exclusivos, seguimiento de pedidos
              y una experiencia de compra personalizada.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { label: "Envío gratis", sub: "En compras +$100.000" },
                { label: "Garantía", sub: "6 meses en todos los productos" },
                { label: "Devoluciones", sub: "30 días sin preguntas" },
                { label: "Soporte", sub: "Lun-Vie 8am - 6pm" },
              ].map((b) => (
                <div key={b.label} className="bg-white/15 rounded-xl p-3">
                  <p className="text-white font-semibold text-sm">{b.label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs mt-8">© 2026 Sueños Dorados</p>
        </div>

        {/* Panel derecho */}
        <div className="p-8 lg:p-12 bg-white overflow-y-auto max-h-screen">
          <div className="mb-6">
            <button onClick={() => step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-6">
              <ArrowLeft size={16} /> Volver
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.jpeg" alt="Sueños Dorados" width={40} height={40}
                className="rounded-full object-cover border border-gray-100 shadow-sm" />
              <p className="text-primary font-semibold text-sm">Sueños Dorados</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Crea tu cuenta</h1>
            <p className="text-gray-400 mt-1">Descubre todos los beneficios</p>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {[
              { n: 1, label: "Datos personales" },
              { n: 2, label: "Términos legales" },
              { n: 3, label: "Dirección de envío" },
            ].map(({ n, label }, idx, arr) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= n ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                }`}>{n}</div>
                <span className={`text-xs font-medium hidden sm:block ${step >= n ? "text-primary" : "text-gray-400"}`}>
                  {label}
                </span>
                {idx < arr.length - 1 && (
                  <div className={`h-px w-6 ${step > n ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {apiError}
            </div>
          )}

          {/* ── Paso 1: Datos personales ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Nombre</label>
                  <input type="text" name="nombre" placeholder="Juan"
                    className={`input-field ${errors.nombre ? "border-red-400" : ""}`}
                    value={form.nombre} onChange={handleChange} />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="label-field">Apellido</label>
                  <input type="text" name="apellido" placeholder="García"
                    className={`input-field ${errors.apellido ? "border-red-400" : ""}`}
                    value={form.apellido} onChange={handleChange} />
                  {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
                </div>
              </div>

              <div>
                <label className="label-field">Correo electrónico</label>
                <input type="email" name="email" placeholder="tu@ejemplo.com"
                  className={`input-field ${errors.email ? "border-red-400" : ""}`}
                  value={form.email} onChange={handleChange} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label-field">Teléfono <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                <input type="tel" name="telefono" placeholder="+57 300 000 0000"
                  className="input-field" value={form.telefono} onChange={handleChange} />
              </div>

              <div>
                <label className="label-field">Contraseña</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} name="password" placeholder="Mínimo 6 caracteres"
                    className={`input-field pr-10 ${errors.password ? "border-red-400" : ""}`}
                    value={form.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passStrength ? passColor : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{passLabel}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label-field">Confirmar contraseña</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Repite tu contraseña"
                    className={`input-field pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
                    value={form.confirmPassword} onChange={handleChange} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button type="button" onClick={handleNextStep1} className="btn-primary py-3.5 mt-2">
                Continuar →
              </button>
            </div>
          )}

          {/* ── Paso 2: Términos legales ── */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <p className="text-sm text-gray-500">Lee y acepta los siguientes documentos para continuar.</p>

              <LegalCheckbox checked={legal.terminos} onChange={() => handleLegal("terminos")} error={errors.terminos}
                label={<span>He leído y acepto los <Link href="/terminos" target="_blank" className="text-primary font-semibold hover:underline">Términos y Condiciones</Link>. <span className="text-red-500">*</span></span>} />
              <LegalCheckbox checked={legal.privacidad} onChange={() => handleLegal("privacidad")} error={errors.privacidad}
                label={<span>Autorizo el tratamiento de mis datos según la <Link href="/privacidad" target="_blank" className="text-primary font-semibold hover:underline">Política de Privacidad</Link>. <span className="text-red-500">*</span></span>} />
              <LegalCheckbox checked={legal.comunicaciones} onChange={() => handleLegal("comunicaciones")}
                label={<span>Acepto recibir comunicaciones y promociones. <span className="text-gray-400">(Opcional)</span></span>} />

              <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Obligatorio</p>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  ← Volver
                </button>
                <button type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  Continuar →
                </button>
              </div>
            </form>
          )}

          {/* ── Paso 3: Dirección de envío ── */}
          {step === 3 && (
            <form onSubmit={handleSubmitWithAddress} className="space-y-4">
              {/* Banner informativo */}
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  Agrega tu dirección de entrega ahora para recibir tus pedidos sin demoras.
                  También puedes agregarla más adelante desde tu perfil.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Departamento <span className="text-red-500">*</span></label>
                  <input type="text" name="descripcionDepartamento" placeholder="Cundinamarca"
                    className={`input-field ${errors.descripcionDepartamento ? "border-red-400" : ""}`}
                    value={direccion.descripcionDepartamento} onChange={handleDireccionChange} />
                  {errors.descripcionDepartamento && <p className="text-red-500 text-xs mt-1">{errors.descripcionDepartamento}</p>}
                </div>
                <div>
                  <label className="label-field">Ciudad <span className="text-red-500">*</span></label>
                  <input type="text" name="descripcionMunicipio" placeholder="Bogotá"
                    className={`input-field ${errors.descripcionMunicipio ? "border-red-400" : ""}`}
                    value={direccion.descripcionMunicipio} onChange={handleDireccionChange} />
                  {errors.descripcionMunicipio && <p className="text-red-500 text-xs mt-1">{errors.descripcionMunicipio}</p>}
                </div>
              </div>

              <div>
                <label className="label-field">Dirección <span className="text-red-500">*</span></label>
                <input type="text" name="descripcionDireccion" placeholder="Calle 123 # 45-67"
                  className={`input-field ${errors.descripcionDireccion ? "border-red-400" : ""}`}
                  value={direccion.descripcionDireccion} onChange={handleDireccionChange} />
                {errors.descripcionDireccion && <p className="text-red-500 text-xs mt-1">{errors.descripcionDireccion}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Apto / Oficina <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                  <input type="text" name="complemento" placeholder="Apto 301, Torre B"
                    className="input-field" value={direccion.complemento} onChange={handleDireccionChange} />
                </div>
                <div>
                  <label className="label-field">Barrio <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                  <input type="text" name="descripcionBarrio" placeholder="Chapinero"
                    className="input-field" value={direccion.descripcionBarrio} onChange={handleDireccionChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Código postal <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                  <input type="text" name="codigoPostal" placeholder="110111"
                    className="input-field" value={direccion.codigoPostal} onChange={handleDireccionChange} />
                </div>
                <div>
                  <label className="label-field">Etiqueta <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                  <input type="text" name="etiqueta" placeholder="Casa, Oficina..."
                    className="input-field" value={direccion.etiqueta} onChange={handleDireccionChange} />
                </div>
              </div>

              <div>
                <label className="label-field">Teléfono de contacto <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                <input type="tel" name="telefonoContacto" placeholder="+57 300 000 0000"
                  className="input-field" value={direccion.telefonoContacto} onChange={handleDireccionChange} />
              </div>

              <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Obligatorio</p>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(2)} disabled={loading}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-60">
                  ← Volver
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Creando...</> : "Crear cuenta"}
                </button>
              </div>

              {/* Omitir dirección */}
              <button
                type="button"
                onClick={handleSkipAddress}
                disabled={loading}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2 underline underline-offset-2 disabled:opacity-60"
              >
                Omitir, agregaré mi dirección más adelante
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponente LegalCheckbox ──────────────────────────────────────────────

function LegalCheckbox({ checked, onChange, label, error }: {
  checked: boolean; onChange: () => void; label: React.ReactNode; error?: string;
}) {
  return (
    <div className={`rounded-xl border p-3 transition-colors ${
      error ? "border-red-300 bg-red-50" : checked ? "border-primary/30 bg-primary-light" : "border-gray-200 bg-gray-50"
    }`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <button type="button" onClick={onChange} className="flex-shrink-0 mt-0.5">
          {checked
            ? <CheckCircle2 size={20} className="text-primary" />
            : <Circle size={20} className={error ? "text-red-400" : "text-gray-300"} />}
        </button>
        <span className="text-xs text-gray-600 leading-relaxed">{label}</span>
      </label>
      {error && <p className="text-red-500 text-xs mt-1.5 pl-8">{error}</p>}
    </div>
  );
}
