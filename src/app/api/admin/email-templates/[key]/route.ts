/**
 * GET  /api/admin/email-templates/[key]  → devuelve subject + blocks + text_body
 *                                          (de DB o defaults)
 * PUT  /api/admin/email-templates/[key]  → guarda cambios en DB (upsert)
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  getTemplate,
  TEMPLATE_DEFS,
  type TemplateKey,
  type BlockMap,
} from "@/lib/emailTemplates";

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
      label: def.label,
      description: def.description,
      vars: def.vars,
      sample: def.sample,
      blockFields: def.blockFields,
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
  const blocksIn = body.blocks as BlockMap | undefined;
  const text_body = String(body.text_body || "").trim();

  if (!subject) {
    return NextResponse.json({ error: "Falta el subject" }, { status: 400 });
  }
  if (subject.length > 200) {
    return NextResponse.json({ error: "Subject demasiado largo (>200)" }, { status: 400 });
  }
  if (!blocksIn || typeof blocksIn !== "object") {
    return NextResponse.json({ error: "Faltan los bloques" }, { status: 400 });
  }

  // Solo aceptamos las keys definidas para esta plantilla (defensa contra
  // payloads inesperados desde el cliente).
  const def = TEMPLATE_DEFS[key];
  const allowedKeys = new Set(def.blockFields.map((f) => f.key));
  const blocks: BlockMap = {};
  for (const [k, v] of Object.entries(blocksIn)) {
    if (allowedKeys.has(k)) blocks[k] = String(v || "");
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("email_templates").upsert(
    {
      key,
      label: def.label,
      description: def.description,
      subject,
      // Mantenemos html con el layout actual rendereado SIN sustitución de
      // vars, para que cualquier consumer legacy que mire `html` vea algo
      // razonable. No se usa para enviar (renderTemplate va por blocks).
      html: def.layout({ ...def.defaults.blocks, ...blocks }, def.sample),
      blocks,
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
