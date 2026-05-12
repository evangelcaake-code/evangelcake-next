import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { TEMPLATE_KEYS, TEMPLATE_DEFS } from "@/lib/emailTemplates";

export const metadata: Metadata = {
  title: "Emails · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface BroadcastRow {
  id: string;
  subject: string;
  audience: string;
  status: string;
  sent_count: number | null;
  recipients_count: number | null;
  created_at: string;
  sent_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Todos",
  subscribed: "Suscritos (consent)",
  with_birthday_this_month: "Cumple este mes",
  with_unused_code: "Código sin usar",
};

export default async function EmailsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sb = getSupabaseAdmin();
  const [templatesRes, broadcastsRes] = await Promise.all([
    sb.from("email_templates").select("key, subject, updated_at"),
    sb.from("broadcasts")
      .select("id, subject, audience, status, sent_count, recipients_count, created_at, sent_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const customSubjects = new Map<string, { subject: string; updated_at: string }>();
  for (const row of templatesRes.data ?? []) {
    customSubjects.set(row.key, { subject: row.subject, updated_at: row.updated_at });
  }
  const broadcasts = (broadcastsRes.data ?? []) as BroadcastRow[];

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Email marketing</span>
          <h1>Emails</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver al admin
            </Link>
          </p>
        </div>
      </header>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Plantillas automáticas</h2>
          <span className="admin-count">{TEMPLATE_KEYS.length} plantillas</span>
        </header>
        <p style={{ padding: "0 20px 12px", fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
          Estos emails se mandan solos cuando ocurre el evento correspondiente. Edita el subject y el cuerpo desde aquí. Si una plantilla no se ha editado nunca, usa los textos por defecto del código.
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plantilla</th>
                <th>Cuándo se manda</th>
                <th>Subject actual</th>
                <th>Última edición</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATE_KEYS.map((key) => {
                const def = TEMPLATE_DEFS[key];
                const custom = customSubjects.get(key);
                const subject = custom?.subject ?? def.defaults.subject;
                return (
                  <tr key={key}>
                    <td><strong>{def.label}</strong></td>
                    <td style={{ maxWidth: 320, color: "var(--ink-2)", fontSize: 13 }}>{def.description}</td>
                    <td><code style={{ fontSize: 12 }}>{subject}</code></td>
                    <td>{custom ? fmtDate(custom.updated_at) : <span style={{ color: "var(--ink-2)" }}>— default</span>}</td>
                    <td>
                      <Link href={`/admin/emails/templates/${key}`} className="btn-link" style={{ color: "var(--pink-deep)", fontWeight: 600 }}>
                        Editar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Broadcasts (campañas puntuales)</h2>
          <Link href="/admin/emails/broadcasts/new" className="btn btn-pink" style={{ padding: "8px 16px", fontSize: 13 }}>
            + Nueva campaña
          </Link>
        </header>
        <p style={{ padding: "0 20px 12px", fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
          Email puntual a toda la lista (ej. Día del Padre, promo verano, novedad…). Componer aquí guarda un borrador; el envío se dispara con el botón "Enviar" de la página de detalle.
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Subject</th>
                <th>Audiencia</th>
                <th>Estado</th>
                <th>Enviados</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">Aún no hay campañas.</td></tr>
              )}
              {broadcasts.map((b) => (
                <tr key={b.id}>
                  <td>{fmtDate(b.created_at)}</td>
                  <td style={{ maxWidth: 280 }}>{b.subject}</td>
                  <td>{AUDIENCE_LABEL[b.audience] ?? b.audience}</td>
                  <td>
                    <span className={`admin-status admin-status-${b.status === "sent" ? "won" : b.status === "failed" ? "lost" : "new"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === "sent" || b.status === "sending"
                      ? `${b.sent_count ?? 0} / ${b.recipients_count ?? "?"}`
                      : "—"}
                  </td>
                  <td>
                    <Link href={`/admin/emails/broadcasts/${b.id}`} style={{ color: "var(--pink-deep)", fontWeight: 600 }}>
                      Ver →
                    </Link>
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
