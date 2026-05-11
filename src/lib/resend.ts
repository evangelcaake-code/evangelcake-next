/**
 * Cliente Resend + helpers para enviar emails.
 * Solo se usa en API routes (server-side).
 */
import { Resend } from "resend";

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

/**
 * Genera un código de descuento de 4 dígitos numéricos (1000-9999).
 * Es la versión "fácil de teclear" — ojo: solo hay 9000 combinaciones,
 * conviene reintentar si hay colisión (lo gestiona el caller).
 */
export function generateDiscountCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Email de bienvenida con código de descuento del 5%.
 * Se envía al darse de alta en newsletter o registrarse en el juego.
 */
export async function sendWelcomeDiscount({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}) {
  const html = welcomeEmailHTML({ name, code });
  const res = await getResend().emails.send({
    from: FROM,
    to,
    subject: `🎂 Bienvenida a EvangelCake — aquí tu código del 5%`,
    html,
    text: `Hola ${name},\n\nGracias por suscribirte a EvangelCake. Tu código de descuento del 5% para tu primera tarta personalizada es: ${code}\n\nÚsalo al hacer el pedido en WhatsApp o en evangelcake.com.\n\nAndreia & Tiago`,
  });
  if (res.error) {
    // Resend devuelve {data: null, error: {...}} cuando rechaza un envío.
    // Lo convertimos en excepción para que el llamador lo registre.
    console.error("[resend welcome]", res.error);
    throw new Error(
      `Resend rechazó el envío: ${res.error.message || res.error.name || "desconocido"}`,
    );
  }
  return res;
}

/**
 * Notificación interna cuando alguien rellena el formulario de contacto.
 */
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
  const html = leadNotificationHTML(lead);
  const res = await getResend().emails.send({
    from: FROM,
    to,
    replyTo: lead.email,
    subject: `📩 Nuevo lead${lead.event_type ? ` · ${lead.event_type}` : ""} — ${lead.name || lead.email}`,
    html,
  });
  if (res.error) {
    console.error("[resend lead]", res.error);
    throw new Error(
      `Resend rechazó el envío: ${res.error.message || res.error.name || "desconocido"}`,
    );
  }
  return res;
}

// ===== Plantillas HTML inline =====
function welcomeEmailHTML({ name, code }: { name: string; code: string }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com";
  // El botón principal lleva al configurador con el código pre-aplicado.
  const configuratorUrl = `${site}/tartas-personalizadas?code=${encodeURIComponent(code)}#sabores`;
  // Fallback WhatsApp por si prefieren contacto directo.
  const waText = `Hola! Tengo el codigo ${code} y quiero pedir una tarta`;
  const waUrl = `https://wa.me/34624131348?text=${encodeURIComponent(waText)}`;
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:32px 32px 0">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">¡Hola, ${escapeHtml(name)}! 🎂</h1>
      <p style="color:#3a322c;line-height:1.6">Gracias por unirte a la familia EvangelCake. Como bienvenida, te dejamos un <strong>5% de descuento</strong> para tu primera tarta personalizada.</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:24px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Tu código</p>
        <p style="font-family:Georgia,serif;font-size:42px;color:#e85a9a;margin:0;letter-spacing:.15em"><strong>${escapeHtml(code)}</strong></p>
        <p style="font-size:12px;color:#3a322c;margin:10px 0 0">Válido durante 90 días</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="color:#3a322c;line-height:1.6">Configura tu tarta personalizada en la web — el código se aplicará automáticamente en el carrito:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${configuratorUrl}" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Pedir mi tarta &rarr;</a>
      </p>
      <p style="text-align:center;color:#3a322c;font-size:13px;margin:0">¿Prefieres WhatsApp? <a href="${waUrl}" style="color:#e85a9a">Escríbenos directamente</a>.</p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago Evangelista<br>Pº María Agustín 13 · Zaragoza</p>
      <p style="margin:12px 0 0;font-size:11px;color:#999">Si no querías suscribirte, <a href="https://evangelcake.com/" style="color:#999">date de baja aquí</a>.</p>
    </td></tr>
  </table>
</body></html>`;
}

function leadNotificationHTML(lead: {
  name?: string;
  email: string;
  phone?: string;
  event_type?: string;
  event_date?: string;
  guests?: number;
  message?: string;
}) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#f5f0e8;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px">
    <tr><td>
      <h2 style="margin:0 0 16px;color:#1a1614">Nuevo lead recibido</h2>
      <table style="width:100%;border-collapse:collapse">
        ${row("Nombre", lead.name || "—")}
        ${row("Email", `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`)}
        ${row("Teléfono", lead.phone || "—")}
        ${row("Evento", lead.event_type || "—")}
        ${row("Fecha", lead.event_date || "—")}
        ${row("Comensales", lead.guests ? String(lead.guests) : "—")}
        ${row("Mensaje", lead.message ? escapeHtml(lead.message).replace(/\n/g, "<br>") : "—")}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.04em;width:120px">${label}</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1614">${value}</td></tr>`;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}
