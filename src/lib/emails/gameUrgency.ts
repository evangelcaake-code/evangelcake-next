/**
 * Email de urgencia: últimas horas para entrar en el ranking del juego.
 *
 * Uso típico: lanzarlo el último día del mes a la lista de suscriptores
 * con consent_marketing = true. Empuja a jugar (o re-jugar) para colarse
 * en el top 3 antes de que cierre el ranking.
 *
 * Parametrizable:
 * - hoursLeft   → "3 horas", "6 horas", "última hora"…
 * - prize       → texto del premio (por defecto "tarta personalizada gratis")
 * - currentTop  → array opcional para mostrar los 3 mejores actuales
 */

export interface GameUrgencyVars {
  name?: string;
  hoursLeft: number;
  prize?: string;
  currentTop?: Array<{ name: string; score: number }>;
  playUrl?: string;
}

export function gameUrgencySubject(vars: GameUrgencyVars): string {
  const h = vars.hoursLeft;
  if (h <= 1) return `🍰 Última hora. Tu tarta gratis te espera.`;
  return `🎂 Estás a solo ${h} horas de tu tarta gratis`;
}

/** Puntos exactos para colarse en el podio (#3 actual + 1) */
function pointsToPodium(currentTop: GameUrgencyVars["currentTop"]): number | null {
  if (!currentTop || currentTop.length < 3) return null;
  return currentTop[2].score + 1;
}

export function gameUrgencyText(vars: GameUrgencyVars): string {
  const name = vars.name || "amig@";
  const prize = vars.prize || "una tarta personalizada gratis";
  const url = vars.playUrl || "https://evangelcake.com/game";
  return `Hola ${name},

Solo quedan ${vars.hoursLeft} horas para que cierre el ranking del juego de este mes.

Los 3 mejores se llevan ${prize}.

¿Vas a quedarte fuera del podio?

Juega aquí: ${url}

Andreia & Tiago — EvangelCake
`;
}

export function gameUrgencyHTML(vars: GameUrgencyVars): string {
  const name = escapeHtml(vars.name || "amig@");
  const hoursLeft = vars.hoursLeft;
  const prize = escapeHtml(vars.prize || "una tarta personalizada gratis");
  const playUrl = vars.playUrl || "https://evangelcake.com/game";

  const isLastHour = hoursLeft <= 1;
  const bigNumber = isLastHour ? "1ª" : String(hoursLeft);
  const bigLabel = isLastHour ? "ÚLTIMA HORA" : "HORAS PARA LA TARTA";
  const needed = pointsToPodium(vars.currentTop);

  const topHtml =
    vars.currentTop && vars.currentTop.length > 0
      ? `
      <table role="presentation" width="100%" style="margin:0 auto 16px;background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:14px;overflow:hidden">
        <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(0,0,0,.06);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#3a322c;font-weight:600;text-align:left">🏆 Quien defiende el podio ahora</td></tr>
        ${vars.currentTop
          .slice(0, 3)
          .map((p, i) => {
            const medal = ["🥇", "🥈", "🥉"][i];
            return `<tr><td style="padding:14px 20px;border-bottom:1px solid rgba(0,0,0,.04);font-size:16px;color:#1a1614">
              <span style="font-size:20px;margin-right:10px;vertical-align:middle">${medal}</span>
              <strong style="vertical-align:middle">${escapeHtml(p.name)}</strong>
              <span style="float:right;color:#e85a9a;font-weight:600;vertical-align:middle">${p.score} pts</span>
            </td></tr>`;
          })
          .join("")}
      </table>
      ${needed ? `<p style="text-align:center;color:#3a322c;font-size:15px;margin:0 0 24px;line-height:1.5">
        Solo te hacen falta <strong style="color:#e85a9a;font-size:18px">${needed} puntos</strong> para colarte en el podio.
      </p>` : ""}
    `
      : "";

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Solo quedan ${hoursLeft} horas</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;color:#1a1614">
  <div style="display:none;max-height:0;overflow:hidden">Solo quedan ${hoursLeft} horas para que cierre el ranking. Los 3 mejores ganan ${prize}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf3df;padding:24px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.08)">

        <!-- Cabecera con el contador grande -->
        <tr><td style="padding:0;background:linear-gradient(135deg,#fce4ee 0%,#fff5e8 100%);text-align:center;border-bottom:2px dashed #e85a9a">
          <div style="padding:36px 24px 28px">
            <p style="margin:0 0 4px;font-family:'Great Vibes',cursive;font-size:24px;color:#e85a9a;transform:rotate(-1deg)">se acaba el mes…</p>
            <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:72px;line-height:1;color:#e85a9a;font-weight:400">${bigNumber}</p>
            <p style="margin:0;font-size:11px;letter-spacing:.18em;color:#3a322c;font-weight:600">${bigLabel}</p>
          </div>
        </td></tr>

        <!-- Cuerpo -->
        <tr><td style="padding:32px 32px 8px">
          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.2;margin:0 0 14px;color:#1a1614">
            ${isLastHour
              ? `Última oportunidad,<br><em style="color:#e85a9a">y la tarta sigue ahí.</em>`
              : `Estás más cerca de tu tarta gratis<br><em style="color:#e85a9a">de lo que crees.</em>`}
          </h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a322c">
            Hola ${name},
          </p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3a322c">
            El ranking del mes en <strong>Dulci&apos;s Sweet Challenge</strong> cierra esta noche.
            Estos son los tres que ahora mismo defienden el podio:
          </p>
        </td></tr>

        <!-- Top 3 si aplica -->
        ${topHtml ? `<tr><td style="padding:8px 32px 0">${topHtml}</td></tr>` : ""}

        <!-- CTA -->
        <tr><td style="padding:8px 32px 32px;text-align:center">
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#3a322c">
            Una buena partida y eres tú quien se lleva ${prize}.
          </p>
          <a href="${playUrl}" style="display:inline-block;background:#e85a9a;color:#fff;padding:18px 44px;border-radius:999px;text-decoration:none;font-weight:600;font-size:17px;letter-spacing:.02em;box-shadow:0 8px 24px rgba(232,90,154,.35)">
            Quiero esa tarta →
          </a>
          <p style="margin:14px 0 0;font-size:13px;color:#3a322c">
            <strong>30 segundos.</strong> No necesitas más.
          </p>
        </td></tr>

        <!-- Footer marca -->
        <tr><td style="padding:24px 32px;background:#fbf3df;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px;line-height:1.5">
          <p style="margin:0 0 6px"><strong>Andreia &amp; Tiago Evangelista</strong></p>
          <p style="margin:0">Pº María Agustín 13 · Zaragoza</p>
          <p style="margin:14px 0 0;font-size:11px;color:#999">
            Recibes este email porque te inscribiste en el ranking del juego o en la newsletter.
            <br><a href="https://evangelcake.com/unsubscribe" style="color:#999">Darme de baja</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}
