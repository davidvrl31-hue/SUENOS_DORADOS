/** Paleta de diseño global de la app — sincronizada con el web */
export const COLORS = {
  // Fondo y superficies
  bg: "#f9f9f9",       // igual que el web (#f9f9f9)
  card: "#ffffff",
  border: "#e5e7eb",   // gray-200 del web

  // Texto
  text: "#1a1a1a",     // igual que el web
  muted: "#9ca3af",    // gray-400
  mutedDark: "#6b7280", // gray-500

  // Color primario — #F5A623 igual que el web
  orange: "#F5A623",
  amber: "#FFF3DC",       // primary-light del web
  amberBorder: "#F5D99A",
  amberAccent: "#9a5c00",

  // Estados
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
  full: 999,
} as const;
