/**
 * Token firmado para enlaces de unsubscribe en emails.
 *
 * Email + HMAC-SHA256 truncado. El email viaja en claro en la URL (necesario
 * para saber a quién dar de baja) y el token impide que cualquiera pueda
 * darse de baja a otra persona o probar combinaciones masivas.
 *
 * El secret es el mismo que para la cookie firmada (SUPABASE_SERVICE_ROLE_KEY).
 */
import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return k;
}

export function signUnsubscribeToken(email: string): string {
  return createHmac("sha256", secret())
    .update(`unsub:${email.toLowerCase().trim()}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = signUnsubscribeToken(email);
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(email: string): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");
  const token = signUnsubscribeToken(email);
  return `${site}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
