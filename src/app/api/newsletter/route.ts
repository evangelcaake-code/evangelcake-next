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
  sendRecipePDF,
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

    // Birthday opcional. Esperamos formato ISO 'YYYY-MM-DD' (input type=date).
    let birthday: string | null = null;
    if (body.birthday) {
      const raw = String(body.birthday).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = new Date(raw + "T00:00:00");
        const y = d.getFullYear();
        if (!Number.isNaN(d.getTime()) && y >= 1900 && d.getTime() <= Date.now()) {
          birthday = raw;
        }
      }
    }

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
      .select("id, name, birthday, discount_code")
      .eq("email", email)
      .maybeSingle();

    let code = existing?.discount_code;
    let isNew = false;

    // Si existe pero le faltan datos (típico cuando primero se suscribió al
    // newsletter solo con email, y ahora se registra en el juego con nombre),
    // actualizamos el row para enriquecerlo y evitar dashboards con celdas
    // vacías. NO se crea fila nueva.
    if (existing) {
      const patch: Record<string, unknown> = {};
      if (body.name && (!existing.name || existing.name === "amig@")) {
        patch.name = name;
        patch.source = source;
      }
      // Si nos da cumpleaños y no lo teníamos, lo guardamos.
      if (birthday && !existing.birthday) {
        patch.birthday = birthday;
      }
      if (Object.keys(patch).length > 0) {
        await sb.from("subscribers").update(patch).eq("id", existing.id);
      }
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
        birthday,
        discount_code: code,
        consent_marketing: consent,
      });
      if (insErr) {
        console.error("[newsletter] insert subscriber:", insErr);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    }

    // Lead magnets por source: cuando el form viene del post del bolo de
    // cenoura, el regalo es la receta en PDF (no el código del 5%). Aplica
    // tanto si el subscriber es nuevo como si ya estaba — no asumimos que
    // ya la recibió en una suscripción anterior.
    const isRecipeLead = source === "blog-zanahoria-brasil"
      || source === "blog-zanahoria"
      || source.startsWith("blog-zanahoria");

    // Enviar email: receta del post de zanahoria, o bienvenida con código,
    // o recordatorio para suscriptores existentes.
    try {
      const displayName = name || existing?.name || "amig@";
      if (isRecipeLead) {
        await sendRecipePDF({ to: email, name: displayName });
      } else if (code) {
        if (isNew) {
          await sendWelcomeDiscount({ to: email, name, code });
        } else {
          await sendAlreadySubscribed({ to: email, name: displayName, code });
        }
      }
    } catch (err) {
      console.error("[newsletter] resend send:", err);
      // No fallar la petición por esto — el subscriber ya está guardado.
    }

    const res = NextResponse.json({
      ok: true,
      isNew,
      code,
      message: isRecipeLead
        ? "¡Hecho! Te hemos mandado la receta de mi tía Railda al email."
        : isNew
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
