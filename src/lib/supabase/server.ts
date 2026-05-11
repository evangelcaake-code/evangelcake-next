/**
 * Cliente Supabase con SERVICE_ROLE (acceso total, salta RLS).
 * SOLO para uso en API routes / Server Actions / Server Components.
 * NUNCA importar desde un "use client".
 */
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan variables de entorno de Supabase. Revisa .env.local"
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
