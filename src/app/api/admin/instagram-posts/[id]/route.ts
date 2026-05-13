/**
 * PUT    /api/admin/instagram-posts/[id]  → actualizar campos
 * DELETE /api/admin/instagram-posts/[id]  → borrar post
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

  const patch: Record<string, unknown> = {};
  if ("image_url" in body) patch.image_url = String(body.image_url || "").trim();
  if ("post_url" in body) patch.post_url = body.post_url ? String(body.post_url).trim() : null;
  if ("caption" in body) patch.caption = body.caption ? String(body.caption).trim() : null;
  if ("position" in body && typeof body.position === "number") patch.position = body.position;
  if ("published" in body) patch.published = Boolean(body.published);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("instagram_posts").update(patch).eq("id", id);
  if (error) {
    console.error("[admin instagram-posts PUT]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("instagram_posts").delete().eq("id", id);
  if (error) {
    console.error("[admin instagram-posts DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
