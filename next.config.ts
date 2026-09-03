import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 80, 85, 100],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Aplicar cabeceras de seguridad a todas las rutas de la aplicación
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Bypass-Tunnel-Remainder",
            value: "true",
          },
          {
            key: "ngrok-skip-browser-warning",
            value: "true",
          },
        ],
      },
      {
        // Configuración CORS segura para APIs (sin Allow-Credentials con wildcard '*')
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, ngrok-skip-browser-warning, Bypass-Tunnel-Remainder, Authorization, x-admin-token",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
