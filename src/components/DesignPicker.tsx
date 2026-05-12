"use client";

import { useState } from "react";
import Image from "next/image";
import { ALL_GALLERY_PHOTOS, CATEGORY_LABELS, type GalleryPhoto } from "@/data/gallery-photos";

export type DesignSelection =
  | { kind: "gallery"; url: string; caption: string }
  | { kind: "upload"; url: string; filename: string }
  | { kind: "describe"; description: string }
  | null;

interface Props {
  value: DesignSelection;
  onChange: (sel: DesignSelection) => void;
}

type Tab = "gallery" | "upload" | "describe";

const CATEGORY_ORDER: GalleryPhoto["category"][] = [
  "boda",
  "comunion",
  "cumple-adulto",
  "tematico",
  "infantil",
  "especial",
];

export default function DesignPicker({ value, onChange }: Props) {
  // Determinamos el tab inicial según la selección actual
  const initialTab: Tab = value?.kind === "describe"
    ? "describe"
    : value?.kind === "upload"
      ? "upload"
      : "gallery";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="design-picker">
      <div className="design-picker-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "gallery"}
          className={`design-picker-tab${tab === "gallery" ? " is-active" : ""}`}
          onClick={() => setTab("gallery")}
        >
          🎨 Elegir de la galería
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upload"}
          className={`design-picker-tab${tab === "upload" ? " is-active" : ""}`}
          onClick={() => setTab("upload")}
        >
          📷 Subir mi foto
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "describe"}
          className={`design-picker-tab${tab === "describe" ? " is-active" : ""}`}
          onClick={() => setTab("describe")}
        >
          ✍️ No lo tengo claro
        </button>
      </div>

      <div className="design-picker-panel">
        {tab === "gallery" && (
          <GalleryTab
            selectedUrl={value?.kind === "gallery" ? value.url : null}
            onPick={(photo) =>
              onChange({ kind: "gallery", url: photo.src, caption: photo.caption })
            }
          />
        )}
        {tab === "upload" && (
          <UploadTab
            currentUrl={value?.kind === "upload" ? value.url : null}
            currentName={value?.kind === "upload" ? value.filename : null}
            onUploaded={(url, filename) => onChange({ kind: "upload", url, filename })}
            onClear={() => onChange(null)}
          />
        )}
        {tab === "describe" && (
          <DescribeTab
            value={value?.kind === "describe" ? value.description : ""}
            onChange={(description) =>
              onChange(description.trim() ? { kind: "describe", description } : null)
            }
          />
        )}
      </div>
    </div>
  );
}

// ===== Tab: Galería =====
function GalleryTab({
  selectedUrl,
  onPick,
}: {
  selectedUrl: string | null;
  onPick: (p: GalleryPhoto) => void;
}) {
  return (
    <div>
      <p className="design-picker-hint">
        Pulsa una foto para usarla como referencia. Se enviará junto a tu pedido.
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const photos = ALL_GALLERY_PHOTOS.filter((p) => p.category === cat);
        if (photos.length === 0) return null;
        return (
          <div key={cat} className="design-picker-cat">
            <h4>{CATEGORY_LABELS[cat]}</h4>
            <div className="design-picker-grid">
              {photos.map((p) => {
                const selected = selectedUrl === p.src;
                return (
                  <button
                    key={p.src}
                    type="button"
                    className={`design-picker-thumb${selected ? " is-selected" : ""}`}
                    onClick={() => onPick(p)}
                    aria-label={`Seleccionar ${p.caption}`}
                    aria-pressed={selected}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={200}
                      height={200}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {selected && (
                      <span className="design-picker-check" aria-hidden="true">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== Tab: Subir foto =====
function UploadTab({
  currentUrl,
  currentName,
  onUploaded,
  onClear,
}: {
  currentUrl: string | null;
  currentName: string | null;
  onUploaded: (url: string, filename: string) => void;
  onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(file: File) {
    setErr("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-design", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error subiendo la imagen");
      onUploaded(data.url, file.name);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="design-picker-upload">
      <p className="design-picker-hint">
        Sube tu propia foto de referencia (JPG, PNG, WebP, HEIC — máx 8 MB).
        Se enviará junto a tu pedido por WhatsApp.
      </p>
      {currentUrl ? (
        <div className="design-picker-uploaded">
          <Image
            src={currentUrl}
            alt={currentName || "Foto subida"}
            width={400}
            height={400}
            unoptimized
            style={{ width: "100%", maxWidth: 320, height: "auto", borderRadius: 12, display: "block", margin: "0 auto" }}
          />
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "var(--ink-2)" }}>
            {currentName}
          </p>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button type="button" className="btn" onClick={onClear} style={{ background: "rgba(0,0,0,.06)", padding: "8px 16px", fontSize: 13 }}>
              Quitar foto y subir otra
            </button>
          </div>
        </div>
      ) : (
        <label className="design-picker-upload-zone">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            disabled={uploading}
            style={{ display: "none" }}
          />
          {uploading ? (
            <>
              <span style={{ fontSize: 24 }}>⏳</span>
              <span>Subiendo…</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 32 }}>📷</span>
              <span><strong>Pulsa aquí</strong> para subir una foto</span>
              <span style={{ fontSize: 12, color: "var(--ink-2)" }}>o arrastra el archivo</span>
            </>
          )}
        </label>
      )}
      {err && <p style={{ color: "#d33", fontSize: 13, marginTop: 10 }}>{err}</p>}
    </div>
  );
}

// ===== Tab: Describir =====
function DescribeTab({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div>
      <p className="design-picker-hint">
        Cuéntanos qué buscas (colores, estilo, tema…) y entre Andreia y tú lo
        damos forma por WhatsApp.
      </p>
      <textarea
        className="design-picker-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: tarta para mi madre, le gustan las rosas, tonos pastel, un toque vintage…"
        rows={5}
        maxLength={500}
      />
      <p style={{ fontSize: 11, color: "var(--ink-2)", textAlign: "right", margin: "4px 0 0" }}>
        {value.length}/500
      </p>
    </div>
  );
}
