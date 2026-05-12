/**
 * GET /api/cron/end-of-month
 * Endpoint que llama Vercel Cron el día 1 de cada mes a las 09:00.
 *
 * Misión: anunciar a los 3 mejores del mes que acaba de cerrar que han
 * ganado una tarta personalizada gratis. Le manda email a cada uno con un
 * winner_code (separado del código del 5%) y también una notificación
 * interna a hola@evangelcake.com con la lista.
 *
 * Es idempotente: si el cron se reintenta el mismo mes (manual o por
 * reintento de Vercel), no manda emails duplicados gracias a la marca
 * winner_notified_at en la tabla scores.
 *
 * Seguridad: Vercel Cron incluye el header `authorization: Bearer <CRON_SECRET>`
 * solo si tienes CRON_SECRET configurado en env. Comprobamos eso.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendMonthWinnerNotification } from "@/lib/resend";

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function previousMonthKey(): { key: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0..11
  // El "mes anterior" es m - 1, salvo en enero que es diciembre del año anterior.
  if (m === 0) {
    return { key: `${y - 1}-12`, label: `diciembre ${y - 1}` };
  }
  const prev = m - 1;
  const mm = String(prev + 1).padStart(2, "0");
  return { key: `${y}-${mm}`, label: `${MONTH_LABELS[prev]} ${y}` };
}

function makeWinnerCode(position: number, month: string): string {
  // Código legible: GANA-<position>-<random4>-<mm><yy>
  const random = Math.floor(1000 + Math.random() * 9000);
  const [y, mm] = month.split("-");
  return `GANA${position}-${random}-${mm}${y.slice(2)}`;
}

export async function GET(req: NextRequest) {
  // Verificar que la llamada viene del cron de Vercel (o de mi mismo con el secret)
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key: monthKey, label: monthLabel } = previousMonthKey();
    const sb = getSupabaseAdmin();

    // Top 3 del mes anterior que aún no han sido notificados como ganadores
    const { data: winners, error } = await sb
      .from("scores")
      .select("id, email, name, score, winner_notified_at")
      .eq("month", monthKey)
      .order("score", { ascending: false })
      .limit(3);

    if (error) {
      console.error("[cron end-of-month] query:", error);
      return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });
    }

    if (!winners || winners.length === 0) {
      return NextResponse.json({
        ok: true,
        month: monthKey,
        message: "No hubo jugadores en el mes anterior",
      });
    }

    const results: Array<{
      position: number;
      email: string;
      name: string;
      score: number;
      sent: boolean;
      winnerCode?: string;
      error?: string;
    }> = [];

    for (let i = 0; i < winners.length; i++) {
      const w = winners[i];
      const position = i + 1;

      // Idempotencia: si ya fue notificado, saltar
      if (w.winner_notified_at) {
        results.push({
          position,
          email: w.email,
          name: w.name,
          score: w.score,
          sent: false,
          error: "ya notificado",
        });
        continue;
      }

      const winnerCode = makeWinnerCode(position, monthKey);

      try {
        // Insertar el código de ganador en discount_codes con 100% para
        // marcarlo como un código "premio" (vs 5% normal).
        await sb.from("discount_codes").insert({
          code: winnerCode,
          percent: 100,
          email: w.email,
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });

        // Mandar email al ganador
        await sendMonthWinnerNotification({
          to: w.email,
          name: w.name,
          position,
          score: w.score,
          monthLabel,
          winnerCode,
        });

        // Marcar el score como notificado
        await sb
          .from("scores")
          .update({ winner_notified_at: new Date().toISOString() })
          .eq("id", w.id);

        results.push({
          position,
          email: w.email,
          name: w.name,
          score: w.score,
          sent: true,
          winnerCode,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "error";
        console.error(`[cron end-of-month] winner #${position}:`, err);
        results.push({
          position,
          email: w.email,
          name: w.name,
          score: w.score,
          sent: false,
          error: msg,
        });
      }
    }

    // Notificación interna a Andreia con el resumen
    try {
      const summaryHtml = `
<!DOCTYPE html>
<html><body style="font-family:sans-serif;background:#f5f0e8;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:24px;border-radius:14px">
  <h2 style="font-family:Georgia,serif;margin:0 0 12px">🏆 Ganadores de ${monthLabel}</h2>
  <p style="color:#3a322c">Estos son los 3 mejores del juego. Ya les hemos mandado email con su código de ganador. Espera a que te escriban por WhatsApp.</p>
  <ol style="line-height:1.8;color:#1a1614">
    ${results
      .map(
        (r) =>
          `<li><strong>${r.name}</strong> · ${r.score} pts · <a href="mailto:${r.email}">${r.email}</a> · código: <code>${r.winnerCode || "—"}</code> · ${r.sent ? "✅ enviado" : `❌ ${r.error}`}</li>`,
      )
      .join("\n    ")}
  </ol>
</div>
</body></html>`;

      // Reutilizo sendLeadNotification con un "lead falso" hack para mandar
      // este resumen al email interno. Mejor: crear sendInternal — para no
      // ensuciar, hago un fetch directo a Resend con la plantilla custom.
      const fromAddr =
        process.env.RESEND_FROM || "EvangelCake <onboarding@resend.dev>";
      const to =
        process.env.LEAD_NOTIFICATION_EMAIL || "hola@evangelcake.com";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddr,
          to,
          subject: `🏆 Ganadores de ${monthLabel} — ${results.filter((r) => r.sent).length}/${results.length} notificados`,
          html: summaryHtml,
        }),
      });
    } catch (err) {
      console.error("[cron end-of-month] internal summary:", err);
    }

    return NextResponse.json({
      ok: true,
      month: monthKey,
      label: monthLabel,
      results,
    });
  } catch (err) {
    console.error("[cron end-of-month]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

