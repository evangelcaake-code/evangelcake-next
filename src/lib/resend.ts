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
 * Email para suscriptor que se intenta dar de alta una segunda vez.
 * En vez de re-enviarle el código (lo confunde), le mandamos un recordatorio
 * con tono divertido reconociendo que ya está en la lista.
 */
export async function sendAlreadySubscribed({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}) {
  const html = alreadySubscribedHTML({ name, code });
  const res = await getResend().emails.send({
    from: FROM,
    to,
    subject: `🍰 Ey ${name}, ya estás dentro (sí, otra vez)`,
    html,
    text: `¡Hola ${name}!\n\nGracias por intentar suscribirte... otra vez 😉 Pero ya formas parte del club EvangelCake.\n\nTu código del 5% sigue siendo: ${code}\n\nSe acepta y nos vemos en el obrador. Andreia & Tiago`,
  });
  if (res.error) {
    console.error("[resend already-subscribed]", res.error);
    throw new Error(
      `Resend rechazó el envío: ${res.error.message || res.error.name || "desconocido"}`,
    );
  }
  return res;
}

/**
 * Notificación cuando un jugador entra en el TOP del mes (1º, 2º o 3º).
 */
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
  const html = topRankHTML({ name, position, score, month });
  const trophy = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";
  const res = await getResend().emails.send({
    from: FROM,
    to,
    subject: `${trophy} ¡${name}, estás en el TOP ${position} del mes!`,
    html,
  });
  if (res.error) {
    console.error("[resend top-rank]", res.error);
    throw new Error(`Resend: ${res.error.message || res.error.name}`);
  }
  return res;
}

/**
 * Notificación cuando alguien te destrona del #1 del mes.
 */
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
  const html = dethronedHTML({ oldKingName, newKingName, newScore, yourScore });
  const res = await getResend().emails.send({
    from: FROM,
    to,
    subject: `⚔️ Te han destronado del #1`,
    html,
  });
  if (res.error) {
    console.error("[resend dethroned]", res.error);
    throw new Error(`Resend: ${res.error.message || res.error.name}`);
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

function alreadySubscribedHTML({ name, code }: { name: string; code: string }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com";
  const configuratorUrl = `${site}/tartas-personalizadas?code=${encodeURIComponent(code)}#sabores`;
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:32px 32px 0">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">Ey ${escapeHtml(name)}, ya estás dentro 🍰</h1>
      <p style="color:#3a322c;line-height:1.6">Vemos que has vuelto a intentar suscribirte. Y nos hace mucha ilusión, en serio. <strong>Pero ya formas parte del club EvangelCake</strong> 😉</p>
      <p style="color:#3a322c;line-height:1.6">Sabemos que probablemente querías otro 5%. Lo entendemos. Nosotros también querríamos otro descuento. Pero el universo aún no nos deja repartir códigos infinitos…</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:24px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Tu código sigue activo</p>
        <p style="font-family:Georgia,serif;font-size:42px;color:#e85a9a;margin:0;letter-spacing:.15em"><strong>${escapeHtml(code)}</strong></p>
        <p style="font-size:12px;color:#3a322c;margin:10px 0 0">Úsalo cuando hagas tu primer pedido</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="text-align:center;margin:24px 0">
        <a href="${configuratorUrl}" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Pedir mi tarta &rarr;</a>
      </p>
      <p style="color:#3a322c;line-height:1.6;font-size:14px;text-align:center">Si lo que buscas es probar tartas, te toca venir al obrador. Te esperamos 💗</p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago Evangelista<br>Pº María Agustín 13 · Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;
}

function topRankHTML({
  name,
  position,
  score,
  month,
}: {
  name: string;
  position: number;
  score: number;
  month: string;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com";
  const trophy = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";
  const medal = position === 1 ? "primera posición" : position === 2 ? "segunda posición" : "tercera posición";
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:40px 32px 0;text-align:center">
      <div style="font-size:64px;line-height:1;margin-bottom:12px">${trophy}</div>
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">¡${escapeHtml(name)}, estás en el TOP ${position}!</h1>
      <p style="color:#3a322c;line-height:1.6">Acabas de meter ${score} puntos y eso te coloca en <strong>${medal}</strong> del ranking de ${month}.</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:linear-gradient(135deg,#fce4ee,#fbf3df);border:2px dashed #e85a9a;border-radius:14px;padding:20px;text-align:center">
        <p style="font-size:12px;letter-spacing:.12em;color:#3a322c;text-transform:uppercase;margin:0 0 6px">Si te mantienes hasta fin de mes</p>
        <p style="font-family:Georgia,serif;font-size:24px;color:#e85a9a;margin:0;line-height:1.2"><strong>Te llevas una tarta personalizada gratis</strong></p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 24px">
      <p style="text-align:center;margin:24px 0">
        <a href="${site}/" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Defender mi puesto &rarr;</a>
      </p>
      <p style="color:#3a322c;font-size:13px;text-align:center;margin:0">Hay un mes entero por delante. Otros jugadores intentarán superarte. Avísanos cuando te apetezca venir a recoger tu tarta 💗</p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago · EvangelCake Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;
}

function dethronedHTML({
  oldKingName,
  newKingName,
  newScore,
  yourScore,
}: {
  oldKingName: string;
  newKingName: string;
  newScore: number;
  yourScore: number;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com";
  const diff = newScore - yourScore;
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:40px 32px 0;text-align:center">
      <div style="font-size:54px;line-height:1;margin-bottom:12px">⚔️</div>
      <h1 style="font-family:Georgia,serif;font-size:26px;color:#1a1614;margin:0 0 8px">Ey ${escapeHtml(oldKingName)}, te han destronado</h1>
      <p style="color:#3a322c;line-height:1.6"><strong>${escapeHtml(newKingName)}</strong> acaba de subirse al #1 con <strong>${newScore} puntos</strong> (te saca ${diff}). Tu récord se queda en ${yourScore}.</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <div style="background:rgba(232,90,154,.08);border:1px solid rgba(232,90,154,.20);border-radius:14px;padding:18px;text-align:center">
        <p style="margin:0;color:#3a322c;font-size:14px;line-height:1.55">Aún queda mes. Si recuperas el primer puesto antes del último día, la tarta personalizada gratis es tuya.</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 32px 28px">
      <p style="text-align:center;margin:24px 0">
        <a href="${site}/" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Recuperar el #1 &rarr;</a>
      </p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago · EvangelCake Zaragoza</p>
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
