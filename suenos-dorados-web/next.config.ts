import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "**" },  // cualquier dominio HTTPS
      { protocol: "http",  hostname: "**" },  // imágenes locales / API
    ],
    // unoptimized evita bloqueos de dominio en desarrollo
    unoptimized: true,
  },
};

export default nextConfig;

