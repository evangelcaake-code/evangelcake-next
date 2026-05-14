import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import StoriesGenerator from "./StoriesGenerator";

export const metadata: Metadata = {
  title: "Stories · Campaña Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export interface CampaignStory {
  id: string;
  cadena: number;
  story_num: number;
  scheduled_date: string | null;
  title: string | null;
  subtitle: string | null;
  cta: string | null;
  bg: string;
  image: string | null;
  accent_color: string;
}

export default async function StoriesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("campaign_stories")
    .select("id, cadena, story_num, scheduled_date, title, subtitle, cta, bg, image, accent_color")
    .order("cadena")
    .order("story_num");

  const stories = (data ?? []) as CampaignStory[];

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Campaña · Stories</span>
          <h1>Editor de stories</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-2)" }}>
            9 stories (3 cadenas × 3 stories). Edita texto, fondo e imagen y exporta PNG 1080×1920
            listo para Instagram.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin/campana" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver a Campaña
            </Link>
          </p>
        </div>
      </header>

      {error && (
        <div className="admin-card" style={{ background: "#fff3cd", borderLeft: "4px solid #d39e00" }}>
          <div style={{ padding: 20 }}>
            <strong>⚠️ Tabla no encontrada.</strong>
            <p style={{ margin: "8px 0 0", fontSize: 13 }}>
              Ejecuta el SQL de <code>supabase/campaign.sql</code> en Supabase para crear las
              tablas y los 9 stories iniciales.
            </p>
          </div>
        </div>
      )}

      {stories.length > 0 && <StoriesGenerator initialStories={stories} />}
    </div>
  );
}
