/**
 * Auth + CORS de la API interna del SOP (/api/sistema/*).
 *
 * El sistema (sistema.evangelcake.com) manda:
 *   Authorization: Bearer <SISTEMA_API_TOKEN>
 *
 * El token vive en la variable de entorno SISTEMA_API_TOKEN. Rotarlo =
 * cambiar la variable en Vercel y en el sistema. Si se filtra, se rota
 * y el viejo deja de valer al momento.
 */
import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

const ALLOWED_ORIGINS = [
  "https://sistema.evangelcake.com",
  "https://evangelcake-sistema.vercel.app",
];

export function sistemaCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function isSistemaAuthorized(req: NextRequest): boolean {
  const expected = process.env.SISTEMA_API_TOKEN;
  if (!expected) return false; // sin token configurado, la API está apagada
  const header = req.headers.get("authorization") ?? "";
  const got = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (got.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
  } catch {
    return false;
  }
}
