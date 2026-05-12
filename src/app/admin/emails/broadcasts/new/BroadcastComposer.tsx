"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function substitute(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi, (_m, key) => vars[key] ?? "");
}

const STARTER_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:-apple-system,sans-serif;background:#fbf3df;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <tr><td style="padding:32px 32px 0">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1614;margin:0 0 8px">Hola {{name}}</h1>
      <p style="color:#3a322c;line-height:1.6">Aquí va el cuerpo del email. Puedes usar HTML completo.</p>
    </td></tr>
    <tr><td style="padding:24px 32px 32px">
      <p style="text-align:center;margin:0">
        <a href="https://evangelcake.com" style="display:inline-block;background:#e85a9a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">Ver tartas →</a>
      </p>
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;color:#3a322c;font-size:13px">
      <p style="margin:0">Andreia & Tiago · EvangelCake Zaragoza</p>
    </td></tr>
  </table>
</body></html>`;

const AUDIENCES = [
  { value: "subscribed", label: "Suscritos con consent activo (Recomendado RGPD)" },
  { value: "all", label: "Todos los subscribers (incluye sin consent — no RGPD-friendly)" },
  { value: "with_birthday_this_month", label: "Cumpleañeros del mes en curso" },
  { value: "with_unused_code", label: "Con código de descuento sin usar" },
];

export default function BroadcastComposer() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(STARTER_HTML);
  const [textBody, setTextBody] = useState("");
  const [audience, setAudience] = useState("subscribed");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const sample = { name: "María" };
  const previewSubject = useMemo(() => substitute(subject, sample), [subject]);
  const previewHtml = useMemo(() => substitute(html, sample), [html]);

  async function onSaveDraft(thenSend: boolean) {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html, text_body: textBody, audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando");
      if (thenSend) {
        router.push(`/admin/emails/broadcasts/${data.id}?prompt-send=1`);
      } else {
        router.push(`/admin/emails/broadcasts/${data.id}`);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 20 }}>
      <div className="admin-card" style={{ alignSelf: "start" }}>
        <header className="admin-card-head"><h2>Editor</h2></header>
        <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Promo de San Valentín — 10% en tartas de corazón"
              style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 14 }}
              maxLength={200}
            />
          </label>

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
            Audiencia
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 14, background: "#fff" }}
            >
              {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </label>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
                HTML
              </label>
              <span style={{ fontSize: 11, color: "var(--ink-2)" }}>{html.length} chars</span>
            </div>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={20}
              style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
              Texto plano (fallback)
            </label>
            <textarea
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
              rows={6}
              placeholder="Hola {{name}}, te escribimos para…"
              style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5 }}
            />
          </div>

          <div style={{ background: "#fbf3df", padding: "12px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.55 }}>
            <strong>Variable disponible:</strong>{" "}
            <code style={{ background: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{`{{name}}`}</code>
            <p style={{ margin: "8px 0 0", color: "var(--ink-2)", fontSize: 11 }}>
              Se sustituye por el nombre del suscriptor. Si no tenemos su nombre, sale "amig@". El footer de unsubscribe se añade automáticamente.
            </p>
          </div>

          {err && <p style={{ color: "#d33", fontSize: 13, margin: 0 }}>{err}</p>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => onSaveDraft(false)} disabled={saving || !subject || !html} className="btn" style={{ padding: "10px 20px", fontSize: 14, background: "rgba(0,0,0,.06)", color: "var(--ink-1)" }}>
              Guardar borrador
            </button>
            <button type="button" onClick={() => onSaveDraft(true)} disabled={saving || !subject || !html} className="btn btn-pink" style={{ padding: "10px 20px", fontSize: 14 }}>
              {saving ? "Guardando…" : "Guardar y revisar antes de enviar →"}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ alignSelf: "start", position: "sticky", top: 20 }}>
        <header className="admin-card-head"><h2>Preview</h2></header>
        <div style={{ padding: "12px 20px 20px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Subject</p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{previewSubject || <span style={{ color: "#999" }}>(vacío)</span>}</p>

          <p style={{ margin: "16px 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Body</p>
          <iframe
            srcDoc={previewHtml}
            sandbox=""
            style={{ width: "100%", height: 700, border: "1px solid rgba(0,0,0,.1)", borderRadius: 10, background: "#fff" }}
            title="Preview email"
          />
        </div>
      </div>
    </div>
  );
}
