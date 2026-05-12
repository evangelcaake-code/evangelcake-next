/**
 * Cookie firmada que recuerda al suscriptor entre sesiones.
 * Sobrevive a borrar localStorage. NO se basa en IP (que daría falsos
 * positivos en casas / wifi compartidos).
 *
 * Formato cookie: <email>.<hmac>
 *  - email en claro (necesario para mostrar bienvenidas, no es secreto)
 *  - hmac = HMAC-SHA256(secret, email) → firma para que el cliente no pueda
 *    inventarse un email arbitrario.
 *
 * El secret se deriva del SUPABASE_SERVICE_ROLE_KEY (siempre presente,
 * nunca expuesto al cliente).
 */
import { createHmac, timingSafeEqual } from "crypto";

export const SUBSCRIBER_COOKIE = "evangelcake_subscriber";

function getSecret(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY para firmar cookies");
  return k;
}

function sign(email: string): string {
  return createHmac("sha256", getSecret()).update(email).digest("hex");
}

export function buildSubscriberCookie(email: string): string {
  return `${email}.${sign(email)}`;
}

export function parseSubscriberCookie(value: string | undefined): string | null {
  if (!value) return null;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;
  const email = value.slice(0, idx).toLowerCase();
  const provided = value.slice(idx + 1);
  const expected = sign(email);
  if (provided.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  return email;
}

export const SUBSCRIBER_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 año
};
