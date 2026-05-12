/**
 * GET  /api/ranking?month=YYYY-MM&limit=10  → top N del mes
 * POST /api/ranking                          → guardar score
 *
 * Si no se da `month`, usa el mes actual.
 * POST: { email, name, score } → guarda solo si supera el bestScore previo.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  sendTopRankNotification,
  sendDethronedNotification,
} from "@/lib/resend";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const month = url.searchParams.get("month") || currentMonth();
    const limit = Math.min(Number(url.searchParams.get("limit") || 10), 50);
    const email = url.searchParams.get("email");

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("scores")
      .select("name, email, score, created_at")
      .eq("month", month)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) throw error;

    let position: number | null = null;
    if (email) {
      const { data: all } = await sb
        .from("scores")
        .select("email, score")
        .eq("month", month)
        .order("score", { ascending: false });
      if (all) {
        const idx = all.findIndex((r) => r.email === email);
        position = idx >= 0 ? idx + 1 : null;
      }
    }

    return NextResponse.json({ ok: true, month, top: data, position });
  } catch (err) {
    console.error("[ranking GET]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const name = String(body.name || "").trim() || "Anónimo";
    const score = Number(body.score);

    if (!email || !Number.isFinite(score) || score < 0 || score > 100000) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const month = currentMonth();
    const sb = getSupabaseAdmin();

    // ANTES de tocar nada: averiguar quién era el #1 actual.
    // Lo necesitamos para detectar destronaciones después del update.
    const { data: prevTopRow } = await sb
      .from("scores")
      .select("name, email, score")
      .eq("month", month)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Buscar score previo del mes
    const { data: prev } = await sb
      .from("scores")
      .select("score")
      .eq("email", email)
      .eq("month", month)
      .maybeSingle();

    let isNewRecord = false;
    if (!prev) {
      const { error } = await sb.from("scores").insert({
        email,
        name,
        score,
        month,
      });
      if (error) throw error;
      isNewRecord = true;
    } else if (score > prev.score) {
      const { error } = await sb
        .from("scores")
        .update({ score, name })
        .eq("email", email)
        .eq("month", month);
      if (error) throw error;
      isNewRecord = true;
    }

    // Devolver top + posición del jugador
    const { data: top } = await sb
      .from("scores")
      .select("name, email, score")
      .eq("month", month)
      .order("score", { ascending: false })
      .limit(10);

    const { data: all } = await sb
      .from("scores")
      .select("email, score")
      .eq("month", month)
      .order("score", { ascending: false });
    const position = all
      ? all.findIndex((r) => r.email === email) + 1 || null
      : null;

    // ===== EMAILS POST-RANKING =====
    // Solo si fue un nuevo récord (insert o mejora real) — así evitamos
    // mandar mails cada vez que alguien juega y no mejora.
    if (isNewRecord && position !== null) {
      // 1) Si el jugador entró al top 3, le mandamos un email de enhorabuena.
      if (position <= 3) {
        try {
          await sendTopRankNotification({
            to: email,
            name,
            position,
            score,
            month,
          });
        } catch (err) {
          console.error("[ranking] top-rank email:", err);
        }
      }

      // 2) Si el jugador desplazó al antiguo #1 (era otra persona), avisamos
      //    a quien acaba de ser destronado.
      if (
        position === 1 &&
        prevTopRow &&
        prevTopRow.email !== email
      ) {
        try {
          await sendDethronedNotification({
            to: prevTopRow.email,
            oldKingName: prevTopRow.name,
            newKingName: name,
            newScore: score,
            yourScore: prevTopRow.score,
          });
        } catch (err) {
          console.error("[ranking] dethroned email:", err);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      month,
      isNewRecord,
      position,
      top,
    });
  } catch (err) {
    console.error("[ranking POST]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
