/**
 * Plantillas de email automáticas.
 *
 * Cada plantilla tiene una versión "código" (fallback inicial) y, una vez
 * el usuario la edita en /admin/emails/templates, una versión "DB" en la
 * tabla `email_templates`. La función `renderTemplate()`:
 *
 *   1. Carga la fila de DB por key
 *   2. Si no existe → usa el default del código
 *   3. Sustituye `{{var_name}}` por los valores reales
 *   4. Devuelve { subject, html, text }
 *
 * Las plantillas NO incluyen el footer de unsubscribe — eso se añade
 * automáticamente en resend.ts para que el editor no pueda romperlo.
 */
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type TemplateKey =
  | "welcome"
  | "already_subscribed"
  | "top_rank"
  | "dethroned"
  | "month_winner"
  | "lead_notification";

interface TemplateDef {
  key: TemplateKey;
  label: string;
  description: string;
  /** Variables disponibles para esta plantilla. */
  vars: readonly string[];
  /** Datos de ejemplo para preview en el editor. */
  sample: Record<string, string | number>;
  defaults: {
    subject: string;
    html: string;
    text: string;
  };
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");

// ===== DEFAULTS (fallback si no hay fila en DB) =====
//
// Los defaults son intencionalmente idénticos a lo que tenías hardcoded en
// resend.ts antes. La primera vez que abras el editor en /admin/emails verás
// estos textos; al guardar se persisten en DB y a partir de ahí lo único que
// importa es lo que hay ahí.

const WELCOME_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:32px 32px 0">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">¡Hola, {{name}}!</h1>
      <p style="color:#3a322c;line-height:1.6">Gracias por unirte a la familia EvangelCake. Como bienvenida, te dejamos un <strong>5% de descuento</strong> para tu primera tarta personalizada.</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:24px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Tu código</p>
        <p style="font-family:Georgia,serif;font-size:42px;color:#e85a9a;margin:0;letter-spacing:.15em"><strong>{{code}}</strong></p>
        <p style="font-size:12px;color:#3a322c;margin:10px 0 0">Válido durante 90 días</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="color:#3a322c;line-height:1.6">Configura tu tarta personalizada en la web — el código se aplicará automáticamente en el carrito:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="{{configurator_url}}" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Pedir mi tarta →</a>
      </p>
      <p style="text-align:center;color:#3a322c;font-size:13px;margin:0">¿Prefieres WhatsApp? <a href="{{wa_url}}" style="color:#e85a9a">Escríbenos directamente</a>.</p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago Evangelista<br>Pº María Agustín 13 · Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;

const ALREADY_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:32px 32px 0">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">Ey {{name}}, ya estás dentro</h1>
      <p style="color:#3a322c;line-height:1.6">Vemos que has vuelto a intentar suscribirte. Y nos hace ilusión, en serio. <strong>Pero ya formas parte del club EvangelCake.</strong></p>
      <p style="color:#3a322c;line-height:1.6">Sabemos que probablemente querías otro 5%. Lo entendemos. Pero el universo aún no nos deja repartir códigos infinitos…</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:24px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Tu código sigue activo</p>
        <p style="font-family:Georgia,serif;font-size:42px;color:#e85a9a;margin:0;letter-spacing:.15em"><strong>{{code}}</strong></p>
        <p style="font-size:12px;color:#3a322c;margin:10px 0 0">Úsalo cuando hagas tu primer pedido</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="text-align:center;margin:24px 0">
        <a href="{{configurator_url}}" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Pedir mi tarta →</a>
      </p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago Evangelista<br>Pº María Agustín 13 · Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;

const TOP_RANK_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:40px 32px 0;text-align:center">
      <div style="font-size:64px;line-height:1;margin-bottom:12px">{{trophy}}</div>
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">¡{{name}}, estás en el TOP {{position}}!</h1>
      <p style="color:#3a322c;line-height:1.6">Acabas de meter {{score}} puntos y eso te coloca en <strong>{{medal}}</strong> del ranking de {{month}}.</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:20px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Si te mantienes hasta fin de mes</p>
        <p style="font-family:Georgia,serif;font-size:24px;color:#e85a9a;margin:0;line-height:1.2"><strong>Te llevas una tarta personalizada gratis</strong></p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="text-align:center;margin:24px 0">
        <a href="{{site_url}}/" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Defender mi puesto →</a>
      </p>
      <p style="color:#3a322c;font-size:13px;text-align:center;margin:0">Otros jugadores intentarán superarte. Avísanos cuando quieras venir a recoger tu tarta.</p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago · EvangelCake Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;

const DETHRONED_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:40px 32px 0;text-align:center">
      <div style="font-size:54px;line-height:1;margin-bottom:12px">⚔️</div>
      <h1 style="font-family:Georgia,serif;font-size:26px;color:#1a1614;margin:0 0 8px">Ey {{old_king}}, te han destronado</h1>
      <p style="color:#3a322c;line-height:1.6"><strong>{{new_king}}</strong> acaba de subirse al #1 con <strong>{{new_score}} puntos</strong> (te saca {{diff}}). Tu récord se queda en {{your_score}}.</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:rgba(232,90,154,.08);border:1px solid rgba(232,90,154,.20);border-radius:14px;padding:18px;text-align:center">
        <p style="margin:0;color:#3a322c;font-size:14px;line-height:1.55">Aún queda mes. Si recuperas el primer puesto antes del último día, la tarta personalizada gratis es tuya.</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 28px">
      <p style="text-align:center;margin:24px 0">
        <a href="{{site_url}}/" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Recuperar el #1 →</a>
      </p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago · EvangelCake Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;

const MONTH_WINNER_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:48px 32px 0;text-align:center">
      <div style="font-size:72px;line-height:1;margin-bottom:8px">{{trophy}}</div>
      <h1 style="font-family:Georgia,serif;font-size:32px;color:#1a1614;margin:0 0 8px">¡{{name}}, HAS GANADO!</h1>
      <p style="color:#3a322c;line-height:1.55;font-size:16px">Has terminado en <strong>{{medal}} PUESTO</strong> del ranking del juego de <strong>{{month_label}}</strong>, con {{score}} puntos.</p>
      <p style="color:#3a322c;line-height:1.55;font-size:16px">Te has ganado una <strong>tarta personalizada gratis</strong> 🎂</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:24px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Tu código de ganador</p>
        <p style="font-family:Georgia,serif;font-size:38px;color:#e85a9a;margin:0;letter-spacing:.12em"><strong>{{winner_code}}</strong></p>
        <p style="font-size:12px;color:#3a322c;margin:12px 0 0">Enseña este código por WhatsApp o presencial</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="color:#3a322c;line-height:1.6">Escríbenos por WhatsApp para concretar día y diseño de tu tarta. Tienes <strong>30 días</strong> para canjearla.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="{{wa_url}}" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Reclamar mi tarta →</a>
      </p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago · EvangelCake<br>Pº María Agustín 13 · Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;

const LEAD_NOTIFICATION_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#f5f0e8;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px">
    <tr><td>
      <h2 style="margin:0 0 16px;color:#1a1614">Nuevo lead recibido</h2>
      <p><strong>Nombre:</strong> {{name}}</p>
      <p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
      <p><strong>Teléfono:</strong> {{phone}}</p>
      <p><strong>Evento:</strong> {{event_type}}</p>
      <p><strong>Fecha:</strong> {{event_date}}</p>
      <p><strong>Comensales:</strong> {{guests}}</p>
      <p><strong>Mensaje:</strong></p>
      <p style="background:#f5f0e8;padding:12px;border-radius:8px;white-space:pre-wrap">{{message}}</p>
    </td></tr>
  </table>
</body></html>`;

export const TEMPLATE_DEFS: Record<TemplateKey, TemplateDef> = {
  welcome: {
    key: "welcome",
    label: "Bienvenida + código 5%",
    description: "Se envía cuando alguien se suscribe por primera vez (newsletter, popup, footer, juego).",
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
      html: WELCOME_HTML,
      text:
        "Hola {{name}},\n\nGracias por suscribirte a EvangelCake. Tu código de descuento del 5% para tu primera tarta personalizada es: {{code}}\n\nÚsalo al hacer el pedido en WhatsApp o en evangelcake.com.\n\nAndreia & Tiago",
    },
  },
  already_subscribed: {
    key: "already_subscribed",
    label: "Ya estabas suscrita/o",
    description: "Cuando alguien intenta darse de alta con un email que ya está en la lista.",
    vars: ["name", "code", "configurator_url", "site_url"] as const,
    sample: {
      name: "María",
      code: "8768",
      configurator_url: `${SITE_URL}/tartas-personalizadas?code=8768#sabores`,
      site_url: SITE_URL,
    },
    defaults: {
      subject: "Ey {{name}}, ya estabas dentro",
      html: ALREADY_HTML,
      text:
        "¡Hola {{name}}!\n\nGracias por intentar suscribirte... otra vez. Pero ya formas parte del club EvangelCake.\n\nTu código del 5% sigue siendo: {{code}}\n\nSe acepta y nos vemos en el obrador.\n\nAndreia & Tiago",
    },
  },
  top_rank: {
    key: "top_rank",
    label: "Entras al TOP 3 del mes",
    description: "Cuando un jugador guarda un score que lo coloca en posición 1, 2 o 3 del ranking del mes.",
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
      html: TOP_RANK_HTML,
      text:
        "Hola {{name}},\n\nAcabas de meter {{score}} puntos en Dulci's Sweet Challenge y eso te coloca en {{medal}} del ranking de {{month}}.\n\nSi te mantienes hasta fin de mes, te llevas una tarta personalizada gratis.\n\nAndreia & Tiago — EvangelCake Zaragoza",
    },
  },
  dethroned: {
    key: "dethroned",
    label: "Te han destronado del #1",
    description: "Cuando otro jugador supera tu score y te quita el primer puesto.",
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
      html: DETHRONED_HTML,
      text:
        "Hola {{old_king}},\n\n{{new_king}} acaba de subirse al primer puesto del ranking con {{new_score}} puntos (te saca {{diff}}). Tu récord se queda en {{your_score}}.\n\nAún queda mes. Si recuperas el #1 antes del último día, la tarta personalizada gratis es tuya.\n\nAndreia & Tiago — EvangelCake Zaragoza",
    },
  },
  month_winner: {
    key: "month_winner",
    label: "Ganador del mes (cron día 1)",
    description: "Se envía el día 1 de cada mes a los 3 mejores jugadores del mes anterior.",
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
      html: MONTH_WINNER_HTML,
      text:
        "Hola {{name}},\n\nHas terminado en {{medal}} PUESTO del ranking de {{month_label}} con {{score}} puntos. Te has ganado una tarta personalizada gratis.\n\nTu código de ganador: {{winner_code}}\n\nEscríbenos por WhatsApp al 624 131 348 con este código para concretar día y diseño. Tienes 30 días para canjearla.\n\nAndreia & Tiago — EvangelCake Zaragoza",
    },
  },
  lead_notification: {
    key: "lead_notification",
    label: "Notificación interna de lead",
    description: "Email INTERNO a hola@evangelcake.com cuando alguien rellena el formulario de contacto.",
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
      html: LEAD_NOTIFICATION_HTML,
      text:
        "Nuevo lead recibido\n\nNombre: {{name}}\nEmail: {{email}}\nTeléfono: {{phone}}\nEvento: {{event_type}}\nFecha: {{event_date}}\nComensales: {{guests}}\n\nMensaje:\n{{message}}",
    },
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
  label: string;
  description: string | null;
  subject: string;
  html: string;
  text_body: string | null;
  updated_at: string | null;
}

/**
 * Sustitución simple de `{{key}}` por su valor.
 * No procesa lógica (no if/loops), es intencional para mantenerlo simple.
 */
export function substitute(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi, (_m, key) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

/** Lee la plantilla de DB (si existe). Devuelve null si no hay fila. */
export async function loadTemplateRow(key: TemplateKey): Promise<TemplateRow | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("email_templates")
      .select("key, label, description, subject, html, text_body, updated_at")
      .eq("key", key)
      .maybeSingle();
    return (data as TemplateRow) || null;
  } catch (err) {
    console.warn("[emailTemplates] loadTemplateRow fallback:", err);
    return null;
  }
}

/** Devuelve la plantilla con los defaults fusionados si no hay fila en DB. */
export async function getTemplate(key: TemplateKey): Promise<TemplateRow> {
  const def = TEMPLATE_DEFS[key];
  const row = await loadTemplateRow(key);
  if (row) {
    // Aseguramos que label/description estén poblados aunque la fila los tenga vacíos.
    return {
      ...row,
      label: row.label || def.label,
      description: row.description || def.description,
    };
  }
  return {
    key,
    label: def.label,
    description: def.description,
    subject: def.defaults.subject,
    html: def.defaults.html,
    text_body: def.defaults.text,
    updated_at: null,
  };
}

/** Render con sustitución de variables. */
export async function renderTemplate(
  key: TemplateKey,
  vars: Record<string, string | number>,
): Promise<RenderedTemplate> {
  const tpl = await getTemplate(key);
  return {
    subject: substitute(tpl.subject, vars),
    html: substitute(tpl.html, vars),
    text: substitute(tpl.text_body || "", vars),
  };
}

/** Render con datos de ejemplo (para preview en el editor). */
export function renderSample(key: TemplateKey, override?: { subject?: string; html?: string; text?: string }): RenderedTemplate {
  const def = TEMPLATE_DEFS[key];
  const subject = override?.subject ?? def.defaults.subject;
  const html = override?.html ?? def.defaults.html;
  const text = override?.text ?? def.defaults.text;
  return {
    subject: substitute(subject, def.sample),
    html: substitute(html, def.sample),
    text: substitute(text, def.sample),
  };
}
