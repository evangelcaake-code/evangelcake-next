"use client";

import { useState } from "react";
import type { CampaignReel } from "./page";

interface Props {
  initialReels: CampaignReel[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  recorded: "Grabado",
  published: "Publicado",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "rgba(0,0,0,.06)",
  recorded: "rgba(199,154,74,.18)",
  published: "rgba(10,140,74,.12)",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      weekday: "short",
    });
  } catch {
    return iso;
  }
}

export default function ReelsManager({ initialReels }: Props) {
  const [reels, setReels] = useState(initialReels);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const editing = reels.find((r) => r.id === editingId) || null;

  function exportTxt() {
    const lines: string[] = [];
    for (const r of reels) {
      lines.push(`=== REEL #${r.id} · ${r.title} ===`);
      lines.push(`Fecha: ${fmtDate(r.scheduled_date)} · Tipo: ${r.reel_type} · Estado: ${STATUS_LABEL[r.status] || r.status}`);
      lines.push("");
      lines.push("HOOK (0-3s):");
      lines.push(r.hook || "—");
      lines.push("");
      lines.push("CUERPO (3-15s):");
      lines.push(r.body || "—");
      lines.push("");
      lines.push("CTA (15-20s):");
      lines.push(r.cta || "—");
      if (r.notes) {
        lines.push("");
        lines.push("NOTAS:");
        lines.push(r.notes);
      }
      lines.push("\n\n");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evangelcake-reels.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveReel(patch: Partial<CampaignReel>) {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/campaign-reels/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setReels((rs) => rs.map((r) => (r.id === editing.id ? { ...r, ...patch } : r)));
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Reels ({reels.length})</h2>
          <button
            type="button"
            className="btn"
            style={{ background: "rgba(0,0,0,.06)", padding: "8px 16px", fontSize: 13 }}
            onClick={exportTxt}
          >
            📥 Exportar guiones (.txt)
          </button>
        </header>
        <div
          style={{
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {reels.length === 0 && (
            <p style={{ color: "var(--ink-2)" }}>No hay reels. Ejecuta el SQL primero.</p>
          )}
          {reels.map((r) => (
            <article
              key={r.id}
              className="admin-card"
              style={{ background: "var(--paper-2)", padding: 16, margin: 0 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--ink-2)", textTransform: "uppercase" }}>
                  Reel #{r.id} · {fmtDate(r.scheduled_date)}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: STATUS_COLOR[r.status] || "rgba(0,0,0,.06)",
                  }}
                >
                  {STATUS_LABEL[r.status] || r.status}
                </span>
              </div>
              <h3 style={{ margin: "8px 0 6px", fontSize: 16, fontFamily: "var(--serif)", fontWeight: 500 }}>{r.title}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 12px", lineHeight: 1.4 }}>
                {(r.hook || "Sin hook").slice(0, 90)}…
              </p>
              <button
                type="button"
                onClick={() => setEditingId(r.id)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 13,
                  background: "var(--pink-deep)",
                  color: "#fff",
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Editar guion →
              </button>
            </article>
          ))}
        </div>
      </section>

      {editing && (
        <div
          className="gal-lightbox"
          style={{ background: "rgba(15,12,11,.85)", padding: 24 }}
          onClick={() => setEditingId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              maxWidth: 720,
              width: "100%",
              maxHeight: "calc(100vh - 48px)",
              overflow: "auto",
              padding: 24,
              margin: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--ink-2)", textTransform: "uppercase" }}>
                  Reel #{editing.id} · {fmtDate(editing.scheduled_date)}
                </span>
                <h2 style={{ margin: "4px 0 0", fontFamily: "var(--serif)", fontWeight: 500, fontSize: 24 }}>
                  {editing.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                style={{ background: "rgba(0,0,0,.06)", border: 0, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}
              >
                ✕
              </button>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Hook (0-3s)" value={editing.hook || ""} rows={2} onSave={(v) => saveReel({ hook: v })} />
              <Field label="Cuerpo (3-15s)" value={editing.body || ""} rows={6} onSave={(v) => saveReel({ body: v })} />
              <Field label="CTA (15-20s)" value={editing.cta || ""} rows={2} onSave={(v) => saveReel({ cta: v })} />
              <Field label="Notas de producción" value={editing.notes || ""} rows={3} onSave={(v) => saveReel({ notes: v })} />

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
                  Estado:
                </label>
                <select
                  value={editing.status}
                  onChange={(e) => saveReel({ status: e.target.value })}
                  style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 13 }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="recorded">Grabado</option>
                  <option value="published">Publicado</option>
                </select>
                {saving && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>Guardando…</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  rows,
  onSave,
}: {
  label: string;
  value: string;
  rows: number;
  onSave: (v: string) => void;
}) {
  const [val, setVal] = useState(value);
  const [dirty, setDirty] = useState(false);

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)", marginBottom: 4 }}>
        {label}
      </label>
      <textarea
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setDirty(true);
        }}
        onBlur={() => {
          if (dirty) {
            onSave(val);
            setDirty(false);
          }
        }}
        rows={rows}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,.15)",
          fontFamily: "inherit",
          fontSize: 14,
          lineHeight: 1.45,
          resize: "vertical",
        }}
      />
    </div>
  );
}
