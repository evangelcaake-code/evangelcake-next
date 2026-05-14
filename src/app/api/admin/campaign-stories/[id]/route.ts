/**
 * PUT /api/admin/campaign-stories/[id]  → actualizar story
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of ["title", "subtitle", "cta", "bg", "image", "accent_color", "scheduled_date"]) {
    if (key in body) patch[key] = body[key];
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("campaign_stories").update(patch).eq("id", id);
  if (error) {
    console.error("[admin campaign-stories PUT]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
