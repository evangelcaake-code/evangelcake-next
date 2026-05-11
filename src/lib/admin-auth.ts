import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "evangelcake_admin";

function getPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    throw new Error(
      "ADMIN_PASSWORD no está configurada en .env.local — el admin no funciona sin ella.",
    );
  }
  return pwd;
}

/**
 * Token = HMAC-SHA256(ADMIN_PASSWORD, "admin").
 * Como depende de la contraseña, cambiarla invalida todas las cookies activas.
 */
export function makeToken(): string {
  return createHmac("sha256", getPassword()).update("admin").digest("hex");
}

export function verifyToken(value: string | undefined): boolean {
  if (!value) return false;
  const expected = makeToken();
  if (value.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const expected = getPassword();
  if (input.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(ADMIN_COOKIE)?.value);
}
