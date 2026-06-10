"use client";
import { useState } from "react";

// Map each nav label to a public sign language GIF
// Replace these URLs with real LSC (Lengua de Señas Colombiana) videos/GIFs per section
const SIGN_VIDEOS: Record<string, string> = {
  Inicio:    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  Catálogo:  "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
  Carrito:   "https://media.giphy.com/media/xT9IgG50Lg7russbDa/giphy.gif",
  Favoritos: "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif",
};

interface SignTooltipProps {
  label: string;
  children: React.ReactNode;
}

export default function SignTooltip({ label, children }: SignTooltipProps) {
  const [visible, setVisible] = useState(false);
  const gif = SIGN_VIDEOS[label];

  if (!gif) return <>{children}</>;

  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          aria-label={`Lengua de señas: ${label}`}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none"
        >
          {/* Arrow */}
          <div className="w-3 h-3 bg-gray-900 rotate-45 mx-auto -mb-1.5 rounded-sm" />
          {/* Card */}
          <div className="rounded-2xl overflow-hidden shadow-2xl w-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gif}
              alt={`Lengua de señas: ${label}`}
              className="w-full h-28 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
