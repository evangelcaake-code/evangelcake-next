import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import LogoutButton from "../LogoutButton";

export const metadata: Metadata = {
  title: "Admin · Analítica",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type EventRow = {
  event_type: string;
  page: string | null;
  email: string | null;
  visitor_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function pct(num: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((num / total) * 100)}%`;
}

export default async function AnalyticsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
  const since7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();

  // Agregados en paralelo
  const [
    totalsRes,
    weekRes,
    topPagesRes,
    recentEventsRes,
    sourceSubsRes,
    sourceLeadsRes,
  ] = await Promise.all([
    sb
      .from("events")
      .select("event_type", { count: "exact" })
      .gte("created_at", since30),
    sb
      .from("events")
      .select("event_type, visitor_id, page, created_at")
      .gte("created_at", since7),
    sb
      .from("events")
      .select("page")
      .eq("event_type", "page_view")
      .gte("created_at", since30),
    sb
      .from("events")
      .select("event_type, page, email, visitor_id, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(60),
    sb.from("subscribers").select("source"),
    sb.from("leads").select("source"),
  ]);

  // Counters de event_type (últimos 30 días)
  const counters: Record<string, number> = {};
  const weekEvents = (weekRes.data ?? []) as Array<{
    event_type: string;
    visitor_id: string | null;
    page: string | null;
    created_at: string;
  }>;
  weekEvents.forEach((e) => {
    counters[e.event_type] = (counters[e.event_type] ?? 0) + 1;
  });

  const uniqueVisitors7d = new Set(
    weekEvents
      .filter((e) => e.event_type === "page_view" && e.visitor_id)
      .map((e) => e.visitor_id as string),
  ).size;

  // Embudos
  const popupShown = counters["popup_shown"] ?? 0;
  const popupDismissed = counters["popup_dismissed"] ?? 0;
  const popupConverted = counters["popup_converted"] ?? 0;
  const newsletterSignups = counters["newsletter_signup"] ?? 0;
  const gameStart = counters["game_start"] ?? 0;
  const gameComplete = counters["game_complete"] ?? 0;
  const leadSubmits = counters["lead_submit"] ?? 0;
  const pageViews7d = counters["page_view"] ?? 0;

  // Top pages (últimos 30 días)
  const pages = ((topPagesRes.data ?? []) as Array<{ page: string | null }>)
    .map((r) => r.page || "/")
    .reduce<Record<string, number>>((acc, p) => {
      acc[p] = (acc[p] ?? 0) + 1;
      return acc;
    }, {});
  const topPages = Object.entries(pages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // Source breakdown
  const subSources = ((sourceSubsRes.data ?? []) as Array<{ source: string | null }>)
    .reduce<Record<string, number>>((acc, r) => {
      const k = r.source || "(sin source)";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
  const leadSources = ((sourceLeadsRes.data ?? []) as Array<{ source: string | null }>)
    .reduce<Record<string, number>>((acc, r) => {
      const k = r.source || "(sin source)";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  const recentEvents = (recentEventsRes.data ?? []) as EventRow[];
  const totalEvents30d = totalsRes.count ?? 0;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Panel interno · Analítica</span>
          <h1>Analítica</h1>
          <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: 13 }}>
            <Link href="/admin">← Volver a Admin</Link>
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="admin-kpis">
        <div className="admin-kpi">
          <span className="admin-kpi-num">{uniqueVisitors7d}</span>
          <span className="admin-kpi-lbl">Visitantes únicos (7d)</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{pageViews7d}</span>
          <span className="admin-kpi-lbl">Page views (7d)</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{totalEvents30d}</span>
          <span className="admin-kpi-lbl">Eventos totales (30d)</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{newsletterSignups}</span>
          <span className="admin-kpi-lbl">Nuevos suscriptores (7d)</span>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Embudo del pop-up (7 días)</h2>
          <span className="admin-count">conversión global: {pct(popupConverted, popupShown)}</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Paso</th>
                <th>Cantidad</th>
                <th>% del paso anterior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pop-up mostrado</td>
                <td><strong>{popupShown}</strong></td>
                <td>—</td>
              </tr>
              <tr>
                <td>Pop-up cerrado</td>
                <td>{popupDismissed}</td>
                <td>{pct(popupDismissed, popupShown)}</td>
              </tr>
              <tr>
                <td>Convertidos (email entregado)</td>
                <td><strong style={{ color: "var(--pink-deep)" }}>{popupConverted}</strong></td>
                <td>{pct(popupConverted, popupShown)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Embudo del juego (7 días)</h2>
          <span className="admin-count">finalización: {pct(gameComplete, gameStart)}</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Paso</th>
                <th>Cantidad</th>
                <th>% del paso anterior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Partidas empezadas</td>
                <td><strong>{gameStart}</strong></td>
                <td>—</td>
              </tr>
              <tr>
                <td>Partidas terminadas</td>
                <td>{gameComplete}</td>
                <td>{pct(gameComplete, gameStart)}</td>
              </tr>
              <tr>
                <td>Abandonos durante partida</td>
                <td style={{ color: "#c0392b" }}>{Math.max(0, gameStart - gameComplete)}</td>
                <td>{pct(Math.max(0, gameStart - gameComplete), gameStart)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-kpis" style={{ marginTop: 0 }}>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{leadSubmits}</span>
          <span className="admin-kpi-lbl">Leads enviados (7d)</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{counters["configurator_open"] ?? 0}</span>
          <span className="admin-kpi-lbl">Aperturas configurador</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{counters["cta_click"] ?? 0}</span>
          <span className="admin-kpi-lbl">Clicks en CTAs</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{counters["cake_modal_open"] ?? 0}</span>
          <span className="admin-kpi-lbl">Modal paso-a-paso abierto</span>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Páginas más vistas (30 días)</h2>
          <span className="admin-count">{topPages.length} páginas</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Página</th>
                <th>Vistas</th>
              </tr>
            </thead>
            <tbody>
              {topPages.length === 0 && (
                <tr>
                  <td colSpan={2} className="admin-empty">
                    Aún no hay page views. Vuelve a entrar en unos días.
                  </td>
                </tr>
              )}
              {topPages.map(([page, count]) => (
                <tr key={page}>
                  <td>
                    <code>{page}</code>
                  </td>
                  <td>
                    <strong>{count}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>De dónde llegan los suscriptores</h2>
          <span className="admin-count">{Object.keys(subSources).length} canales</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Suscriptores</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subSources)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <tr key={source}>
                    <td>
                      <span className={`admin-tag admin-tag-${source}`}>
                        {source}
                      </span>
                    </td>
                    <td><strong>{count}</strong></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>De dónde llegan los leads</h2>
          <span className="admin-count">{Object.keys(leadSources).length} canales</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Leads</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(leadSources)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <tr key={source}>
                    <td>
                      <span className={`admin-tag admin-tag-${source}`}>
                        {source}
                      </span>
                    </td>
                    <td><strong>{count}</strong></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Últimos eventos en bruto</h2>
          <span className="admin-count">{recentEvents.length} eventos</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Página</th>
                <th>Email</th>
                <th>Visitor</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Sin eventos todavía.
                  </td>
                </tr>
              )}
              {recentEvents.map((e, i) => (
                <tr key={`${e.created_at}-${i}`}>
                  <td>{fmtDate(e.created_at)}</td>
                  <td>
                    <span className={`admin-tag admin-tag-${e.event_type}`}>
                      {e.event_type}
                    </span>
                  </td>
                  <td>
                    {e.page ? <code>{e.page}</code> : "—"}
                  </td>
                  <td>{e.email || "—"}</td>
                  <td>
                    {e.visitor_id ? (
                      <code style={{ fontSize: 10 }}>
                        {e.visitor_id.slice(0, 8)}
                      </code>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="admin-msg">
                    {e.meta ? (
                      <code style={{ fontSize: 11 }}>
                        {JSON.stringify(e.meta)}
                      </code>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
