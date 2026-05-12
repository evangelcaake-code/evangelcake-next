/**
 * GET /api/admin/broadcasts/[id] → detalle de una campaña (incluye body)
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("broadcasts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[admin broadcast detail]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, broadcast: data });
}
