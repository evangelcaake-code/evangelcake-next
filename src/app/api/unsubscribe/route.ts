/**
 * GET  /api/unsubscribe?email=&token=  → página de confirmación + da de baja
 * POST /api/unsubscribe                → one-click (RFC 8058) para que Gmail /
 *                                        Yahoo desuscriban sin abrir el navegador
 *
 * El token es un HMAC-SHA256 del email. Sin token válido devolvemos 400.
 * Marca `consent_marketing=false` en la fila del subscriber (no borra: por si
 * más adelante quiere volver, mantenemos el código de descuento y el histórico).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribeToken";

async function doUnsubscribe(email: string): Promise<{ ok: boolean; alreadyOut: boolean }> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("subscribers")
    .select("id, consent_marketing")
    .eq("email", email)
    .maybeSingle();
  if (!data) return { ok: false, alreadyOut: false };
  if (data.consent_marketing === false) {
    return { ok: true, alreadyOut: true };
  }
  await sb
    .from("subscribers")
    .update({ consent_marketing: false })
    .eq("id", data.id);
  return { ok: true, alreadyOut: false };
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  let email = (url.searchParams.get("email") || "").toLowerCase().trim();
  let token = url.searchParams.get("token") || "";

  // RFC 8058: algunos clientes mandan los parámetros en el body en lugar del query.
  if (!email || !token) {
    try {
      const text = await req.text();
      const params = new URLSearchParams(text);
      email = email || (params.get("email") || "").toLowerCase().trim();
      token = token || params.get("token") || "";
    } catch {}
  }

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  await doUnsubscribe(email);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").toLowerCase().trim();
  const token = url.searchParams.get("token") || "";

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return new NextResponse(htmlPage({ title: "Enlace no válido", body: "Este enlace ya no es válido. Si quieres darte de baja, escríbenos a hola@evangelcake.com." }), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const { alreadyOut } = await doUnsubscribe(email);
  return new NextResponse(
    htmlPage({
      title: alreadyOut ? "Ya estabas dado de baja" : "Te hemos dado de baja",
      body: alreadyOut
        ? `<p><strong>${escapeHtml(email)}</strong> ya no recibía nuestros emails.</p><p>Si fue un error, escríbenos a <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a> y te volvemos a apuntar.</p>`
        : `<p>Hemos dado de baja a <strong>${escapeHtml(email)}</strong> de los emails de EvangelCake.</p><p>Si fue un error o quieres volver, escríbenos a <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>.</p>`,
    }),
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function htmlPage({ title, body }: { title: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(title)} — EvangelCake</title>
<style>
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbf3df;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{background:#fff;border-radius:18px;padding:40px 32px;max-width:480px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.08);text-align:center}
  h1{font-family:Georgia,serif;font-size:26px;color:#1a1614;margin:0 0 16px}
  p{color:#3a322c;line-height:1.6;margin:0 0 12px}
  a{color:#e85a9a}
  .home{display:inline-block;margin-top:20px;background:#e85a9a;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600}
</style>
</head><body>
<main class="card">
  <h1>${escapeHtml(title)}</h1>
  ${body}
  <a class="home" href="/">Volver a EvangelCake</a>
</main>
</body></html>`;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
