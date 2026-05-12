"use client";

import { useEffect, useState } from "react";
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
            selectedCaption={value?.kind === "gallery" ? value.caption : null}
            onPick={(photo) =>
              onChange({ kind: "gallery", url: photo.src, caption: photo.caption })
            }
            onClear={() => onChange(null)}
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
  selectedCaption,
  onPick,
  onClear,
}: {
  selectedUrl: string | null;
  selectedCaption: string | null;
  onPick: (p: GalleryPhoto) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {selectedUrl ? (
        <div className="design-picker-selected-preview">
          <p className="design-picker-hint" style={{ marginBottom: 10 }}>
            Foto seleccionada:
          </p>
          <div className="design-picker-selected-img-wrap">
            <Image
              src={selectedUrl}
              alt={selectedCaption || "Foto seleccionada"}
              width={400}
              height={400}
              loading="eager"
              style={{
                width: "100%",
                maxWidth: 220,
                height: "auto",
                borderRadius: 12,
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
          {selectedCaption && (
            <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--ink-2)" }}>
              {selectedCaption}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-pink"
              style={{ padding: "8px 18px", fontSize: 13 }}
              onClick={() => setOpen(true)}
            >
              Cambiar foto
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "rgba(0,0,0,.06)", padding: "8px 18px", fontSize: 13 }}
              onClick={onClear}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className="design-picker-empty">
          <p className="design-picker-hint" style={{ marginBottom: 14 }}>
            Abre la galería completa, busca el diseño que más te guste y pulsa
            sobre la foto.
          </p>
          <button
            type="button"
            className="btn btn-pink"
            style={{ padding: "12px 24px", fontSize: 14 }}
            onClick={() => setOpen(true)}
          >
            🎨 Abrir galería completa →
          </button>
        </div>
      )}

      {open && (
        <GalleryModal
          selectedUrl={selectedUrl}
          onClose={() => setOpen(false)}
          onPick={(p) => {
            onPick(p);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ===== Modal fullscreen de galería =====
function GalleryModal({
  selectedUrl,
  onClose,
  onPick,
}: {
  selectedUrl: string | null;
  onClose: () => void;
  onPick: (p: GalleryPhoto) => void;
}) {
  // Cerrar con Esc + bloquear scroll del body mientras está abierto
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="gallery-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de tartas"
      onClick={onClose}
    >
      <div
        className="gallery-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="gallery-modal-head">
          <div>
            <h2 className="gallery-modal-title">Elige una tarta de referencia</h2>
            <p className="gallery-modal-sub">
              Pulsa sobre cualquier foto para usarla en tu pedido.
            </p>
          </div>
          <button
            type="button"
            className="gallery-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="gallery-modal-body">
          {CATEGORY_ORDER.map((cat) => {
            const photos = ALL_GALLERY_PHOTOS.filter((p) => p.category === cat);
            if (photos.length === 0) return null;
            return (
              <section key={cat} className="gallery-modal-cat">
                <h3 className="gallery-modal-cat-title">{CATEGORY_LABELS[cat]}</h3>
                <div className="gallery-modal-grid">
                  {photos.map((p) => {
                    const isSelected = selectedUrl === p.src;
                    return (
                      <button
                        key={p.src}
                        type="button"
                        className={`gallery-modal-thumb${isSelected ? " is-selected" : ""}`}
                        onClick={() => onPick(p)}
                        aria-label={`Seleccionar ${p.caption}`}
                      >
                        <Image
                          src={p.src}
                          alt={p.alt}
                          width={400}
                          height={400}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div className="gallery-modal-thumb-caption">{p.caption}</div>
                        {isSelected && (
                          <span className="gallery-modal-thumb-check" aria-hidden="true">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
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
