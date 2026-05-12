/**
 * POST /api/admin/codes/mark-used
 * Body: { code: string }
 * Marca un código de descuento como "usado" (cuando un cliente lo aplica al
 * pedir su tarta). Solo accesible desde el panel admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const code = String(body.code || "").trim();
    if (!code) {
      return NextResponse.json({ error: "Falta el código" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("discount_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("code", code)
      .select("code, email, percent, used_at")
      .maybeSingle();

    if (error) {
      console.error("[admin codes mark-used]", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    }

    // También marcar discount_used en subscribers para tener el flag a mano
    await sb
      .from("subscribers")
      .update({ discount_used: true })
      .eq("discount_code", code);

    return NextResponse.json({ ok: true, code: data });
  } catch (err) {
    console.error("[admin codes mark-used]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
