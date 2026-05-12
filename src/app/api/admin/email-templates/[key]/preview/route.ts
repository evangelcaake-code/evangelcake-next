/**
 * POST /api/admin/email-templates/[key]/preview
 * Body: { subject, blocks, text_body? }
 *
 * Renderiza el email con el layout fijo + los bloques editados (sin guardar)
 * + los datos de muestra. Lo usa el editor para mostrar el preview en vivo.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  TEMPLATE_DEFS,
  substitute,
  type TemplateKey,
  type BlockMap,
} from "@/lib/emailTemplates";

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
  const subject = String(body.subject || "");
  const blocksIn = (body.blocks as BlockMap | undefined) || {};

  const def = TEMPLATE_DEFS[key];
  const merged: BlockMap = { ...def.defaults.blocks, ...blocksIn };

  const substituted: BlockMap = {};
  for (const [k, v] of Object.entries(merged)) {
    substituted[k] = substitute(v, def.sample);
  }

  return NextResponse.json({
    subject: substitute(subject, def.sample),
    html: def.layout(substituted, def.sample),
  });
}
