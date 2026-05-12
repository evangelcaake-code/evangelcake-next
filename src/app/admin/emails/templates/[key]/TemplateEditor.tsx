"use client";

import { useEffect, useMemo, useState } from "react";

interface BlockField {
  key: string;
  label: string;
  type: "input" | "textarea";
  hint?: string;
}

interface Props {
  templateKey: string;
  initial: {
    subject: string;
    blocks: Record<string, string>;
    text_body: string;
  };
  blockFields: BlockField[];
  defaults: Record<string, string>;
}

export default function TemplateEditor({ templateKey, initial, blockFields, defaults }: Props) {
  const [subject, setSubject] = useState(initial.subject);
  const [blocks, setBlocks] = useState<Record<string, string>>(initial.blocks);
  const [textBody, setTextBody] = useState(initial.text_body);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [testMsg, setTestMsg] = useState("");

  function updateBlock(k: string, v: string) {
    setBlocks((prev) => ({ ...prev, [k]: v }));
  }

  function resetBlock(k: string) {
    setBlocks((prev) => ({ ...prev, [k]: defaults[k] || "" }));
  }

  // Re-renderizar preview pidiendo al server con los valores actuales.
  // Lo hacemos con debounce de 350 ms para no hacer fetch en cada tecla.
  const previewBody = useMemo(
    () => JSON.stringify({ subject, blocks, text_body: textBody }),
    [subject, blocks, textBody],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setPreviewing(true);
        const res = await fetch(`/api/admin/email-templates/${templateKey}/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: previewBody,
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPreviewHtml(data.html);
        setPreviewSubject(data.subject);
      } catch {
        // silencio: preview de fallback es la última que se cargó
      } finally {
        setPreviewing(false);
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [previewBody, templateKey]);

  async function onSave() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, blocks, text_body: textBody }),
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

  function onResetAll() {
    if (!confirm("Esto vuelve TODOS los campos a los valores por defecto. ¿Seguro?")) return;
    setBlocks({ ...defaults });
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
        body: JSON.stringify({ to: testTo, subject, blocks, text_body: textBody }),
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,.15)",
    fontSize: 14,
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 20 }}>
      <div className="admin-card" style={{ alignSelf: "start" }}>
        <header className="admin-card-head"><h2>Editar texto</h2></header>
        <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)", marginBottom: 4 }}>
              Asunto del email (Subject)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={inputStyle}
              maxLength={200}
            />
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--ink-2)" }}>
              Lo que ve la gente antes de abrir el email. {subject.length}/200
            </p>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,.08)", margin: 0 }} />

          {blockFields.map((field) => {
            const value = blocks[field.key] ?? defaults[field.key] ?? "";
            const isDirty = value !== (defaults[field.key] ?? "");
            return (
              <div key={field.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
                    {field.label}
                  </label>
                  {isDirty && (
                    <button
                      type="button"
                      onClick={() => resetBlock(field.key)}
                      style={{ background: "none", border: 0, color: "var(--pink-deep)", fontSize: 11, cursor: "pointer", padding: 0 }}
                    >
                      restaurar
                    </button>
                  )}
                </div>
                {field.type === "textarea" ? (
                  <textarea
                    value={value}
                    onChange={(e) => updateBlock(field.key, e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, fontSize: 13, lineHeight: 1.5 }}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateBlock(field.key, e.target.value)}
                    style={inputStyle}
                  />
                )}
                {field.hint && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--ink-2)" }}>{field.hint}</p>
                )}
              </div>
            );
          })}

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,.08)", margin: 0 }} />

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            style={{ background: "none", border: 0, color: "var(--ink-2)", fontSize: 12, cursor: "pointer", padding: 0, textAlign: "left", textDecoration: "underline" }}
          >
            {showAdvanced ? "− Ocultar" : "+ Mostrar"} texto plano (fallback para clientes sin HTML)
          </button>
          {showAdvanced && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)", marginBottom: 4 }}>
                Versión texto plano
              </label>
              <textarea
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                rows={8}
                style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5 }}
              />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--ink-2)" }}>
                Lo ve quien tiene un cliente de email antiguo o con imágenes desactivadas. También sirve para mejorar la puntuación antispam.
              </p>
            </div>
          )}

          {err && <p style={{ color: "#d33", fontSize: 13, margin: 0 }}>{err}</p>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={onSave} disabled={saving} className="btn btn-pink" style={{ padding: "10px 20px", fontSize: 14 }}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button type="button" onClick={onResetAll} className="btn" style={{ padding: "10px 20px", fontSize: 14, background: "rgba(0,0,0,.06)", color: "var(--ink-1)" }}>
              Volver al default
            </button>
            {savedAt && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>✓ Guardado a las {savedAt}</span>}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,.08)", margin: 0 }} />

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)", marginBottom: 4 }}>
              Mandarme un test ahora
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="tu@email.com"
                style={inputStyle}
              />
              <button type="button" onClick={onTestSend} disabled={testStatus === "sending"} className="btn btn-pink" style={{ padding: "10px 20px", fontSize: 14, whiteSpace: "nowrap" }}>
                {testStatus === "sending" ? "Enviando…" : "Enviar"}
              </button>
            </div>
            {testMsg && (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: testStatus === "ok" ? "#0a8c4a" : "#d33" }}>{testMsg}</p>
            )}
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--ink-2)" }}>
              Manda el email con datos de ejemplo a tu inbox. No guarda los cambios.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ alignSelf: "start", position: "sticky", top: 20 }}>
        <header className="admin-card-head">
          <h2>Preview en vivo</h2>
          {previewing && <span style={{ fontSize: 11, color: "var(--ink-2)" }}>actualizando…</span>}
        </header>
        <div style={{ padding: "12px 20px 20px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Asunto</p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{previewSubject || subject}</p>

          <p style={{ margin: "16px 0 4px", fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Cómo lo verán</p>
          <iframe
            srcDoc={previewHtml}
            sandbox=""
            style={{ width: "100%", height: 720, border: "1px solid rgba(0,0,0,.1)", borderRadius: 10, background: "#fff" }}
            title="Preview email"
          />
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--ink-2)" }}>
            Con datos de ejemplo. El botón "darse de baja" se añade automáticamente al final en el envío real.
          </p>
        </div>
      </div>
    </div>
  );
}
