import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import InstagramManager from "./InstagramManager";

export const metadata: Metadata = {
  title: "Instagram · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface InstagramPost {
  id: string;
  image_url: string;
  post_url: string | null;
  caption: string | null;
  position: number;
  published: boolean;
  created_at: string;
}

export default async function InstagramAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("instagram_posts")
    .select("id, image_url, post_url, caption, position, published, created_at")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as InstagramPost[];

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Galería Instagram</span>
          <h1>Posts de Instagram</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-2)" }}>
            Gestiona qué posts aparecen en la home en la sección "Síguenos en Instagram".
            Subes la foto, pegas el link al post y se publica.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver al admin
            </Link>
          </p>
        </div>
      </header>

      <InstagramManager initialPosts={posts} />
    </div>
  );
}
