"use client";

import { useMemo, useState } from "react";

interface Props {
  templateKey: string;
  initial: { subject: string; html: string; text_body: string };
  vars: string[];
  sample: Record<string, string | number>;
}

function substitute(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi, (_m, key) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

export default function TemplateEditor({ templateKey, initial, vars, sample }: Props) {
  const [subject, setSubject] = useState(initial.subject);
  const [html, setHtml] = useState(initial.html);
  const [textBody, setTextBody] = useState(initial.text_body);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [testTo, setTestTo] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [testMsg, setTestMsg] = useState("");

  const previewSubject = useMemo(() => substitute(subject, sample), [subject, sample]);
  const previewHtml = useMemo(() => substitute(html, sample), [html, sample]);

  async function onSave() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html, text_body: textBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando");
      setSavedAt(new Date().toLocaleTimeString("es-ES"));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!confirm("Esto vuelve a los textos por defecto del código. ¿Seguro?")) return;
    // Reload defaults from server (without DB row).
    // Simplest path: ask the API for the default by deleting the row.
    // Pero no quiero crear un endpoint DELETE para algo raro. En su lugar
    // simplemente recargo la página y le pido al usuario que sobreescriba.
    // ALTERNATIVA: hacemos un fetch a /api/admin/email-templates/[key]?defaults=1
    // y dejamos el subject/html/text en los campos. Más simple: implementamos eso
    // como un campo en respuesta GET. (Por ahora: alert con instrucciones).
    alert("Para volver al default, ve a Supabase → email_templates → borra la fila con este key. La próxima vez que recargues, verás los defaults del código.");
  }

  async function onTestSend() {
    if (!testTo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setTestStatus("err");
      setTestMsg("Email no válido");
      return;
    }
    setTestStatus("sending");
    setTestMsg("");
    try {
      const res = await fetch(`/api/admin/email-templates/${templateKey}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo, subject, html, text_body: textBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando");
      setTestStatus("ok");
      setTestMsg(`Enviado a ${testTo}`);
    } catch (e: unknown) {
      setTestStatus("err");
      setTestMsg(e instanceof Error ? e.message : "Error");
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
              style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 14 }}
              maxLength={200}
            />
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
              style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5 }}
            />
          </div>

          <div style={{ background: "#fbf3df", padding: "12px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.55 }}>
            <strong>Variables disponibles</strong> (escribe <code>{`{{nombre}}`}</code> para insertarlas):
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {vars.map((v) => (
                <code key={v} style={{ background: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{`{{${v}}}`}</code>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", color: "var(--ink-2)", fontSize: 11 }}>
              El footer con el botón "darse de baja" se añade automáticamente al final de cada email — no lo pongas en la plantilla.
            </p>
          </div>

          {err && <p style={{ color: "#d33", fontSize: 13, margin: 0 }}>{err}</p>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={onSave} disabled={saving} className="btn btn-pink" style={{ padding: "10px 20px", fontSize: 14 }}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" onClick={onReset} className="btn" style={{ padding: "10px 20px", fontSize: 14, background: "rgba(0,0,0,.06)", color: "var(--ink-1)" }}>
              Volver al default
            </button>
            {savedAt && <span style={{ alignSelf: "center", fontSize: 12, color: "var(--ink-2)" }}>✓ Guardado a las {savedAt}</span>}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,.08)", margin: "4px 0" }} />

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
              Mandarme un email de prueba
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="tu@email.com"
                style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 14 }}
              />
              <button type="button" onClick={onTestSend} disabled={testStatus === "sending"} className="btn btn-pink" style={{ padding: "10px 20px", fontSize: 14 }}>
                {testStatus === "sending" ? "Enviando…" : "Enviar test"}
              </button>
            </div>
            {testMsg && (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: testStatus === "ok" ? "#0a8c4a" : "#d33" }}>{testMsg}</p>
            )}
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--ink-2)" }}>
              Manda el email con datos de ejemplo (sin guardar). Útil para ver cómo se ve en Gmail/Outlook antes de guardar.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ alignSelf: "start", position: "sticky", top: 20 }}>
        <header className="admin-card-head"><h2>Preview</h2></header>
        <div style={{ padding: "12px 20px 20px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Subject</p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{previewSubject}</p>

          <p style={{ margin: "16px 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Body</p>
          <iframe
            srcDoc={previewHtml}
            sandbox=""
            style={{ width: "100%", height: 700, border: "1px solid rgba(0,0,0,.1)", borderRadius: 10, background: "#fff" }}
            title="Preview email"
          />
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--ink-2)" }}>
            Preview con datos de ejemplo. El footer de unsubscribe se añade en el envío real, no se muestra aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
