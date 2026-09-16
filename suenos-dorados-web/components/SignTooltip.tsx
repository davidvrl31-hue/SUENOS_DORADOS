"use client";

// Videos de Lengua de Señas Colombiana (LSC) grabados por el equipo
const SIGN_VIDEOS: Record<string, string> = {
  Inicio:    "/videos/Inicio.mp4",
  Catálogo:  "/videos/catalogo.mp4",
  Carrito:   "/videos/Carrito.mp4",
  Favoritos: "/videos/favoritos.mp4",
};

interface SignTooltipProps {
  label: string;
  children: React.ReactNode;
}

export default function SignTooltip({ label, children }: SignTooltipProps) {
  const video = SIGN_VIDEOS[label];

  if (!video) return <>{children}</>;

  return (
    <div className="relative group">
      {children}

      {/* Tooltip — visible solo con CSS hover, sin estado React */}
      <div
        role="tooltip"
        aria-label={`Lengua de señas: ${label}`}
        className="
          absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
          pointer-events-none
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
        "
      >
        {/* Flecha */}
        <div className="w-3 h-3 bg-gray-900 rotate-45 mx-auto -mb-1.5 rounded-sm" />
        {/* Tarjeta con video */}
        <div className="rounded-2xl overflow-hidden shadow-2xl w-40 bg-black">
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-32 object-cover"
            aria-label={`Lengua de señas: ${label}`}
          />
        </div>
      </div>
    </div>
  );
}
