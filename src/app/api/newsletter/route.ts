/**
 * POST /api/newsletter
 * - Body: { email, name, source?, consent }
 * - Crea subscriber en Supabase
 * - Genera código de descuento del 5%
 * - Envía email con Resend
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  sendWelcomeDiscount,
  sendAlreadySubscribed,
  generateDiscountCode,
} from "@/lib/resend";
import {
  SUBSCRIBER_COOKIE,
  SUBSCRIBER_COOKIE_OPTS,
  buildSubscriberCookie,
} from "@/lib/subscriberCookie";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const name = String(body.name || "").trim();
    const source = String(body.source || "newsletter");
    const consent = Boolean(body.consent);

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Hace falta tu nombre (mínimo 2 letras)" },
        { status: 400 },
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Falta el consentimiento" },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // ¿Existe ya?
    const { data: existing } = await sb
      .from("subscribers")
      .select("id, name, discount_code")
      .eq("email", email)
      .maybeSingle();

    let code = existing?.discount_code;
    let isNew = false;

    // Si existe pero le faltan datos (típico cuando primero se suscribió al
    // newsletter solo con email, y ahora se registra en el juego con nombre),
    // actualizamos el row para enriquecerlo y evitar dashboards con celdas
    // vacías. NO se crea fila nueva.
    if (existing && body.name && (!existing.name || existing.name === "amig@")) {
      await sb
        .from("subscribers")
        .update({ name, source })
        .eq("id", existing.id);
    }

    if (!existing) {
      isNew = true;

      // Generamos un código numérico de 4 dígitos único.
      // Con 9000 combinaciones la colisión empieza a ser probable a partir de
      // ~100 suscriptores activos, así que reintentamos hasta 20 veces.
      let attempt = 0;
      while (attempt < 20) {
        code = generateDiscountCode();
        const { error: codeErr } = await sb
          .from("discount_codes")
          .insert({ code, percent: 5, email });
        if (!codeErr) break;
        // 23505 = unique violation en Postgres. Si es otro error, no reintentar.
        if (codeErr.code !== "23505") {
          console.error("[newsletter] insert discount_code:", codeErr);
          return NextResponse.json({ error: "DB error" }, { status: 500 });
        }
        attempt++;
      }
      if (attempt === 20) {
        console.error("[newsletter] no se pudo generar código único tras 20 intentos");
        return NextResponse.json({ error: "Code collision" }, { status: 500 });
      }

      // Insertar subscriber con el código ya validado como único
      const { error: insErr } = await sb.from("subscribers").insert({
        email,
        name,
        source,
        discount_code: code,
        consent_marketing: consent,
      });
      if (insErr) {
        console.error("[newsletter] insert subscriber:", insErr);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    }

    // Enviar email: si es nuevo → bienvenida con código. Si ya estaba →
    // email distinto, divertido, recordándole que ya está suscrito.
    if (code) {
      try {
        if (isNew) {
          await sendWelcomeDiscount({ to: email, name, code });
        } else {
          await sendAlreadySubscribed({
            to: email,
            name: name || existing?.name || "amig@",
            code,
          });
        }
      } catch (err) {
        console.error("[newsletter] resend send:", err);
        // No fallar la petición por esto — el subscriber ya está guardado.
      }
    }

    const res = NextResponse.json({
      ok: true,
      isNew,
      code,
      message: isNew
        ? "¡Bienvenida! Te hemos enviado tu código de descuento."
        : "Ya estabas suscrita. Te hemos mandado un email recordatorio.",
    });
    res.cookies.set(SUBSCRIBER_COOKIE, buildSubscriberCookie(email), SUBSCRIBER_COOKIE_OPTS);
    return res;
  } catch (err) {
    console.error("[newsletter] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
