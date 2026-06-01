/**
 * POST /api/admin/send-test
 * Body: { to: string, subject?: string }
 *
 * Manda un email simple de prueba desde hola@evangelcake.com a la dirección
 * indicada. Útil para verificar que la entrega + el forwarding del buzón
 * funcionan correctamente.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendRawEmail } from "@/lib/resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const to = String(body.to || "").trim().toLowerCase();
  const subject = String(body.subject || "Prueba · EvangelCake").trim();

  if (!EMAIL_REGEX.test(to)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }

  const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background:#fbf3df;color:#1a1614">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf3df;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:14px;padding:32px;box-shadow:0 8px 32px rgba(0,0,0,.06)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e85a9a;font-weight:700">EvangelCake · Test</p>
          <h1 style="font-family:Georgia,serif;font-weight:400;margin:0 0 16px;color:#1a1614">📬 Email de prueba</h1>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3a322c">
            Si estás viendo este email, significa que <strong>hola@evangelcake.com</strong> está enviando correctamente y que su recepción/forwarding en tu Gmail funciona.
          </p>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3a322c">
            <strong>Enviado:</strong> ${now}<br>
            <strong>Destinatario:</strong> ${to}
          </p>
          <p style="margin:24px 0 0;font-size:13px;color:#999">
            Si quieres comprobar la otra dirección (recibir) responde a este email con cualquier cosa.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `EvangelCake · Email de prueba

Si estás viendo este email, hola@evangelcake.com está enviando correctamente.

Enviado: ${now}
Destinatario: ${to}

Responde con cualquier cosa para comprobar la recepción.
`;

  try {
    await sendRawEmail({ to, subject, html, text });
    return NextResponse.json({ ok: true, to, sent_at: new Date().toISOString() });
  } catch (err) {
    console.error("[admin send-test]", err);
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
