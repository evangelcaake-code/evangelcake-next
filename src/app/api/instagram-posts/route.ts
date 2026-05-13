/**
 * GET /api/instagram-posts
 * Endpoint público: devuelve los posts publicados ordenados por position.
 * Usado por el componente <InstagramFeed /> en la home.
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 60; // ISR: cache de 60s por edge para no martillar la BD

export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("instagram_posts")
      .select("id, image_url, post_url, caption")
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) throw error;
    return NextResponse.json({ ok: true, posts: data ?? [] });
  } catch (err) {
    console.error("[instagram-posts]", err);
    return NextResponse.json({ ok: false, posts: [] }, { status: 500 });
  }
}
