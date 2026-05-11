/**
 * POST /api/lead
 * Formulario de contacto / encargos.
 * Body: { email, name?, phone?, event_type?, event_date?, guests?, message? }
 * - Guarda lead en Supabase
 * - Envía notificación interna por Resend
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendLeadNotification } from "@/lib/resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const lead = {
      email,
      name: body.name ? String(body.name).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
      event_type: body.event_type ? String(body.event_type).trim() : null,
      event_date: body.event_date || null,
      guests: body.guests ? Number(body.guests) : null,
      message: body.message ? String(body.message).trim().slice(0, 2000) : null,
    };

    const sb = getSupabaseAdmin();
    const { error } = await sb.from("leads").insert(lead);
    if (error) {
      console.error("[lead] insert:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Notificación interna
    try {
      await sendLeadNotification({
        ...lead,
        event_date: lead.event_date ?? undefined,
        guests: lead.guests ?? undefined,
        name: lead.name ?? undefined,
        phone: lead.phone ?? undefined,
        event_type: lead.event_type ?? undefined,
        message: lead.message ?? undefined,
      });
    } catch (err) {
      console.error("[lead] resend:", err);
      // No bloqueamos: el lead ya está en la DB.
    }

    return NextResponse.json({
      ok: true,
      message: "Gracias, te contestamos en menos de 24 h.",
    });
  } catch (err) {
    console.error("[lead] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
