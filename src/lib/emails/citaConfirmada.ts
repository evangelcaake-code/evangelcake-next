/**
 * Email al cliente cuando SU CITA QUEDA CONFIRMADA (no al solicitarla).
 * Lo dispara el panel: botón "✓ Confirmar" → PATCH /api/admin/citas/[id].
 * Solo se envía si el cliente dejó email (es opcional en el wizard).
 */
import { Resend } from "resend";

export type CitaEmailData = {
  customer_name: string;
  customer_email: string | null;
  appointment_date: string; // YYYY-MM-DD
  appointment_slot: string; // HH:MM
  duration_min: number;
  premium: boolean;
  type_label: string;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function buildCitaConfirmadaHtml(cita: CitaEmailData): string {
  const humanDate = new Date(cita.appointment_date + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
  return `<!doctype html>
<html><body style="font-family:Georgia,serif;color:#1A1614;background:#FBF3DF;padding:24px;">
  <table style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <tr><td>
      <p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#E85A9A;margin:0 0 12px;">Cita confirmada</p>
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 12px;line-height:1.15;">¡Hola ${escapeHtml(cita.customer_name.split(" ")[0])}!</h1>
      <p style="font-size:15px;line-height:1.55;color:#3A322C;">Tu cita ya está confirmada. Te esperamos:</p>
      <div style="background:#FCE4EE;border-radius:12px;padding:18px 20px;margin:16px 0;">
        <p style="margin:0;font-size:16px;color:#1A1614;"><strong>${escapeHtml(humanDate)}</strong> · <strong>${escapeHtml(cita.appointment_slot)}</strong></p>
        <p style="margin:6px 0 0;font-size:13px;color:#3A322C;">${cita.premium ? "Cata premium" : "Cata"} · ~${cita.duration_min} min · ${escapeHtml(cita.type_label)}</p>
      </div>
      <p style="font-size:14px;line-height:1.55;color:#3A322C;">Te esperamos en el obrador (Pº María Agustín 13, Zaragoza). Vendrás, probarás nuestros bizcochos y rellenos, y diseñaremos tu tarta juntos — sin prisa.</p>
      <p style="font-size:13px;color:#8A7F78;margin-top:20px;">Si al final no puedes venir, avísanos con 24h de antelación para poder ofrecer el hueco a otra persona.</p>
    </td></tr>
  </table>
</body></html>`;
}

/** Envía el email de confirmación. No lanza: devuelve false si algo falla. */
export async function sendCitaConfirmada(cita: CitaEmailData): Promise<boolean> {
  if (!cita.customer_email) return false;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    const humanDate = new Date(cita.appointment_date + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long", day: "numeric", month: "long",
    });
    await resend.emails.send({
      from: "EvangelCake <hola@evangelcake.com>",
      to: cita.customer_email,
      subject: `Cita confirmada — ${humanDate} a las ${cita.appointment_slot} · EvangelCake`,
      html: buildCitaConfirmadaHtml(cita),
    });
    return true;
  } catch (e) {
    console.error("[citas] sendCitaConfirmada failed:", e);
    return false;
  }
}
