/**
 * Plantillas de email automáticas — sistema de bloques.
 *
 * Cada plantilla se compone de:
 *   - subject (string editable)
 *   - blocks: campos de texto editables (heading, intro, cta_label, etc.)
 *   - layout(blocks, vars): función pura que ensambla el HTML final usando
 *     los bloques editados + las variables del envío
 *   - text_body (string editable, fallback texto plano)
 *
 * En DB persistimos: subject + blocks (jsonb) + text_body. El layout vive
 * en código (no editable, para no romper el diseño).
 *
 * Fallback chain:
 *   row.blocks → renderiza con layout(row.blocks, vars)
 *   row.html (legacy)  → substitute(row.html, vars)
 *   defaults del código
 */
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type TemplateKey =
  | "welcome"
  | "already_subscribed"
  | "top_rank"
  | "dethroned"
  | "month_winner"
  | "lead_notification";

export interface BlockField {
  key: string;
  /** Etiqueta humana mostrada en el editor */
  label: string;
  /** "input" = una línea (títulos, CTA labels), "textarea" = párrafos */
  type: "input" | "textarea";
  /** Texto explicativo pequeño debajo del campo */
  hint?: string;
}

export type BlockMap = Record<string, string>;

interface TemplateDef {
  key: TemplateKey;
  label: string;
  description: string;
  /** Variables disponibles para esta plantilla (se sustituyen con {{name}} etc). */
  vars: readonly string[];
  /** Datos de ejemplo para preview en el editor. */
  sample: Record<string, string | number>;
  defaults: {
    subject: string;
    text: string;
    blocks: BlockMap;
  };
  blockFields: BlockField[];
  layout: (blocks: BlockMap, vars: Record<string, string | number>) => string;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

// Convierte saltos de línea simples en <br> para que párrafos editables se
// rendericen con la misma estructura visual.
function nl2br(s: string) {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

/**
 * Layout shared building blocks — usado por todas las plantillas para mantener
 * coherencia visual (mismas tarjetas redondeadas, footer común).
 */
function shell(inner: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    ${inner}
  </table>
</body></html>`;
}

function buttonHtml(label: string, url: string) {
  return `<p style="text-align:center;margin:24px 0">
    <a href="${escapeHtml(url)}" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">${nl2br(label)}</a>
  </p>`;
}

function codeBoxHtml(label: string, code: string, caption: string) {
  return `<tr><td style="padding:24px 32px">
    <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:24px;text-align:center">
      <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">${nl2br(label)}</p>
      <p style="font-family:Georgia,serif;font-size:42px;color:#e85a9a;margin:0;letter-spacing:.15em"><strong>${escapeHtml(code)}</strong></p>
      <p style="font-size:12px;color:#3a322c;margin:10px 0 0">${nl2br(caption)}</p>
    </div>
  </td></tr>`;
}

function footerHtml(line1: string, line2: string) {
  return `<tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
    <p style="margin:0">${nl2br(line1)}${line2 ? `<br>${nl2br(line2)}` : ""}</p>
  </td></tr>`;
}

// ===== TEMPLATE DEFINITIONS =====

export const TEMPLATE_DEFS: Record<TemplateKey, TemplateDef> = {
  // ===== Welcome =====
  welcome: {
    key: "welcome",
    label: "Bienvenida + código 5%",
    description: "Se envía cuando alguien se suscribe por primera vez.",
    vars: ["name", "code", "configurator_url", "wa_url", "site_url"] as const,
    sample: {
      name: "María",
      code: "8768",
      configurator_url: `${SITE_URL}/tartas-personalizadas?code=8768#sabores`,
      wa_url: "https://wa.me/34624131348?text=Hola%20tengo%20el%20codigo%208768",
      site_url: SITE_URL,
    },
    defaults: {
      subject: "Bienvenida a EvangelCake — aquí tu código del 5%",
      text:
        "Hola {{name}},\n\nGracias por suscribirte a EvangelCake. Tu código de descuento del 5% es: {{code}}\n\nÚsalo al hacer el pedido en WhatsApp o en evangelcake.com.\n\nAndreia & Tiago",
      blocks: {
        heading: "¡Hola, {{name}}!",
        intro: "Gracias por unirte a la familia EvangelCake. Como bienvenida, te dejamos un 5% de descuento para tu primera tarta personalizada.",
        code_label: "Tu código",
        code_validity: "Válido durante 90 días",
        body_text: "Configura tu tarta personalizada en la web — el código se aplicará automáticamente en el carrito:",
        cta_label: "Pedir mi tarta →",
        wa_text: "¿Prefieres WhatsApp? Escríbenos directamente.",
        signature: "Andreia & Tiago Evangelista",
        address: "Pº María Agustín 13 · Zaragoza",
      },
    },
    blockFields: [
      { key: "heading", label: "Título", type: "input", hint: "Aparece grande arriba. Puedes usar {{name}}." },
      { key: "intro", label: "Párrafo de bienvenida", type: "textarea" },
      { key: "code_label", label: "Etiqueta de la caja del código", type: "input" },
      { key: "code_validity", label: "Pie de la caja del código", type: "input", hint: "Aparece justo bajo el número." },
      { key: "body_text", label: "Texto antes del botón", type: "textarea" },
      { key: "cta_label", label: "Texto del botón", type: "input" },
      { key: "wa_text", label: "Texto bajo el botón (WhatsApp)", type: "input" },
      { key: "signature", label: "Firma — línea 1", type: "input" },
      { key: "address", label: "Firma — línea 2 (dirección)", type: "input" },
    ],
    layout: (b, v) => shell(`
      <tr><td style="padding:32px 32px 0">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">${nl2br(b.heading)}</h1>
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.intro)}</p>
      </td></tr>
      ${codeBoxHtml(b.code_label, String(v.code), b.code_validity)}
      <tr><td style="padding:0 32px 24px">
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.body_text)}</p>
        ${buttonHtml(b.cta_label, String(v.configurator_url))}
        <p style="text-align:center;color:#3a322c;font-size:13px;margin:0">${nl2br(b.wa_text)} <a href="${escapeHtml(String(v.wa_url))}" style="color:#e85a9a">WhatsApp</a></p>
      </td></tr>
      ${footerHtml(b.signature, b.address)}
    `),
  },

  // ===== Already subscribed =====
  already_subscribed: {
    key: "already_subscribed",
    label: "Ya estabas suscrita/o",
    description: "Cuando alguien intenta darse de alta con un email que ya existe.",
    vars: ["name", "code", "configurator_url", "site_url"] as const,
    sample: {
      name: "María",
      code: "8768",
      configurator_url: `${SITE_URL}/tartas-personalizadas?code=8768#sabores`,
      site_url: SITE_URL,
    },
    defaults: {
      subject: "Ey {{name}}, ya estabas dentro",
      text:
        "¡Hola {{name}}!\n\nGracias por intentar suscribirte... otra vez. Pero ya formas parte del club EvangelCake.\n\nTu código del 5% sigue siendo: {{code}}\n\nAndreia & Tiago",
      blocks: {
        heading: "Ey {{name}}, ya estás dentro",
        intro1: "Vemos que has vuelto a intentar suscribirte. Y nos hace ilusión, en serio. Pero ya formas parte del club EvangelCake.",
        intro2: "Sabemos que probablemente querías otro 5%. Lo entendemos. Pero el universo aún no nos deja repartir códigos infinitos…",
        code_label: "Tu código sigue activo",
        code_caption: "Úsalo cuando hagas tu primer pedido",
        cta_label: "Pedir mi tarta →",
        signature: "Andreia & Tiago Evangelista",
        address: "Pº María Agustín 13 · Zaragoza",
      },
    },
    blockFields: [
      { key: "heading", label: "Título", type: "input", hint: "Puedes usar {{name}}." },
      { key: "intro1", label: "Primer párrafo", type: "textarea" },
      { key: "intro2", label: "Segundo párrafo", type: "textarea" },
      { key: "code_label", label: "Etiqueta caja del código", type: "input" },
      { key: "code_caption", label: "Pie caja del código", type: "input" },
      { key: "cta_label", label: "Texto del botón", type: "input" },
      { key: "signature", label: "Firma — línea 1", type: "input" },
      { key: "address", label: "Firma — línea 2 (dirección)", type: "input" },
    ],
    layout: (b, v) => shell(`
      <tr><td style="padding:32px 32px 0">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">${nl2br(b.heading)}</h1>
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.intro1)}</p>
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.intro2)}</p>
      </td></tr>
      ${codeBoxHtml(b.code_label, String(v.code), b.code_caption)}
      <tr><td style="padding:0 32px 24px">
        ${buttonHtml(b.cta_label, String(v.configurator_url))}
      </td></tr>
      ${footerHtml(b.signature, b.address)}
    `),
  },

  // ===== Top rank =====
  top_rank: {
    key: "top_rank",
    label: "Entras al TOP 3 del mes",
    description: "Cuando un jugador entra en posición 1, 2 o 3 del ranking del mes.",
    vars: ["name", "position", "score", "month", "trophy", "medal", "site_url"] as const,
    sample: {
      name: "María",
      position: 2,
      score: 320,
      month: "2026-05",
      trophy: "🥈",
      medal: "segunda posición",
      site_url: SITE_URL,
    },
    defaults: {
      subject: "{{name}}, estás en el TOP {{position}} del mes",
      text:
        "Hola {{name}},\n\nAcabas de meter {{score}} puntos y eso te coloca en {{medal}} del ranking de {{month}}.\n\nSi te mantienes hasta fin de mes, te llevas una tarta personalizada gratis.\n\nAndreia & Tiago",
      blocks: {
        heading: "¡{{name}}, estás en el TOP {{position}}!",
        intro: "Acabas de meter {{score}} puntos y eso te coloca en {{medal}} del ranking de {{month}}.",
        prize_label: "Si te mantienes hasta fin de mes",
        prize_text: "Te llevas una tarta personalizada gratis",
        cta_label: "Defender mi puesto →",
        footer_text: "Otros jugadores intentarán superarte. Avísanos cuando quieras venir a recoger tu tarta.",
        signature: "Andreia & Tiago · EvangelCake Zaragoza",
      },
    },
    blockFields: [
      { key: "heading", label: "Título", type: "input", hint: "Usa {{name}} y {{position}}." },
      { key: "intro", label: "Párrafo de presentación", type: "textarea", hint: "Usa {{score}}, {{medal}}, {{month}}." },
      { key: "prize_label", label: "Etiqueta caja del premio", type: "input" },
      { key: "prize_text", label: "Texto del premio (caja rosa)", type: "input" },
      { key: "cta_label", label: "Texto del botón", type: "input" },
      { key: "footer_text", label: "Texto bajo el botón", type: "textarea" },
      { key: "signature", label: "Firma", type: "input" },
    ],
    layout: (b, v) => shell(`
      <tr><td style="padding:40px 32px 0;text-align:center">
        <div style="font-size:64px;line-height:1;margin-bottom:12px">${nl2br(String(v.trophy))}</div>
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">${nl2br(b.heading)}</h1>
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.intro)}</p>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:20px;text-align:center">
          <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">${nl2br(b.prize_label)}</p>
          <p style="font-family:Georgia,serif;font-size:24px;color:#e85a9a;margin:0;line-height:1.2"><strong>${nl2br(b.prize_text)}</strong></p>
        </div>
      </td></tr>
      <tr><td style="padding:0 32px 24px">
        ${buttonHtml(b.cta_label, `${String(v.site_url)}/`)}
        <p style="color:#3a322c;font-size:13px;text-align:center;margin:0">${nl2br(b.footer_text)}</p>
      </td></tr>
      ${footerHtml(b.signature, "")}
    `),
  },

  // ===== Dethroned =====
  dethroned: {
    key: "dethroned",
    label: "Te han destronado del #1",
    description: "Cuando otro jugador te supera y te quita el primer puesto.",
    vars: ["old_king", "new_king", "new_score", "your_score", "diff", "site_url"] as const,
    sample: {
      old_king: "Carlos",
      new_king: "María",
      new_score: 340,
      your_score: 320,
      diff: 20,
      site_url: SITE_URL,
    },
    defaults: {
      subject: "{{old_king}}, has perdido el primer puesto del mes",
      text:
        "Hola {{old_king}},\n\n{{new_king}} acaba de subirse al primer puesto con {{new_score}} puntos (te saca {{diff}}). Tu récord se queda en {{your_score}}.\n\nAún queda mes. Si recuperas el #1, la tarta personalizada gratis es tuya.\n\nAndreia & Tiago",
      blocks: {
        heading: "Ey {{old_king}}, te han destronado",
        intro: "{{new_king}} acaba de subirse al #1 con {{new_score}} puntos (te saca {{diff}}). Tu récord se queda en {{your_score}}.",
        callout: "Aún queda mes. Si recuperas el primer puesto antes del último día, la tarta personalizada gratis es tuya.",
        cta_label: "Recuperar el #1 →",
        signature: "Andreia & Tiago · EvangelCake Zaragoza",
      },
    },
    blockFields: [
      { key: "heading", label: "Título", type: "input", hint: "Usa {{old_king}}." },
      { key: "intro", label: "Párrafo principal", type: "textarea", hint: "Variables: {{new_king}}, {{new_score}}, {{diff}}, {{your_score}}." },
      { key: "callout", label: "Caja resaltada", type: "textarea" },
      { key: "cta_label", label: "Texto del botón", type: "input" },
      { key: "signature", label: "Firma", type: "input" },
    ],
    layout: (b, v) => shell(`
      <tr><td style="padding:40px 32px 0;text-align:center">
        <div style="font-size:54px;line-height:1;margin-bottom:12px">⚔️</div>
        <h1 style="font-family:Georgia,serif;font-size:26px;color:#1a1614;margin:0 0 8px">${nl2br(b.heading)}</h1>
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.intro)}</p>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <div style="background:rgba(232,90,154,.08);border:1px solid rgba(232,90,154,.20);border-radius:14px;padding:18px;text-align:center">
          <p style="margin:0;color:#3a322c;font-size:14px;line-height:1.55">${nl2br(b.callout)}</p>
        </div>
      </td></tr>
      <tr><td style="padding:0 32px 28px">
        ${buttonHtml(b.cta_label, `${String(v.site_url)}/`)}
      </td></tr>
      ${footerHtml(b.signature, "")}
    `),
  },

  // ===== Month winner =====
  month_winner: {
    key: "month_winner",
    label: "Ganador del mes (cron día 1)",
    description: "Día 1 de cada mes a los 3 mejores del mes anterior.",
    vars: ["name", "position", "score", "month_label", "winner_code", "trophy", "medal", "wa_url"] as const,
    sample: {
      name: "María",
      position: 1,
      score: 420,
      month_label: "abril 2026",
      winner_code: "WIN-2026-04-1",
      trophy: "🥇",
      medal: "PRIMER",
      wa_url: "https://wa.me/34624131348?text=Hola...",
    },
    defaults: {
      subject: "{{name}}, tu tarta gratis del ranking de {{month_label}} te espera",
      text:
        "Hola {{name}},\n\nHas terminado en {{medal}} PUESTO del ranking de {{month_label}} con {{score}} puntos.\nTu código de ganador: {{winner_code}}\n\nEscríbenos por WhatsApp al 624 131 348 con este código.\n\nAndreia & Tiago",
      blocks: {
        heading: "¡{{name}}, HAS GANADO!",
        intro: "Has terminado en {{medal}} PUESTO del ranking del juego de {{month_label}}, con {{score}} puntos.",
        subtext: "Te has ganado una tarta personalizada gratis 🎂",
        code_label: "Tu código de ganador",
        code_caption: "Enseña este código por WhatsApp o presencial",
        body_text: "Escríbenos por WhatsApp para concretar día y diseño de tu tarta. Tienes 30 días para canjearla.",
        cta_label: "Reclamar mi tarta →",
        signature: "Andreia & Tiago · EvangelCake",
        address: "Pº María Agustín 13 · Zaragoza",
      },
    },
    blockFields: [
      { key: "heading", label: "Título", type: "input" },
      { key: "intro", label: "Primer párrafo (con variables)", type: "textarea" },
      { key: "subtext", label: "Segundo párrafo (premio)", type: "textarea" },
      { key: "code_label", label: "Etiqueta caja del código", type: "input" },
      { key: "code_caption", label: "Pie caja del código", type: "input" },
      { key: "body_text", label: "Texto antes del botón", type: "textarea" },
      { key: "cta_label", label: "Texto del botón", type: "input" },
      { key: "signature", label: "Firma — línea 1", type: "input" },
      { key: "address", label: "Firma — línea 2", type: "input" },
    ],
    layout: (b, v) => shell(`
      <tr><td style="padding:48px 32px 0;text-align:center">
        <div style="font-size:72px;line-height:1;margin-bottom:8px">${nl2br(String(v.trophy))}</div>
        <h1 style="font-family:Georgia,serif;font-size:32px;color:#1a1614;margin:0 0 8px">${nl2br(b.heading)}</h1>
        <p style="color:#3a322c;line-height:1.55;font-size:16px">${nl2br(b.intro)}</p>
        <p style="color:#3a322c;line-height:1.55;font-size:16px">${nl2br(b.subtext)}</p>
      </td></tr>
      ${codeBoxHtml(b.code_label, String(v.winner_code), b.code_caption)}
      <tr><td style="padding:0 32px 24px">
        <p style="color:#3a322c;line-height:1.6">${nl2br(b.body_text)}</p>
        ${buttonHtml(b.cta_label, String(v.wa_url))}
      </td></tr>
      ${footerHtml(b.signature, b.address)}
    `),
  },

  // ===== Lead notification (interno) =====
  lead_notification: {
    key: "lead_notification",
    label: "Notificación interna de lead",
    description: "Email INTERNO a hola@evangelcake.com cuando alguien rellena el contacto.",
    vars: ["name", "email", "phone", "event_type", "event_date", "guests", "message"] as const,
    sample: {
      name: "María García",
      email: "maria@example.com",
      phone: "+34 600 000 000",
      event_type: "Cumpleaños",
      event_date: "2026-06-15",
      guests: "20",
      message: "Quería una tarta de tres leches para 20 personas, sin nueces.",
    },
    defaults: {
      subject: "Nuevo lead · {{event_type}} — {{name}}",
      text:
        "Nuevo lead recibido\n\nNombre: {{name}}\nEmail: {{email}}\nTeléfono: {{phone}}\nEvento: {{event_type}}\nFecha: {{event_date}}\nComensales: {{guests}}\n\nMensaje:\n{{message}}",
      blocks: {
        heading: "Nuevo lead recibido",
      },
    },
    blockFields: [
      { key: "heading", label: "Título del email", type: "input", hint: "Este email lo recibes TÚ, no el cliente. Solo se edita el título." },
    ],
    layout: (b, v) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#f5f0e8;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px">
    <tr><td>
      <h2 style="margin:0 0 16px;color:#1a1614">${nl2br(b.heading)}</h2>
      <p><strong>Nombre:</strong> ${nl2br(String(v.name))}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(String(v.email))}">${escapeHtml(String(v.email))}</a></p>
      <p><strong>Teléfono:</strong> ${nl2br(String(v.phone))}</p>
      <p><strong>Evento:</strong> ${nl2br(String(v.event_type))}</p>
      <p><strong>Fecha:</strong> ${nl2br(String(v.event_date))}</p>
      <p><strong>Comensales:</strong> ${nl2br(String(v.guests))}</p>
      <p><strong>Mensaje:</strong></p>
      <p style="background:#f5f0e8;padding:12px;border-radius:8px;white-space:pre-wrap">${nl2br(String(v.message))}</p>
    </td></tr>
  </table>
</body></html>`,
  },
};

export const TEMPLATE_KEYS: TemplateKey[] = Object.keys(TEMPLATE_DEFS) as TemplateKey[];

export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface TemplateRow {
  key: TemplateKey;
  subject: string;
  blocks: BlockMap | null;
  text_body: string | null;
  updated_at: string | null;
}

/**
 * Sustitución simple de `{{key}}` por su valor.
 */
export function substitute(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi, (_m, key) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

function substituteBlocks(blocks: BlockMap, vars: Record<string, string | number>): BlockMap {
  const out: BlockMap = {};
  for (const [k, v] of Object.entries(blocks)) {
    out[k] = substitute(v, vars);
  }
  return out;
}

/** Lee la plantilla de DB (si existe). */
export async function loadTemplateRow(key: TemplateKey): Promise<TemplateRow | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("email_templates")
      .select("key, subject, blocks, text_body, updated_at")
      .eq("key", key)
      .maybeSingle();
    return (data as TemplateRow) || null;
  } catch (err) {
    console.warn("[emailTemplates] loadTemplateRow fallback:", err);
    return null;
  }
}

/** Devuelve plantilla con defaults aplicados si no hay fila. */
export async function getTemplate(key: TemplateKey): Promise<{
  subject: string;
  blocks: BlockMap;
  text_body: string;
  updated_at: string | null;
}> {
  const def = TEMPLATE_DEFS[key];
  const row = await loadTemplateRow(key);
  if (row) {
    return {
      subject: row.subject || def.defaults.subject,
      blocks: { ...def.defaults.blocks, ...(row.blocks || {}) },
      text_body: row.text_body || def.defaults.text,
      updated_at: row.updated_at,
    };
  }
  return {
    subject: def.defaults.subject,
    blocks: def.defaults.blocks,
    text_body: def.defaults.text,
    updated_at: null,
  };
}

/** Render con sustitución de variables. Usado por los send helpers. */
export async function renderTemplate(
  key: TemplateKey,
  vars: Record<string, string | number>,
): Promise<RenderedTemplate> {
  const def = TEMPLATE_DEFS[key];
  const tpl = await getTemplate(key);
  const substitutedBlocks = substituteBlocks(tpl.blocks, vars);
  return {
    subject: substitute(tpl.subject, vars),
    html: def.layout(substitutedBlocks, vars),
    text: substitute(tpl.text_body || "", vars),
  };
}

/** Render preview con datos de ejemplo (usado en el editor cliente). */
export function renderPreview(
  key: TemplateKey,
  blocks: BlockMap,
  subject?: string,
  text?: string,
): RenderedTemplate {
  const def = TEMPLATE_DEFS[key];
  const merged = { ...def.defaults.blocks, ...blocks };
  const substitutedBlocks = substituteBlocks(merged, def.sample);
  return {
    subject: substitute(subject ?? def.defaults.subject, def.sample),
    html: def.layout(substitutedBlocks, def.sample),
    text: substitute(text ?? def.defaults.text, def.sample),
  };
}
