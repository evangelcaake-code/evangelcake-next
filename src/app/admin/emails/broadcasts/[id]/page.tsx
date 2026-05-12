import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import BroadcastActions from "./BroadcastActions";

export const metadata: Metadata = {
  title: "Campaña · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ "prompt-send"?: string }>;
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Todos",
  subscribed: "Suscritos con consent",
  with_birthday_this_month: "Cumpleañeros este mes",
  with_unused_code: "Con código sin usar",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function BroadcastDetailPage({ params, searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const { "prompt-send": promptSend } = await searchParams;

  const sb = getSupabaseAdmin();
  const { data: b } = await sb.from("broadcasts").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();

  // Para audiencia: contar destinatarios reales.
  let audienceCount: number | null = null;
  try {
    if (b.audience === "all") {
      const { count } = await sb.from("subscribers").select("email", { count: "exact", head: true });
      audienceCount = count ?? 0;
    } else if (b.audience === "subscribed") {
      const { count } = await sb
        .from("subscribers")
        .select("email", { count: "exact", head: true })
        .eq("consent_marketing", true);
      audienceCount = count ?? 0;
    } else {
      // Para los otros casos, contamos en cliente con un select reducido.
      const { data } = await sb.from("subscribers").select("email, birthday, discount_code, discount_used, consent_marketing");
      if (b.audience === "with_birthday_this_month") {
        const m = new Date().getMonth();
        audienceCount = (data ?? []).filter((s) => s.consent_marketing && s.birthday && new Date(s.birthday + "T00:00:00").getMonth() === m).length;
      } else if (b.audience === "with_unused_code") {
        audienceCount = (data ?? []).filter((s) => s.consent_marketing && s.discount_code && !s.discount_used).length;
      }
    }
  } catch {}

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Campaña</span>
          <h1>{b.subject}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin/emails" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver a Emails
            </Link>
          </p>
        </div>
      </header>

      <section className="admin-card">
        <header className="admin-card-head"><h2>Resumen</h2></header>
        <div style={{ padding: "12px 20px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>Estado</p>
            <p style={{ margin: 0, fontWeight: 600 }}>
              <span className={`admin-status admin-status-${b.status === "sent" ? "won" : b.status === "failed" ? "lost" : "new"}`}>{b.status}</span>
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>Audiencia</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{AUDIENCE_LABEL[b.audience] ?? b.audience}</p>
            {audienceCount !== null && b.status === "draft" && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-2)" }}>≈ {audienceCount} destinatarios</p>
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>Creada</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{fmtDate(b.created_at)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>Enviada</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{fmtDate(b.sent_at)}</p>
          </div>
          {b.status === "sent" && (
            <>
              <div>
                <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>Entregados</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{b.sent_count ?? 0} / {b.recipients_count ?? "?"}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>Fallidos</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{b.fail_count ?? 0}</p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head"><h2>Acciones</h2></header>
        <div style={{ padding: "12px 20px 20px" }}>
          <BroadcastActions
            id={b.id}
            status={b.status}
            audienceCount={audienceCount}
            autoPrompt={promptSend === "1"}
          />
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head"><h2>Preview del email</h2></header>
        <div style={{ padding: "12px 20px 20px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Subject</p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{b.subject}</p>
          <p style={{ margin: "16px 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Body</p>
          <iframe
            srcDoc={b.html}
            sandbox=""
            style={{ width: "100%", height: 700, border: "1px solid rgba(0,0,0,.1)", borderRadius: 10, background: "#fff" }}
            title="Preview"
          />
        </div>
      </section>
    </div>
  );
}
