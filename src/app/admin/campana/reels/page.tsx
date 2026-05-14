import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import ReelsManager from "./ReelsManager";

export const metadata: Metadata = {
  title: "Reels · Campaña Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export interface CampaignReel {
  id: number;
  title: string;
  scheduled_date: string | null;
  reel_type: string;
  hook: string | null;
  body: string | null;
  cta: string | null;
  notes: string | null;
  status: string;
}

export default async function ReelsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("campaign_reels")
    .select("id, title, scheduled_date, reel_type, hook, body, cta, notes, status")
    .order("id");

  const reels = (data ?? []) as CampaignReel[];

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Campaña · Reels</span>
          <h1>9 guiones de Reels</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-2)" }}>
            Hook + cuerpo + CTA + notas de producción para cada reel.
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
              tablas y los 9 reels iniciales.
            </p>
          </div>
        </div>
      )}

      <ReelsManager initialReels={reels} />
    </div>
  );
}
