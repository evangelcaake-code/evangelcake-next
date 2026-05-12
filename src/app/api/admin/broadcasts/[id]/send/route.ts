/**
 * POST /api/admin/broadcasts/[id]/send
 *
 * Resuelve la audiencia, manda el email a cada destinatario con throttling
 * (Resend free tier permite ~2 req/s), actualiza contadores y marca como sent.
 *
 * Sustituye `{{name}}` por el nombre del subscriber si lo tenemos. El resto
 * de variables NO se aplica en broadcasts (campañas son cuerpo libre).
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendRawEmail } from "@/lib/resend";
import { substitute } from "@/lib/emailTemplates";

// Si Resend devuelve 429 podemos pasarnos del rate limit. Espaciamos 600ms entre envíos.
const DELAY_MS = 600;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveAudience(audience: string) {
  const sb = getSupabaseAdmin();

  // Base: todos los subscribers con consent (RGPD); 'all' incluye sin consent.
  let q = sb.from("subscribers").select("email, name, birthday, discount_code, discount_used");
  if (audience !== "all") {
    q = q.eq("consent_marketing", true);
  }

  const { data, error } = await q;
  if (error) throw error;
  if (!data) return [];

  if (audience === "with_birthday_this_month") {
    const m = new Date().getMonth();
    return data.filter((s) => {
      if (!s.birthday) return false;
      return new Date(s.birthday + "T00:00:00").getMonth() === m;
    });
  }
  if (audience === "with_unused_code") {
    return data.filter((s) => s.discount_code && !s.discount_used);
  }
  return data;
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { data: broadcast, error: getErr } = await sb
    .from("broadcasts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (getErr || !broadcast) {
    return NextResponse.json({ error: "Broadcast no encontrado" }, { status: 404 });
  }
  if (broadcast.status === "sent") {
    return NextResponse.json({ error: "Esta campaña ya se envió" }, { status: 400 });
  }
  if (broadcast.status === "sending") {
    return NextResponse.json({ error: "Esta campaña ya está enviándose" }, { status: 400 });
  }

  // Marcar sending para evitar re-disparos
  await sb.from("broadcasts").update({ status: "sending" }).eq("id", id);

  let recipients: { email: string; name: string | null }[] = [];
  try {
    recipients = (await resolveAudience(broadcast.audience)) as typeof recipients;
  } catch (err) {
    console.error("[broadcast audience]", err);
    await sb.from("broadcasts").update({ status: "failed" }).eq("id", id);
    return NextResponse.json({ error: "Error resolviendo audiencia" }, { status: 500 });
  }

  await sb.from("broadcasts").update({ recipients_count: recipients.length }).eq("id", id);

  let sent = 0;
  let fails = 0;

  for (const r of recipients) {
    try {
      const vars = { name: r.name || "amig@" };
      await sendRawEmail({
        to: r.email,
        subject: substitute(broadcast.subject, vars),
        html: substitute(broadcast.html, vars),
        text: substitute(broadcast.text_body || "", vars),
      });
      sent++;
    } catch (err) {
      fails++;
      console.error("[broadcast send]", r.email, err);
    }
    if (DELAY_MS > 0) await sleep(DELAY_MS);
  }

  await sb
    .from("broadcasts")
    .update({
      status: fails === recipients.length && recipients.length > 0 ? "failed" : "sent",
      sent_count: sent,
      fail_count: fails,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, sent, fails, total: recipients.length });
}
