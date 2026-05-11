/**
 * GET /api/player/lookup?email=foo@bar.com
 * Comprueba si un email ya está registrado como subscriber del juego.
 * Devuelve { found: true, name } o { found: false }.
 * Sirve para que un jugador vuelva desde otro dispositivo sin re-registrarse.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("subscribers")
      .select("name")
      .eq("email", email)
      .maybeSingle();

    if (data?.name) {
      return NextResponse.json({ found: true, name: data.name });
    }
    return NextResponse.json({ found: false });
  } catch (err) {
    console.error("[player/lookup]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
