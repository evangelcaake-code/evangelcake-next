/**
 * GET  /api/admin/broadcasts        → lista de campañas (paginada simple)
 * POST /api/admin/broadcasts        → crea un draft (no envía)
 *                                     Body: { subject, html, text_body?, audience }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const VALID_AUDIENCES = ["all", "subscribed", "with_birthday_this_month", "with_unused_code"] as const;
type Audience = (typeof VALID_AUDIENCES)[number];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("broadcasts")
    .select("id, subject, audience, status, recipients_count, sent_count, fail_count, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("[admin broadcasts GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, broadcasts: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const subject = String(body.subject || "").trim();
  const html = String(body.html || "").trim();
  const text_body = String(body.text_body || "").trim();
  const audience = String(body.audience || "subscribed") as Audience;

  if (!subject || !html) {
    return NextResponse.json({ error: "Faltan subject o html" }, { status: 400 });
  }
  if (!VALID_AUDIENCES.includes(audience)) {
    return NextResponse.json({ error: "Audiencia no válida" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("broadcasts")
    .insert({
      subject,
      html,
      text_body: text_body || null,
      audience,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) {
    console.error("[admin broadcasts POST]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
