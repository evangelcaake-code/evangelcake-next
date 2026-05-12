/**
 * GET  /api/admin/email-templates/[key]  → devuelve subject/html/text actuales
 *                                          (de DB o, si no hay fila, del default)
 * PUT  /api/admin/email-templates/[key]  → guarda cambios en DB (upsert)
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getTemplate, TEMPLATE_DEFS, type TemplateKey } from "@/lib/emailTemplates";

function isValidKey(k: string): k is TemplateKey {
  return k in TEMPLATE_DEFS;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ error: "Unknown template key" }, { status: 404 });
  }
  const tpl = await getTemplate(key);
  const def = TEMPLATE_DEFS[key];
  return NextResponse.json({
    ok: true,
    template: tpl,
    meta: {
      vars: def.vars,
      sample: def.sample,
      description: def.description,
      label: def.label,
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ error: "Unknown template key" }, { status: 404 });
  }
  const body = await req.json();
  const subject = String(body.subject || "").trim();
  const html = String(body.html || "").trim();
  const text_body = String(body.text_body || "").trim();

  if (!subject || !html) {
    return NextResponse.json({ error: "Faltan subject o html" }, { status: 400 });
  }
  if (subject.length > 200) {
    return NextResponse.json({ error: "Subject demasiado largo (>200)" }, { status: 400 });
  }

  const def = TEMPLATE_DEFS[key];
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("email_templates").upsert(
    {
      key,
      label: def.label,
      description: def.description,
      subject,
      html,
      text_body: text_body || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) {
    console.error("[admin email-templates PUT]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
