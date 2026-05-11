import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "Admin · EvangelCake",
  robots: { index: false, follow: false },
};

// Datos siempre frescos
export const dynamic = "force-dynamic";

type Subscriber = {
  email: string;
  name: string | null;
  source: string;
  discount_code: string | null;
  discount_used: boolean | null;
  consent_marketing: boolean | null;
  created_at: string;
};

type Lead = {
  email: string;
  name: string | null;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  guests: number | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

type Score = {
  email: string;
  name: string;
  score: number;
  month: string;
  created_at: string;
};

type Discount = {
  code: string;
  percent: number;
  email: string;
  used: boolean | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [subsRes, leadsRes, scoresRes, codesRes, monthCountRes] =
    await Promise.all([
      sb
        .from("subscribers")
        .select(
          "email, name, source, discount_code, discount_used, consent_marketing, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      sb
        .from("leads")
        .select(
          "email, name, phone, event_type, event_date, guests, message, status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      sb
        .from("scores")
        .select("email, name, score, month, created_at")
        .eq("month", monthKey)
        .order("score", { ascending: false })
        .limit(50),
      sb
        .from("discount_codes")
        .select("code, percent, email, used, used_at, expires_at, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      sb
        .from("scores")
        .select("email", { count: "exact", head: true })
        .eq("month", monthKey),
    ]);

  const subscribers = (subsRes.data ?? []) as Subscriber[];
  const leads = (leadsRes.data ?? []) as Lead[];
  const scores = (scoresRes.data ?? []) as Score[];
  const codes = (codesRes.data ?? []) as Discount[];
  const monthPlayers = monthCountRes.count ?? 0;

  const codesUsed = codes.filter((c) => c.used).length;
  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Panel interno</span>
          <h1>Admin</h1>
        </div>
        <LogoutButton />
      </header>

      <section className="admin-kpis">
        <div className="admin-kpi">
          <span className="admin-kpi-num">{subscribers.length}</span>
          <span className="admin-kpi-lbl">Suscriptores</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{leads.length}</span>
          <span className="admin-kpi-lbl">
            Leads · {newLeadsCount} nuevos
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{monthPlayers}</span>
          <span className="admin-kpi-lbl">Jugadores este mes</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">
            {codesUsed}/{codes.length}
          </span>
          <span className="admin-kpi-lbl">Códigos usados</span>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Leads (encargos + contacto)</h2>
          <span className="admin-count">{leads.length} últimos</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tel.</th>
                <th>Evento</th>
                <th>Fecha evento</th>
                <th>Comensales</th>
                <th>Mensaje</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="admin-empty">
                    Aún no hay leads.
                  </td>
                </tr>
              )}
              {leads.map((l, i) => (
                <tr key={`${l.email}-${l.created_at}-${i}`}>
                  <td>{fmtDate(l.created_at)}</td>
                  <td>{l.name || "—"}</td>
                  <td>
                    <a href={`mailto:${l.email}`}>{l.email}</a>
                  </td>
                  <td>
                    {l.phone ? (
                      <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}>
                        {l.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{l.event_type || "—"}</td>
                  <td>{fmtDay(l.event_date)}</td>
                  <td>{l.guests ?? "—"}</td>
                  <td className="admin-msg">{l.message || "—"}</td>
                  <td>
                    <span
                      className={`admin-status admin-status-${l.status || "new"}`}
                    >
                      {l.status || "new"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Suscriptores newsletter</h2>
          <span className="admin-count">{subscribers.length} últimos</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Origen</th>
                <th>Código</th>
                <th>Usado</th>
                <th>Consent</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Aún no hay suscriptores.
                  </td>
                </tr>
              )}
              {subscribers.map((s, i) => (
                <tr key={`${s.email}-${i}`}>
                  <td>{fmtDate(s.created_at)}</td>
                  <td>{s.name || "—"}</td>
                  <td>
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </td>
                  <td>
                    <span className={`admin-tag admin-tag-${s.source}`}>
                      {s.source}
                    </span>
                  </td>
                  <td>
                    {s.discount_code ? (
                      <code>{s.discount_code}</code>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{s.discount_used ? "✓" : "—"}</td>
                  <td>{s.consent_marketing ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Ranking del juego · {monthKey}</h2>
          <span className="admin-count">Top {scores.length}</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Score</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Aún no hay jugadores este mes.
                  </td>
                </tr>
              )}
              {scores.map((s, i) => (
                <tr
                  key={`${s.email}-${s.month}`}
                  className={i < 3 ? "admin-row-podium" : undefined}
                >
                  <td>
                    {i === 0
                      ? "🥇"
                      : i === 1
                        ? "🥈"
                        : i === 2
                          ? "🥉"
                          : i + 1}
                  </td>
                  <td>{s.name}</td>
                  <td>
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </td>
                  <td>
                    <strong>{s.score}</strong>
                  </td>
                  <td>{fmtDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Códigos de descuento</h2>
          <span className="admin-count">
            {codes.length} emitidos · {codesUsed} usados
          </span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>%</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Usado en</th>
                <th>Caduca</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Sin códigos.
                  </td>
                </tr>
              )}
              {codes.map((c) => (
                <tr key={c.code}>
                  <td>
                    <code>{c.code}</code>
                  </td>
                  <td>{c.percent}%</td>
                  <td>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </td>
                  <td>
                    {c.used ? (
                      <span className="admin-status admin-status-won">
                        usado
                      </span>
                    ) : (
                      <span className="admin-status admin-status-new">
                        activo
                      </span>
                    )}
                  </td>
                  <td>{fmtDate(c.used_at)}</td>
                  <td>{fmtDay(c.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
