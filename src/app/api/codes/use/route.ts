/**
 * POST /api/codes/use
 * Endpoint público que marca un código como "usado" cuando el cliente
 * pulsa el botón "Pedir por WhatsApp" llevándose el código en el mensaje.
 *
 * Se llama vía navigator.sendBeacon para no bloquear la navegación al
 * móvil/WhatsApp, así que tiene que ser muy rápido y tolerante a errores.
 *
 * Idempotente: si el código ya está marcado como usado, no hace nada.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").trim();
    if (!code) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    // Solo actualiza si el código existe Y NO está ya usado
    // (evita reescribir used_at cada vez que pulse, mantenemos la primera vez).
    const { data } = await sb
      .from("discount_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("code", code)
      .eq("used", false)
      .select("code")
      .maybeSingle();

    if (data) {
      // También flag en subscribers para tenerlo a mano en el dashboard
      await sb
        .from("subscribers")
        .update({ discount_used: true })
        .eq("discount_code", code);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[codes/use]:", err);
    return NextResponse.json({ ok: false });
  }
}
