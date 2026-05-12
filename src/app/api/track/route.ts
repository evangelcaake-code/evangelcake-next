/**
 * POST /api/track
 * Endpoint para registrar eventos de analytics (page views, popups, conversiones).
 * Body: { event_type, page?, email?, visitor_id?, meta? }
 *
 * Diseño "fire and forget": el cliente NO espera respuesta, así que aquí
 * intentamos no fallar nunca y simplemente devolvemos 200 con un cuerpo vacío.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "popup_shown",
  "popup_dismissed",
  "popup_converted",
  "newsletter_signup",
  "game_start",
  "game_complete",
  "lead_submit",
  "configurator_open",
  "cake_modal_open",
  "cta_click",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const event_type = String(body.event_type || "").trim();
    if (!ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    await sb.from("events").insert({
      event_type,
      page: body.page ? String(body.page).slice(0, 200) : null,
      email: body.email ? String(body.email).toLowerCase().trim() : null,
      visitor_id: body.visitor_id ? String(body.visitor_id).slice(0, 64) : null,
      meta: body.meta ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      referer: req.headers.get("referer")?.slice(0, 500) ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track]:", err);
    // Aun así devolvemos 200 para no asustar al cliente con un fail visible.
    return NextResponse.json({ ok: false });
  }
}
