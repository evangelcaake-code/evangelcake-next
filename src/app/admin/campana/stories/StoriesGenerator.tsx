"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { CampaignStory } from "./page";

interface Props {
  initialStories: CampaignStory[];
}

const BG_OPTIONS: { value: string; label: string; css: string }[] = [
  { value: "cream", label: "Crema", css: "linear-gradient(160deg, #fbf3df 0%, #f5f0e8 100%)" },
  { value: "pink", label: "Rosa glaseado", css: "linear-gradient(160deg, #fce4ee 0%, #f4b8d0 100%)" },
  { value: "gradient", label: "Crema-arena", css: "linear-gradient(160deg, #fbf3df 0%, #cfe6ea 100%)" },
];

const IMAGE_OPTIONS: { value: string; label: string; src: string | null }[] = [
  { value: "", label: "Sin imagen", src: null },
  { value: "logo", label: "Logo", src: "/images/logo.png" },
  { value: "mascot", label: "Mascota", src: "/images/mascot.png" },
];

function getBgCss(bg: string): string {
  return BG_OPTIONS.find((o) => o.value === bg)?.css || BG_OPTIONS[0].css;
}

function getImageSrc(image: string | null): string | null {
  if (!image) return null;
  return IMAGE_OPTIONS.find((o) => o.value === image)?.src || null;
}

export default function StoriesGenerator({ initialStories }: Props) {
  const [stories, setStories] = useState(initialStories);
  const [selectedId, setSelectedId] = useState(initialStories[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selected = stories.find((s) => s.id === selectedId);

  function update(patch: Partial<CampaignStory>) {
    if (!selected) return;
    const updated = { ...selected, ...patch };
    setStories((ss) => ss.map((s) => (s.id === selected.id ? updated : s)));
    debouncedSave(updated);
  }

  // Debounce simple para no martillar la API mientras se escribe
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function debouncedSave(story: CampaignStory) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/admin/campaign-stories/${story.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: story.title,
            subtitle: story.subtitle,
            cta: story.cta,
            bg: story.bg,
            image: story.image,
            accent_color: story.accent_color,
          }),
        });
      } catch {}
      setSaving(false);
    }, 600);
  }

  async function exportPng(story: CampaignStory) {
    // Renderizamos un nodo offscreen a 1080×1920 (tamaño real de IG story)
    const node = renderStoryToDom(story);
    document.body.appendChild(node);
    try {
      const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `story-${story.id}.png`;
      a.click();
    } finally {
      document.body.removeChild(node);
    }
  }

  async function exportAll() {
    setExporting(true);
    try {
      const zip = new JSZip();
      for (const story of stories) {
        const node = renderStoryToDom(story);
        document.body.appendChild(node);
        try {
          const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1 });
          const blob = await (await fetch(dataUrl)).blob();
          zip.file(`story-${story.id}.png`, blob);
        } finally {
          document.body.removeChild(node);
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "evangelcake-stories-campana.zip");
    } finally {
      setExporting(false);
    }
  }

  // Agrupar por cadena
  const byCadena = new Map<number, CampaignStory[]>();
  for (const s of stories) {
    if (!byCadena.has(s.cadena)) byCadena.set(s.cadena, []);
    byCadena.get(s.cadena)!.push(s);
  }

  if (!selected) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", gap: 16, marginTop: 16 }}>
      {/* Sidebar: templates */}
      <aside className="admin-card" style={{ alignSelf: "start", padding: 14 }}>
        <h3 style={{ margin: "0 0 12px", fontFamily: "var(--serif)", fontSize: 16, fontWeight: 500 }}>
          Plantillas
        </h3>
        {Array.from(byCadena.entries()).map(([cadena, group]) => (
          <div key={cadena} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--pink-deep)", margin: "0 0 6px" }}>
              Cadena {cadena}
            </p>
            {group.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  margin: "4px 0",
                  fontSize: 12,
                  border: selectedId === s.id ? "2px solid var(--pink-deep)" : "1px solid rgba(0,0,0,.08)",
                  background: selectedId === s.id ? "var(--pink-soft)" : "#fff",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <strong style={{ fontSize: 12 }}>Story {s.story_num}/3</strong>
                <br />
                <span style={{ fontSize: 10, color: "var(--ink-2)" }}>{s.title?.slice(0, 30) || "Sin título"}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Canvas: preview */}
      <main className="admin-card" style={{ alignSelf: "start", padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-2)" }}>
          Preview (ratio 9:16 — Instagram Story)
        </h3>
        <div
          ref={canvasRef}
          style={{
            width: 270,
            height: 480,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,.25)",
            position: "relative",
          }}
        >
          <StoryRender story={selected} />
        </div>
        <button
          type="button"
          onClick={() => exportPng(selected)}
          style={{
            marginTop: 16,
            padding: "10px 18px",
            background: "var(--pink-deep)",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          📥 Descargar PNG (1080×1920)
        </button>
        <button
          type="button"
          onClick={exportAll}
          disabled={exporting}
          style={{
            marginTop: 8,
            padding: "8px 16px",
            background: "rgba(0,0,0,.06)",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {exporting ? "Exportando..." : "📦 Descargar las 9 (ZIP)"}
        </button>
      </main>

      {/* Panel de edición */}
      <aside className="admin-card" style={{ alignSelf: "start", padding: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontFamily: "var(--serif)", fontSize: 16, fontWeight: 500 }}>
          Editar story {saving && <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 400 }}>(guardando…)</span>}
        </h3>

        <Field label="Título" value={selected.title || ""} onChange={(v) => update({ title: v })} />
        <Field label="Subtítulo" value={selected.subtitle || ""} onChange={(v) => update({ subtitle: v })} />
        <Field label="CTA" value={selected.cta || ""} onChange={(v) => update({ cta: v })} />

        <Select
          label="Fondo"
          value={selected.bg}
          options={BG_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => update({ bg: v })}
        />
        <Select
          label="Imagen"
          value={selected.image || ""}
          options={IMAGE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => update({ image: v || null })}
        />
        <Field label="Color de acento" value={selected.accent_color} onChange={(v) => update({ accent_color: v })} />
      </aside>
    </div>
  );
}

// =====================================================
// Renderizado de la story (versión preview escalada)
// =====================================================
function StoryRender({ story }: { story: CampaignStory }) {
  const imgSrc = getImageSrc(story.image);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: getBgCss(story.bg),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "8% 7%",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt=""
          style={{
            width: "55%",
            maxHeight: "40%",
            objectFit: "contain",
            marginBottom: 14,
          }}
        />
      )}
      {story.title && (
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.05,
            margin: 0,
            color: "var(--ink)",
          }}
        >
          {story.title}
        </h2>
      )}
      {story.subtitle && (
        <p
          style={{
            fontFamily: "var(--serif-2, var(--serif))",
            fontStyle: "italic",
            fontSize: 14,
            margin: "6px 0 0",
            color: story.accent_color,
          }}
        >
          {story.subtitle}
        </p>
      )}
      {story.cta && (
        <div
          style={{
            marginTop: "auto",
            padding: "8px 14px",
            background: story.accent_color,
            color: "#fff",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".04em",
          }}
        >
          {story.cta}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Render offscreen a 1080×1920 para exportar PNG real
// =====================================================
function renderStoryToDom(story: CampaignStory): HTMLDivElement {
  const node = document.createElement("div");
  node.style.position = "fixed";
  node.style.top = "-9999px";
  node.style.left = "-9999px";
  node.style.width = "1080px";
  node.style.height = "1920px";
  node.style.background = getBgCss(story.bg);
  node.style.display = "flex";
  node.style.flexDirection = "column";
  node.style.alignItems = "center";
  node.style.justifyContent = "center";
  node.style.textAlign = "center";
  node.style.padding = "100px 80px";
  node.style.boxSizing = "border-box";
  node.style.fontFamily = "'Fraunces', 'DM Serif Display', serif";

  const imgSrc = getImageSrc(story.image);
  if (imgSrc) {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.style.width = "55%";
    img.style.maxHeight = "40%";
    img.style.objectFit = "contain";
    img.style.marginBottom = "80px";
    img.crossOrigin = "anonymous";
    node.appendChild(img);
  }

  if (story.title) {
    const h2 = document.createElement("div");
    h2.style.fontFamily = "'Fraunces', 'DM Serif Display', serif";
    h2.style.fontWeight = "500";
    h2.style.fontSize = "120px";
    h2.style.lineHeight = "1.05";
    h2.style.color = "#1a1614";
    h2.style.margin = "0";
    h2.textContent = story.title;
    node.appendChild(h2);
  }

  if (story.subtitle) {
    const p = document.createElement("div");
    p.style.fontFamily = "'Fraunces', serif";
    p.style.fontStyle = "italic";
    p.style.fontSize = "56px";
    p.style.margin = "20px 0 0";
    p.style.color = story.accent_color;
    p.textContent = story.subtitle;
    node.appendChild(p);
  }

  if (story.cta) {
    const cta = document.createElement("div");
    cta.style.marginTop = "auto";
    cta.style.padding = "32px 56px";
    cta.style.background = story.accent_color;
    cta.style.color = "#fff";
    cta.style.borderRadius = "999px";
    cta.style.fontSize = "44px";
    cta.style.fontWeight = "600";
    cta.style.letterSpacing = ".04em";
    cta.style.fontFamily = "'Inter', sans-serif";
    cta.textContent = story.cta;
    node.appendChild(cta);
  }

  return node;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)", marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid rgba(0,0,0,.15)", borderRadius: 8, fontFamily: "inherit" }}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)", marginBottom: 4 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid rgba(0,0,0,.15)", borderRadius: 8, background: "#fff" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
