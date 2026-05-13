/**
 * GET  /api/admin/instagram-posts                 → lista todos los posts (publicados o no)
 * POST /api/admin/instagram-posts                 → crea un post nuevo
 *   Body: { image_url, post_url?, caption?, position?, published? }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("instagram_posts")
    .select("id, image_url, post_url, caption, position, published, created_at")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin instagram-posts GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, posts: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const image_url = String(body.image_url || "").trim();
  if (!image_url) {
    return NextResponse.json({ error: "Falta image_url" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("instagram_posts")
    .insert({
      image_url,
      post_url: body.post_url ? String(body.post_url).trim() : null,
      caption: body.caption ? String(body.caption).trim() : null,
      position: typeof body.position === "number" ? body.position : 0,
      published: body.published !== false,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[admin instagram-posts POST]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
