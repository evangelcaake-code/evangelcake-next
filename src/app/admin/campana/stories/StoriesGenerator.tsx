"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { CampaignStory } from "./page";

interface Props {
  initialStories: CampaignStory[];
}

// ============================================================
// LAYOUTS — cada uno es un componente independiente
// ============================================================
type LayoutKey = "classic" | "fullphoto" | "polaroid" | "bigtype" | "sticker";

const LAYOUTS: { value: LayoutKey; label: string; description: string }[] = [
  { value: "classic", label: "Clásico", description: "Texto centrado con fondo de color" },
  { value: "fullphoto", label: "Foto a sangre", description: "Tarta a tamaño completo con texto en banda inferior" },
  { value: "polaroid", label: "Polaroid", description: "Foto en marco blanco inclinado tipo polaroid" },
  { value: "bigtype", label: "Tipografía grande", description: "Titular enorme + foto pequeña como acento" },
  { value: "sticker", label: "Sello sobre foto", description: "Foto de fondo + sello rosa rotado con el mensaje" },
];

const BG_OPTIONS: { value: string; label: string; css: string }[] = [
  { value: "cream", label: "Crema", css: "linear-gradient(160deg, #fbf3df 0%, #f5f0e8 100%)" },
  { value: "pink", label: "Rosa glaseado", css: "linear-gradient(160deg, #fce4ee 0%, #f4b8d0 100%)" },
  { value: "gradient", label: "Crema-arena", css: "linear-gradient(160deg, #fbf3df 0%, #cfe6ea 100%)" },
  { value: "peach", label: "Melocotón", css: "linear-gradient(160deg, #fff5e8 0%, #fde7d7 50%, #fce4ee 100%)" },
  { value: "dark", label: "Oscuro vintage", css: "linear-gradient(160deg, #2a1f1a 0%, #1a1614 100%)" },
];

// Imágenes disponibles — combina logo/mascot + curados de la galería
const IMAGE_OPTIONS: { value: string; label: string; src: string }[] = [
  { value: "logo", label: "Logo", src: "/images/logo.png" },
  { value: "mascot", label: "Mascota Dulci", src: "/images/mascot.png" },
];

// Fotos curadas de la galería para usar como background_image
const PHOTO_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Sin foto —" },
  { value: "/images/gallery/boda-rosas.jpg", label: "Boda · chantilly & rosas" },
  { value: "/images/gallery/corazon-eternidad.jpg", label: "Corazón vintage" },
  { value: "/images/gallery/cumple-telma.jpg", label: "Vintage coquette" },
  { value: "/images/gallery/cumple-santorini.jpg", label: "Temática Santorini" },
  { value: "/images/gallery/drip-chocolate-frutas.jpg", label: "Drip chocolate y frutas" },
  { value: "/images/gallery/flamenca.jpg", label: "Temática flamenca" },
  { value: "/images/gallery/cumple-mariposas-lila.jpg", label: "Lila con mariposas" },
  { value: "/images/gallery/cumple-rosa-flor.jpg", label: "Rosa con flor" },
  { value: "/images/gallery/cumple-corazon-lila.jpg", label: "Corazón lila" },
  { value: "/images/gallery/comunion-zalome.jpg", label: "Comunión Zalome" },
  { value: "/images/home/andreia-tarta-frambuesa.jpg", label: "Andreia con tarta" },
];

function getBgCss(bg: string): string {
  return BG_OPTIONS.find((o) => o.value === bg)?.css || BG_OPTIONS[0].css;
}
function isBgDark(bg: string): boolean {
  return bg === "dark";
}
function getImageSrc(image: string | null): string | null {
  if (!image) return null;
  return IMAGE_OPTIONS.find((o) => o.value === image)?.src || null;
}

// ============================================================
// COMPONENT PRINCIPAL
// ============================================================
export default function StoriesGenerator({ initialStories }: Props) {
  const [stories, setStories] = useState(initialStories);
  const [selectedId, setSelectedId] = useState(initialStories[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const selected = stories.find((s) => s.id === selectedId);

  function update(patch: Partial<CampaignStory>) {
    if (!selected) return;
    const updated = { ...selected, ...patch };
    setStories((ss) => ss.map((s) => (s.id === selected.id ? updated : s)));
    debouncedSave(updated);
  }

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
            layout: story.layout,
            background_image: story.background_image,
          }),
        });
      } catch {}
      setSaving(false);
    }, 600);
  }

  async function exportPng(story: CampaignStory) {
    const node = renderStoryToDom(story);
    document.body.appendChild(node);
    try {
      await new Promise((r) => setTimeout(r, 300)); // dar tiempo a las imágenes a cargar
      const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true });
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
          await new Promise((r) => setTimeout(r, 400));
          const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true });
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

  const byCadena = new Map<number, CampaignStory[]>();
  for (const s of stories) {
    if (!byCadena.has(s.cadena)) byCadena.set(s.cadena, []);
    byCadena.get(s.cadena)!.push(s);
  }

  if (!selected) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 360px", gap: 16, marginTop: 16 }}>
      {/* Sidebar templates */}
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
                <span style={{ fontSize: 10, color: "var(--ink-2)" }}>
                  {s.layout && s.layout !== "classic" ? `(${LAYOUTS.find((l) => l.value === s.layout)?.label}) ` : ""}
                  {s.title?.slice(0, 24) || "Sin título"}
                </span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Canvas preview */}
      <main className="admin-card" style={{ alignSelf: "start", padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-2)" }}>
          Preview · {LAYOUTS.find((l) => l.value === selected.layout)?.label || "Clásico"}
        </h3>
        <div
          style={{
            width: 280,
            height: 498,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,.25)",
            position: "relative",
          }}
        >
          <StoryRender story={selected} scale={280 / 1080} />
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
          📥 Descargar PNG 1080×1920
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
      <aside className="admin-card" style={{ alignSelf: "start", padding: 16, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 14px", fontFamily: "var(--serif)", fontSize: 16, fontWeight: 500 }}>
          Editar story {saving && <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 400 }}>(guardando…)</span>}
        </h3>

        <Select
          label="Layout"
          value={selected.layout || "classic"}
          options={LAYOUTS.map((l) => ({ value: l.value, label: l.label }))}
          onChange={(v) => update({ layout: v })}
        />

        <Field label="Título" value={selected.title || ""} onChange={(v) => update({ title: v })} />
        <Field label="Subtítulo" value={selected.subtitle || ""} onChange={(v) => update({ subtitle: v })} />
        <Field label="CTA" value={selected.cta || ""} onChange={(v) => update({ cta: v })} />

        <Select
          label="Fondo de color"
          value={selected.bg}
          options={BG_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => update({ bg: v })}
        />

        <Select
          label="Foto de tarta (background)"
          value={selected.background_image || ""}
          options={PHOTO_OPTIONS}
          onChange={(v) => update({ background_image: v || null })}
        />

        <Select
          label="Imagen pequeña (logo/mascota)"
          value={selected.image || ""}
          options={[{ value: "", label: "— Ninguna —" }, ...IMAGE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
          onChange={(v) => update({ image: v || null })}
        />

        <Field label="Color de acento (CTA, subtítulo)" value={selected.accent_color} onChange={(v) => update({ accent_color: v })} />
      </aside>
    </div>
  );
}

// ============================================================
// PREVIEW (scaled DOM render)
// ============================================================
function StoryRender({ story, scale }: { story: CampaignStory; scale: number }) {
  const props = { story, scale };
  switch (story.layout as LayoutKey) {
    case "fullphoto": return <LayoutFullPhoto {...props} />;
    case "polaroid": return <LayoutPolaroid {...props} />;
    case "bigtype": return <LayoutBigType {...props} />;
    case "sticker": return <LayoutSticker {...props} />;
    case "classic":
    default: return <LayoutClassic {...props} />;
  }
}

const s = (v: number, scale: number) => `${v * scale}px`;

// ====== LAYOUT 1: CLÁSICO ======
function LayoutClassic({ story, scale }: { story: CampaignStory; scale: number }) {
  const dark = isBgDark(story.bg);
  const ink = dark ? "#fff5e8" : "#1a1614";
  return (
    <div style={{
      width: "100%", height: "100%", background: getBgCss(story.bg),
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: `${s(120, scale)} ${s(80, scale)}`, boxSizing: "border-box",
    }}>
      {story.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getImageSrc(story.image) || ""} alt="" style={{ width: "50%", maxHeight: "30%", objectFit: "contain", marginBottom: s(40, scale) }} />
      )}
      {story.title && (
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: s(110, scale), lineHeight: 1.05, margin: 0, color: ink, letterSpacing: "-0.02em" }}>
          {story.title}
        </h2>
      )}
      {story.subtitle && (
        <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: s(54, scale), margin: `${s(20, scale)} 0 0`, color: story.accent_color }}>
          {story.subtitle}
        </p>
      )}
      {story.cta && (
        <div style={{ marginTop: "auto", padding: `${s(28, scale)} ${s(50, scale)}`, background: story.accent_color, color: "#fff", borderRadius: 999, fontSize: s(42, scale), fontWeight: 600, letterSpacing: ".04em", fontFamily: "Inter, sans-serif" }}>
          {story.cta}
        </div>
      )}
    </div>
  );
}

// ====== LAYOUT 2: FOTO A SANGRE ======
function LayoutFullPhoto({ story, scale }: { story: CampaignStory; scale: number }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#1a1614" }}>
      {story.background_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.background_image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {/* Gradient overlay para legibilidad */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.75) 100%)" }} />
      {/* Sello superior */}
      <div style={{
        position: "absolute", top: s(80, scale), left: "50%", transform: "translateX(-50%)",
        padding: `${s(18, scale)} ${s(36, scale)}`, background: "rgba(255,255,255,.92)",
        borderRadius: 999, fontFamily: "Inter, sans-serif", fontSize: s(28, scale), fontWeight: 600,
        letterSpacing: ".12em", textTransform: "uppercase", color: "#1a1614",
      }}>
        EvangelCake
      </div>
      {/* Texto inferior */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `${s(60, scale)} ${s(80, scale)} ${s(120, scale)}`, color: "#fff", textAlign: "center" }}>
        {story.subtitle && (
          <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: s(46, scale), margin: 0, color: story.accent_color }}>
            {story.subtitle}
          </p>
        )}
        {story.title && (
          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: s(120, scale), lineHeight: 1, margin: `${s(12, scale)} 0 ${s(36, scale)}`, color: "#fff", letterSpacing: "-0.02em" }}>
            {story.title}
          </h2>
        )}
        {story.cta && (
          <div style={{ display: "inline-block", padding: `${s(24, scale)} ${s(48, scale)}`, background: story.accent_color, color: "#fff", borderRadius: 999, fontSize: s(40, scale), fontWeight: 600, letterSpacing: ".04em", fontFamily: "Inter, sans-serif" }}>
            {story.cta}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== LAYOUT 3: POLAROID ======
function LayoutPolaroid({ story, scale }: { story: CampaignStory; scale: number }) {
  return (
    <div style={{
      width: "100%", height: "100%", background: getBgCss(story.bg),
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: `${s(100, scale)} ${s(70, scale)}`, boxSizing: "border-box",
    }}>
      {/* Wordmark EvangelCake en script arriba */}
      <div style={{ fontFamily: "Great Vibes, cursive", fontSize: s(110, scale), color: "#c79a4a", margin: 0, lineHeight: 1 }}>
        EvangelCake
      </div>
      {/* Polaroid */}
      <div style={{
        background: "#fff", padding: `${s(28, scale)} ${s(28, scale)} ${s(80, scale)}`,
        boxShadow: `0 ${s(20, scale)} ${s(40, scale)} rgba(0,0,0,.18)`,
        transform: "rotate(-3deg)", margin: `${s(60, scale)} 0`,
        maxWidth: "80%",
      }}>
        {story.background_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.background_image} alt="" style={{ width: "100%", aspectRatio: "1/1.05", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "1/1.05", background: "var(--paper-2)", display: "grid", placeItems: "center", color: "var(--ink-2)", fontSize: s(40, scale) }}>
            Sin foto
          </div>
        )}
      </div>
      {story.title && (
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: s(90, scale), lineHeight: 1.05, margin: 0, color: "#1a1614", letterSpacing: "-0.02em" }}>
          {story.title}
        </h2>
      )}
      {story.subtitle && (
        <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: s(44, scale), margin: `${s(14, scale)} 0 0`, color: story.accent_color }}>
          {story.subtitle}
        </p>
      )}
      {story.cta && (
        <div style={{ marginTop: "auto", padding: `${s(24, scale)} ${s(48, scale)}`, background: story.accent_color, color: "#fff", borderRadius: 999, fontSize: s(38, scale), fontWeight: 600, letterSpacing: ".04em", fontFamily: "Inter, sans-serif" }}>
          {story.cta}
        </div>
      )}
    </div>
  );
}

// ====== LAYOUT 4: BIG TYPE ======
function LayoutBigType({ story, scale }: { story: CampaignStory; scale: number }) {
  const dark = isBgDark(story.bg);
  const ink = dark ? "#fff5e8" : "#1a1614";
  return (
    <div style={{
      width: "100%", height: "100%", background: getBgCss(story.bg),
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: `${s(140, scale)} ${s(80, scale)}`, boxSizing: "border-box",
    }}>
      <div>
        <div style={{ fontSize: s(34, scale), letterSpacing: ".2em", textTransform: "uppercase", color: story.accent_color, fontFamily: "Inter, sans-serif", marginBottom: s(28, scale) }}>
          EvangelCake · Zaragoza
        </div>
        {story.title && (
          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: s(220, scale), lineHeight: 0.95, margin: 0, color: ink, letterSpacing: "-0.03em" }}>
            {story.title}
          </h2>
        )}
        {story.subtitle && (
          <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: s(70, scale), margin: `${s(30, scale)} 0 0`, color: story.accent_color, lineHeight: 1.1 }}>
            {story.subtitle}
          </p>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {story.background_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.background_image} alt="" style={{
            width: s(360, scale), height: s(360, scale), objectFit: "cover",
            borderRadius: "50%", boxShadow: `0 ${s(20, scale)} ${s(40, scale)} rgba(0,0,0,.20)`,
          }} />
        )}
        {story.cta && (
          <div style={{ padding: `${s(28, scale)} ${s(48, scale)}`, background: story.accent_color, color: "#fff", borderRadius: 999, fontSize: s(40, scale), fontWeight: 600, letterSpacing: ".04em", fontFamily: "Inter, sans-serif", alignSelf: "flex-end" }}>
            {story.cta}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== LAYOUT 5: STICKER ======
function LayoutSticker({ story, scale }: { story: CampaignStory; scale: number }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#1a1614" }}>
      {story.background_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.background_image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {!story.background_image && (
        <div style={{ position: "absolute", inset: 0, background: getBgCss(story.bg) }} />
      )}
      {/* Sello redondo grande, rotado */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-8deg)",
        width: s(720, scale), height: s(720, scale), borderRadius: "50%",
        background: story.accent_color, color: "#fff",
        border: `${s(6, scale)} solid #fff`,
        boxShadow: `0 ${s(30, scale)} ${s(60, scale)} rgba(0,0,0,.40), inset 0 0 0 ${s(3, scale)} rgba(255,255,255,.30)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: `${s(60, scale)} ${s(80, scale)}`, boxSizing: "border-box",
      }}>
        {story.subtitle && (
          <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: s(50, scale), margin: 0, opacity: 0.92 }}>
            {story.subtitle}
          </p>
        )}
        {story.title && (
          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: s(140, scale), lineHeight: 1, margin: `${s(14, scale)} 0`, letterSpacing: "-0.02em" }}>
            {story.title}
          </h2>
        )}
        {story.cta && (
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: s(36, scale), fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", marginTop: s(20, scale), opacity: 0.95 }}>
            {story.cta}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Render offscreen a 1080×1920 (DOM real para PNG export)
// Reusa los mismos layouts con scale=1
// ============================================================
function renderStoryToDom(story: CampaignStory): HTMLDivElement {
  const node = document.createElement("div");
  node.style.position = "fixed";
  node.style.top = "-9999px";
  node.style.left = "-9999px";
  node.style.width = "1080px";
  node.style.height = "1920px";
  node.style.fontFamily = "'Fraunces', 'DM Serif Display', serif";

  // Para exportar usamos React-to-DOM serializado mediante un wrapper:
  // Como no podemos invocar React imperativamente fácil, vamos a generar
  // HTML manualmente clonando la lógica del layout correspondiente.
  const html = renderLayoutHtml(story);
  node.innerHTML = html;
  return node;
}

function renderLayoutHtml(story: CampaignStory): string {
  const bgCss = getBgCss(story.bg);
  const accent = story.accent_color || "#c79a4a";
  const dark = isBgDark(story.bg);
  const ink = dark ? "#fff5e8" : "#1a1614";

  const title = story.title || "";
  const subtitle = story.subtitle || "";
  const cta = story.cta || "";
  const bgImage = story.background_image || "";
  const smallImage = getImageSrc(story.image) || "";

  // Reusa el layout (versiones DOM-string equivalentes a los componentes React)
  switch (story.layout as LayoutKey) {
    case "fullphoto":
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1614;font-family:'Fraunces',serif">
          ${bgImage ? `<img src="${bgImage}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" crossorigin="anonymous"/>` : ""}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.75) 100%)"></div>
          <div style="position:absolute;top:80px;left:50%;transform:translateX(-50%);padding:18px 36px;background:rgba(255,255,255,.92);border-radius:999px;font-family:'Inter',sans-serif;font-size:28px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#1a1614">EvangelCake</div>
          <div style="position:absolute;left:0;right:0;bottom:0;padding:60px 80px 120px;color:#fff;text-align:center">
            ${subtitle ? `<p style="font-family:'Fraunces',serif;font-style:italic;font-size:46px;margin:0;color:${accent}">${subtitle}</p>` : ""}
            ${title ? `<h2 style="font-family:'Fraunces',serif;font-weight:500;font-size:120px;line-height:1;margin:12px 0 36px;color:#fff;letter-spacing:-0.02em">${title}</h2>` : ""}
            ${cta ? `<div style="display:inline-block;padding:24px 48px;background:${accent};color:#fff;border-radius:999px;font-size:40px;font-weight:600;letter-spacing:.04em;font-family:'Inter',sans-serif">${cta}</div>` : ""}
          </div>
        </div>`;

    case "polaroid":
      return `
        <div style="width:1080px;height:1920px;background:${bgCss};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 70px;box-sizing:border-box;font-family:'Fraunces',serif">
          <div style="font-family:'Great Vibes',cursive;font-size:110px;color:#c79a4a;line-height:1">EvangelCake</div>
          <div style="background:#fff;padding:28px 28px 80px;box-shadow:0 20px 40px rgba(0,0,0,.18);transform:rotate(-3deg);margin:60px 0;max-width:80%">
            ${bgImage
              ? `<img src="${bgImage}" style="width:100%;aspect-ratio:1/1.05;object-fit:cover;display:block" crossorigin="anonymous"/>`
              : `<div style="width:100%;aspect-ratio:1/1.05;background:#f5f0e8;display:grid;place-items:center;color:#3a322c;font-size:40px">Sin foto</div>`}
          </div>
          ${title ? `<h2 style="font-family:'Fraunces',serif;font-weight:500;font-size:90px;line-height:1.05;margin:0;color:#1a1614;letter-spacing:-0.02em">${title}</h2>` : ""}
          ${subtitle ? `<p style="font-family:'Fraunces',serif;font-style:italic;font-size:44px;margin:14px 0 0;color:${accent}">${subtitle}</p>` : ""}
          ${cta ? `<div style="margin-top:auto;padding:24px 48px;background:${accent};color:#fff;border-radius:999px;font-size:38px;font-weight:600;letter-spacing:.04em;font-family:'Inter',sans-serif">${cta}</div>` : ""}
        </div>`;

    case "bigtype":
      return `
        <div style="width:1080px;height:1920px;background:${bgCss};display:flex;flex-direction:column;justify-content:space-between;padding:140px 80px;box-sizing:border-box;font-family:'Fraunces',serif">
          <div>
            <div style="font-size:34px;letter-spacing:.2em;text-transform:uppercase;color:${accent};font-family:'Inter',sans-serif;margin-bottom:28px">EvangelCake · Zaragoza</div>
            ${title ? `<h2 style="font-family:'Fraunces',serif;font-weight:500;font-size:220px;line-height:.95;margin:0;color:${ink};letter-spacing:-0.03em">${title}</h2>` : ""}
            ${subtitle ? `<p style="font-family:'Fraunces',serif;font-style:italic;font-size:70px;margin:30px 0 0;color:${accent};line-height:1.1">${subtitle}</p>` : ""}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end">
            ${bgImage ? `<img src="${bgImage}" style="width:360px;height:360px;object-fit:cover;border-radius:50%;box-shadow:0 20px 40px rgba(0,0,0,.20)" crossorigin="anonymous"/>` : `<div></div>`}
            ${cta ? `<div style="padding:28px 48px;background:${accent};color:#fff;border-radius:999px;font-size:40px;font-weight:600;letter-spacing:.04em;font-family:'Inter',sans-serif">${cta}</div>` : ""}
          </div>
        </div>`;

    case "sticker":
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1614;font-family:'Fraunces',serif">
          ${bgImage
            ? `<img src="${bgImage}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" crossorigin="anonymous"/>`
            : `<div style="position:absolute;inset:0;background:${bgCss}"></div>`}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-8deg);width:720px;height:720px;border-radius:50%;background:${accent};color:#fff;border:6px solid #fff;box-shadow:0 30px 60px rgba(0,0,0,.40), inset 0 0 0 3px rgba(255,255,255,.30);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 80px;box-sizing:border-box">
            ${subtitle ? `<p style="font-family:'Fraunces',serif;font-style:italic;font-size:50px;margin:0;opacity:.92">${subtitle}</p>` : ""}
            ${title ? `<h2 style="font-family:'Fraunces',serif;font-weight:500;font-size:140px;line-height:1;margin:14px 0;letter-spacing:-0.02em">${title}</h2>` : ""}
            ${cta ? `<div style="font-family:'Inter',sans-serif;font-size:36px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;margin-top:20px;opacity:.95">${cta}</div>` : ""}
          </div>
        </div>`;

    case "classic":
    default:
      return `
        <div style="width:1080px;height:1920px;background:${bgCss};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 80px;box-sizing:border-box;font-family:'Fraunces',serif">
          ${smallImage ? `<img src="${smallImage}" style="width:50%;max-height:30%;object-fit:contain;margin-bottom:40px" crossorigin="anonymous"/>` : ""}
          ${title ? `<h2 style="font-family:'Fraunces',serif;font-weight:500;font-size:110px;line-height:1.05;margin:0;color:${ink};letter-spacing:-0.02em">${title}</h2>` : ""}
          ${subtitle ? `<p style="font-family:'Fraunces',serif;font-style:italic;font-size:54px;margin:20px 0 0;color:${accent}">${subtitle}</p>` : ""}
          ${cta ? `<div style="margin-top:auto;padding:28px 50px;background:${accent};color:#fff;border-radius:999px;font-size:42px;font-weight:600;letter-spacing:.04em;font-family:'Inter',sans-serif">${cta}</div>` : ""}
        </div>`;
  }
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
