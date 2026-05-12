/**
 * POST /api/admin/email-templates/[key]/test-send
 * Body: { to: string, subject: string, html: string, text_body?: string }
 *
 * Sustituye las variables con los datos de muestra (sample) y manda el email
 * a la dirección indicada. Útil para previsualizar en cliente real (Gmail,
 * Apple Mail) cómo se ve el email antes de guardar la plantilla.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendTestRendered } from "@/lib/resend";
import { TEMPLATE_DEFS, substitute, type TemplateKey } from "@/lib/emailTemplates";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidKey(k: string): k is TemplateKey {
  return k in TEMPLATE_DEFS;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ error: "Unknown template key" }, { status: 404 });
  }

  const body = await req.json();
  const to = String(body.to || "").trim().toLowerCase();
  const subject = String(body.subject || "");
  const html = String(body.html || "");
  const text_body = String(body.text_body || "");

  if (!EMAIL_REGEX.test(to)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }
  if (!subject || !html) {
    return NextResponse.json({ error: "Faltan subject o html" }, { status: 400 });
  }

  const def = TEMPLATE_DEFS[key];
  try {
    await sendTestRendered({
      to,
      subject: substitute(subject, def.sample),
      html: substitute(html, def.sample),
      text: substitute(text_body || "", def.sample),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin test-send]", err);
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
