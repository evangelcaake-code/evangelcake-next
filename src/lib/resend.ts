/**
 * Cliente Resend + helpers para enviar emails.
 *
 * Las plantillas (subject + HTML + texto) viven en `email_templates`
 * (Supabase) y se editan desde /admin/emails/templates. Si no hay fila,
 * se usa el default del código (ver src/lib/emailTemplates.ts).
 *
 * Solo se usa en API routes (server-side).
 */
import { Resend } from "resend";
import { buildUnsubscribeUrl } from "@/lib/unsubscribeToken";
import { renderTemplate, type TemplateKey } from "@/lib/emailTemplates";

let _resend: Resend | null = null;

function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY no configurada en .env.local");
  }
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.RESEND_FROM || "EvangelCake <onboarding@resend.dev>";
const REPLY_TO = "hola@evangelcake.com";

// Headers que mejoran la entregabilidad y cumplen los requisitos de Gmail /
// Yahoo (2024+) para senders masivos. One-click vía /api/unsubscribe.
function deliverabilityHeaders(toEmail: string) {
  const unsubUrl = buildUnsubscribeUrl(toEmail);
  return {
    "List-Unsubscribe": `<${unsubUrl}>, <mailto:hola@evangelcake.com?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function unsubFooterHtml(toEmail: string) {
  const url = buildUnsubscribeUrl(toEmail);
  return `<div style="max-width:560px;margin:12px auto 0;text-align:center;color:#999;font-size:11px;font-family:-apple-system,sans-serif"><p style="margin:0">Si no quieres recibir más emails, <a href="${url}" style="color:#999">date de baja con un clic</a>.</p></div>`;
}

function unsubFooterText(toEmail: string) {
  return `\n\n—\nSi no quieres recibir más emails: ${buildUnsubscribeUrl(toEmail)}`;
}

/**
 * Genera un código de descuento de 4 dígitos numéricos (1000-9999).
 * Con 9000 combinaciones la colisión empieza a ser probable a partir de
 * ~100 suscriptores activos, por eso el caller reintenta hasta 20 veces.
 */
export function generateDiscountCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

interface SendOpts {
  key: TemplateKey;
  to: string;
  vars: Record<string, string | number>;
  /** true = es un email a un cliente externo → añadimos unsubscribe footer + headers. */
  customer?: boolean;
}

async function sendFromTemplate({ key, to, vars, customer = true }: SendOpts) {
  const rendered = await renderTemplate(key, vars);

  const html = customer ? rendered.html + unsubFooterHtml(to) : rendered.html;
  const text = customer ? (rendered.text + unsubFooterText(to)) : rendered.text;

  const res = await getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    ...(customer ? { headers: deliverabilityHeaders(to) } : {}),
    subject: rendered.subject,
    html,
    text,
  });
  if (res.error) {
    console.error(`[resend ${key}]`, res.error);
    throw new Error(
      `Resend rechazó el envío: ${res.error.message || res.error.name || "desconocido"}`,
    );
  }
  return res;
}

// ===== Helpers públicos (mantengo las firmas para no tocar callers) =====

export async function sendWelcomeDiscount({ to, name, code }: { to: string; name: string; code: string }) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");
  const configuratorUrl = `${site}/tartas-personalizadas?code=${encodeURIComponent(code)}#sabores`;
  const waUrl = `https://wa.me/34624131348?text=${encodeURIComponent(`Hola! Tengo el codigo ${code} y quiero pedir una tarta`)}`;
  return sendFromTemplate({
    key: "welcome",
    to,
    vars: { name, code, configurator_url: configuratorUrl, wa_url: waUrl, site_url: site },
  });
}

export async function sendAlreadySubscribed({ to, name, code }: { to: string; name: string; code: string }) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");
  const configuratorUrl = `${site}/tartas-personalizadas?code=${encodeURIComponent(code)}#sabores`;
  return sendFromTemplate({
    key: "already_subscribed",
    to,
    vars: { name, code, configurator_url: configuratorUrl, site_url: site },
  });
}

export async function sendTopRankNotification({
  to,
  name,
  position,
  score,
  month,
}: {
  to: string;
  name: string;
  position: number;
  score: number;
  month: string;
}) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");
  const trophy = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";
  const medal = position === 1 ? "primera posición" : position === 2 ? "segunda posición" : "tercera posición";
  return sendFromTemplate({
    key: "top_rank",
    to,
    vars: { name, position, score, month, trophy, medal, site_url: site },
  });
}

export async function sendDethronedNotification({
  to,
  oldKingName,
  newKingName,
  newScore,
  yourScore,
}: {
  to: string;
  oldKingName: string;
  newKingName: string;
  newScore: number;
  yourScore: number;
}) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com").replace(/\/$/, "");
  return sendFromTemplate({
    key: "dethroned",
    to,
    vars: {
      old_king: oldKingName,
      new_king: newKingName,
      new_score: newScore,
      your_score: yourScore,
      diff: newScore - yourScore,
      site_url: site,
    },
  });
}

export async function sendMonthWinnerNotification({
  to,
  name,
  position,
  score,
  monthLabel,
  winnerCode,
}: {
  to: string;
  name: string;
  position: number;
  score: number;
  monthLabel: string;
  winnerCode: string;
}) {
  const trophy = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";
  const medal = position === 1 ? "PRIMER" : position === 2 ? "SEGUNDO" : "TERCER";
  const waUrl = `https://wa.me/34624131348?text=${encodeURIComponent(
    `Hola! Soy ${name}, he ganado el ${medal.toLowerCase()} puesto del ranking de ${monthLabel} con código ${winnerCode}. ¿Cuándo puedo pasar a recoger mi tarta?`,
  )}`;
  return sendFromTemplate({
    key: "month_winner",
    to,
    vars: { name, position, score, month_label: monthLabel, winner_code: winnerCode, trophy, medal, wa_url: waUrl },
  });
}

export async function sendLeadNotification(lead: {
  name?: string;
  email: string;
  phone?: string;
  event_type?: string;
  event_date?: string;
  guests?: number;
  message?: string;
}) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL || "hola@evangelcake.com";
  const rendered = await renderTemplate("lead_notification", {
    name: lead.name || "—",
    email: lead.email,
    phone: lead.phone || "—",
    event_type: lead.event_type || "—",
    event_date: lead.event_date || "—",
    guests: lead.guests ? String(lead.guests) : "—",
    message: lead.message || "—",
  });

  const res = await getResend().emails.send({
    from: FROM,
    to,
    replyTo: lead.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
  if (res.error) {
    console.error("[resend lead]", res.error);
    throw new Error(`Resend rechazó el envío: ${res.error.message || res.error.name || "desconocido"}`);
  }
  return res;
}

/**
 * Envío directo de un email arbitrario (subject + HTML) a UN destinatario.
 * Usado por el sistema de broadcasts en /admin/emails/broadcasts.
 */
export async function sendRawEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const res = await getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    headers: deliverabilityHeaders(to),
    subject,
    html: html + unsubFooterHtml(to),
    text: (text || "") + unsubFooterText(to),
  });
  if (res.error) {
    console.error("[resend raw]", res.error);
    throw new Error(`Resend: ${res.error.message || res.error.name || "desconocido"}`);
  }
  return res;
}

/**
 * Envío de "test" desde el editor de plantillas: renderiza con datos de
 * ejemplo y manda a la dirección que el admin indique (típicamente la suya).
 */
export async function sendTestRendered({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const res = await getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    headers: deliverabilityHeaders(to),
    subject: `[TEST] ${subject}`,
    html: html + unsubFooterHtml(to),
    text: text + unsubFooterText(to),
  });
  if (res.error) {
    console.error("[resend test]", res.error);
    throw new Error(`Resend: ${res.error.message || res.error.name || "desconocido"}`);
  }
  return res;
}
