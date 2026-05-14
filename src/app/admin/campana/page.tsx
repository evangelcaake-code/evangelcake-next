import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Campaña Mayo 2026 · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface ReelRow {
  id: number;
  title: string;
  scheduled_date: string | null;
  reel_type: string;
  status: string;
}

interface StoryRow {
  id: string;
  cadena: number;
  story_num: number;
  scheduled_date: string | null;
  title: string | null;
}

const CAMPAIGN_START = new Date("2026-05-14T00:00:00");
const CAMPAIGN_END = new Date("2026-06-04T00:00:00");

// Fechas adicionales de la campaña (emails)
const EMAILS: { date: string; title: string; time: string }[] = [
  { date: "2026-05-27", title: "Email #1 · Urgencia 3 días", time: "10:00" },
  { date: "2026-05-31", title: "Email #2 · Última llamada 4h", time: "20:00" },
  { date: "2026-06-01", title: "Email #3 · Anuncio ganadores", time: "10:00" },
];

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function buildCalendar(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

export default async function CampanaDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const [reelsRes, storiesRes] = await Promise.all([
    sb.from("campaign_reels").select("id, title, scheduled_date, reel_type, status").order("id"),
    sb.from("campaign_stories").select("id, cadena, story_num, scheduled_date, title").order("cadena").order("story_num"),
  ]);

  const reels = (reelsRes.data ?? []) as ReelRow[];
  const stories = (storiesRes.data ?? []) as StoryRow[];

  // Si las tablas aún no existen, ambos devuelven error pero seguimos
  const tablesReady = !reelsRes.error && !storiesRes.error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysToStart = daysBetween(today, CAMPAIGN_START);
  const daysToEnd = daysBetween(today, CAMPAIGN_END);

  const calendar = buildCalendar(CAMPAIGN_START, CAMPAIGN_END);

  // Indexar piezas por fecha
  const byDate = new Map<string, { reels: ReelRow[]; stories: StoryRow[]; emails: typeof EMAILS }>();
  for (const day of calendar) {
    const key = day.toISOString().slice(0, 10);
    byDate.set(key, { reels: [], stories: [], emails: [] });
  }
  for (const r of reels) {
    if (r.scheduled_date && byDate.has(r.scheduled_date)) {
      byDate.get(r.scheduled_date)!.reels.push(r);
    }
  }
  for (const s of stories) {
    if (s.scheduled_date && byDate.has(s.scheduled_date)) {
      byDate.get(s.scheduled_date)!.stories.push(s);
    }
  }
  for (const e of EMAILS) {
    if (byDate.has(e.date)) {
      byDate.get(e.date)!.emails.push(e);
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Campaña</span>
          <h1>Lanzamiento Web · Mayo 2026</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-2)" }}>
            14 mayo · 4 junio 2026 — Juego, reels, emails, stories.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver al admin
            </Link>
          </p>
        </div>
      </header>

      {!tablesReady && (
        <div className="admin-card" style={{ background: "#fff3cd", borderLeft: "4px solid #d39e00" }}>
          <div style={{ padding: 20 }}>
            <strong>⚠️ Falta ejecutar el SQL.</strong>
            <p style={{ margin: "8px 0 0", fontSize: 13 }}>
              Las tablas <code>campaign_reels</code> y <code>campaign_stories</code> aún no
              existen en Supabase. Abre el SQL Editor de Supabase y pega el contenido de{" "}
              <code>supabase/campaign.sql</code>. Tras hacerlo, recarga esta página.
            </p>
          </div>
        </div>
      )}

      <section className="admin-kpis">
        <div className="admin-kpi">
          <span className="admin-kpi-num">{daysToStart > 0 ? daysToStart : daysToEnd > 0 ? `${daysToEnd}` : "✓"}</span>
          <span className="admin-kpi-lbl">{daysToStart > 0 ? "Días al inicio" : daysToEnd > 0 ? "Días al final" : "Campaña cerrada"}</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{reels.length}</span>
          <span className="admin-kpi-lbl">Reels</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{EMAILS.length}</span>
          <span className="admin-kpi-lbl">Emails</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{stories.length}</span>
          <span className="admin-kpi-lbl">Stories</span>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Atajos</h2>
        </header>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <Link href="/admin/campana/reels" className="admin-shortcut">
            <span style={{ fontSize: 28 }}>🎬</span>
            <strong>Reels</strong>
            <span>{reels.length} guiones editables</span>
          </Link>
          <Link href="/admin/campana/stories" className="admin-shortcut">
            <span style={{ fontSize: 28 }}>📱</span>
            <strong>Stories</strong>
            <span>{stories.length} plantillas + export PNG</span>
          </Link>
          <Link href="/admin/emails" className="admin-shortcut">
            <span style={{ fontSize: 28 }}>📧</span>
            <strong>Emails</strong>
            <span>Plantillas y broadcasts</span>
          </Link>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Calendario</h2>
          <span className="admin-count">{calendar.length} días</span>
        </header>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {calendar.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const data = byDate.get(key)!;
              const dayN = day.getDate();
              const wd = WEEKDAYS[(day.getDay() + 6) % 7];
              const isToday = day.getTime() === today.getTime();
              const isPast = day < today;
              const empty = data.reels.length === 0 && data.stories.length === 0 && data.emails.length === 0;
              return (
                <div
                  key={key}
                  className="cal-day"
                  style={{
                    background: isToday ? "var(--pink-soft)" : empty ? "var(--paper-2)" : "#fff",
                    border: isToday ? "2px solid var(--pink-deep)" : "1px solid rgba(0,0,0,.08)",
                    borderRadius: 10,
                    padding: 10,
                    minHeight: 110,
                    opacity: isPast && !isToday ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <strong style={{ fontSize: 16, fontFamily: "var(--serif)" }}>{dayN}</strong>
                    <span style={{ fontSize: 10, color: "var(--ink-2)", textTransform: "uppercase" }}>{wd}</span>
                  </div>
                  {data.reels.map((r) => (
                    <div
                      key={`r-${r.id}`}
                      style={{
                        fontSize: 10,
                        padding: "3px 6px",
                        margin: "2px 0",
                        borderRadius: 4,
                        background: r.reel_type === "zanahoria" ? "rgba(199,154,74,.18)" : "rgba(244,184,208,.4)",
                        color: r.reel_type === "zanahoria" ? "var(--gold-deep)" : "var(--pink-deep)",
                      }}
                    >
                      🎬 R#{r.id}
                    </div>
                  ))}
                  {data.emails.map((e, i) => (
                    <div
                      key={`e-${i}`}
                      style={{
                        fontSize: 10,
                        padding: "3px 6px",
                        margin: "2px 0",
                        borderRadius: 4,
                        background: "rgba(232,90,154,.15)",
                        color: "var(--pink-deep)",
                      }}
                    >
                      📧 {e.title.replace("Email #", "E")}
                    </div>
                  ))}
                  {data.stories.length > 0 && (
                    <div
                      style={{
                        fontSize: 10,
                        padding: "3px 6px",
                        margin: "2px 0",
                        borderRadius: 4,
                        background: "rgba(199,154,74,.10)",
                        color: "var(--gold-deep)",
                      }}
                    >
                      📱 {data.stories.length} stories
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: "var(--ink-2)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>🎬 Reel juego</span>
            <span>🥕 Reel zanahoria</span>
            <span>📧 Email</span>
            <span>📱 Stories</span>
          </div>
        </div>
      </section>
    </div>
  );
}
