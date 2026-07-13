import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // El panel /admin se embebe dentro del sistema interno (apartado
        // Citas de sistema.evangelcake.com). frame-ancestors limita quién
        // puede meterlo en un iframe — nadie más puede.
        source: "/admin/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.evangelcake.com https://evangelcake-sistema.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
