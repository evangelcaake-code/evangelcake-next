/**
 * GET /api/identify
 * Si el visitante trae una cookie de suscriptor válida (firmada server-side),
 * le devolvemos su info (nombre + email). El cliente la usa para "recordarle"
 * y evitar enseñarle de nuevo el popup / el form de registro del juego, etc.
 *
 * Funciona aunque haya borrado el localStorage. NO depende de IP, así que
 * no produce falsos positivos en wifis compartidos.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  SUBSCRIBER_COOKIE,
  parseSubscriberCookie,
} from "@/lib/subscriberCookie";

export async function GET(_req: NextRequest) {
  try {
    const jar = await cookies();
    const raw = jar.get(SUBSCRIBER_COOKIE)?.value;
    const email = parseSubscriberCookie(raw);
    if (!email) {
      return NextResponse.json({ found: false });
    }

    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("subscribers")
      .select("name, email")
      .eq("email", email)
      .maybeSingle();

    if (!data) {
      // Cookie válida pero subscriber borrado del dashboard → invalida cookie
      const res = NextResponse.json({ found: false });
      res.cookies.delete(SUBSCRIBER_COOKIE);
      return res;
    }

    return NextResponse.json({
      found: true,
      name: data.name,
      email: data.email,
    });
  } catch (err) {
    console.error("[identify]:", err);
    return NextResponse.json({ found: false });
  }
}
