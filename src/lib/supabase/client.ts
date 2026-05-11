/**
 * Cliente Supabase para uso en BROWSER (componentes "use client").
 * Usa la anon key (segura para exponer).
 */
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
