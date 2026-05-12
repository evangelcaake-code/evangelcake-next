/**
 * POST /api/admin/email-templates/[key]/test-send
 * Body: { to, subject, blocks, text_body? }
 *
 * Renderiza con datos de muestra (def.sample) usando el layout fijo de la
 * plantilla y manda a la dirección indicada. Sirve para previsualizar el
 * email en un cliente real ANTES de guardar la edición.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendTestRendered } from "@/lib/resend";
import {
  TEMPLATE_DEFS,
  substitute,
  type TemplateKey,
  type BlockMap,
} from "@/lib/emailTemplates";

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
  const blocksIn = (body.blocks as BlockMap | undefined) || {};
  const text_body = String(body.text_body || "");

  if (!EMAIL_REGEX.test(to)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: "Falta el subject" }, { status: 400 });
  }

  const def = TEMPLATE_DEFS[key];
  const merged: BlockMap = { ...def.defaults.blocks, ...blocksIn };

  // Sustituir vars en cada bloque con los datos de muestra
  const substituted: BlockMap = {};
  for (const [k, v] of Object.entries(merged)) {
    substituted[k] = substitute(v, def.sample);
  }

  try {
    await sendTestRendered({
      to,
      subject: substitute(subject, def.sample),
      html: def.layout(substituted, def.sample),
      text: substitute(text_body || "", def.sample),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin test-send]", err);
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
