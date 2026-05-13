"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface InstagramPost {
  id: string;
  image_url: string;
  post_url: string | null;
  caption: string | null;
  position: number;
  published: boolean;
  created_at: string;
}

interface Props {
  initialPosts: InstagramPost[];
}

export default function InstagramManager({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts);
  const [adding, setAdding] = useState(false);

  // Form de añadir
  const [file, setFile] = useState<File | null>(null);
  const [postUrl, setPostUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Selecciona una foto");
      return;
    }
    setUploading(true);
    try {
      // 1) Subir la imagen al bucket de Supabase
      const form = new FormData();
      form.append("file", file);
      const upRes = await fetch("/api/upload-design", { method: "POST", body: form });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "Error subiendo");

      // 2) Crear el post en BD
      const newPos = posts.length > 0 ? Math.max(...posts.map((p) => p.position)) + 1 : 0;
      const res = await fetch("/api/admin/instagram-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: upData.url,
          post_url: postUrl.trim() || null,
          caption: caption.trim() || null,
          position: newPos,
          published: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando");

      // Reset y refresh
      setFile(null);
      setPostUrl("");
      setCaption("");
      setAdding(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(p: InstagramPost) {
    const updated = posts.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x));
    setPosts(updated);
    try {
      await fetch(`/api/admin/instagram-posts/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
    } catch {}
  }

  async function changePosition(p: InstagramPost, newPos: number) {
    const updated = posts.map((x) => (x.id === p.id ? { ...x, position: newPos } : x));
    updated.sort((a, b) => a.position - b.position);
    setPosts(updated);
    try {
      await fetch(`/api/admin/instagram-posts/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: newPos }),
      });
    } catch {}
  }

  async function deletePost(p: InstagramPost) {
    if (!confirm(`¿Borrar este post? "${p.caption || p.image_url.slice(-40)}"`)) return;
    setPosts(posts.filter((x) => x.id !== p.id));
    try {
      await fetch(`/api/admin/instagram-posts/${p.id}`, { method: "DELETE" });
    } catch {}
  }

  return (
    <>
      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Añadir post nuevo</h2>
          {!adding && (
            <button
              type="button"
              className="btn btn-pink"
              style={{ padding: "8px 16px", fontSize: 13 }}
              onClick={() => setAdding(true)}
            >
              + Nuevo post
            </button>
          )}
        </header>
        {adding && (
          <form onSubmit={onAddSubmit} style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
              Foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: "block", marginTop: 6, fontSize: 14 }}
                required
              />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
              Link al post de Instagram (opcional)
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/XXXXX/"
                style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 14 }}
              />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-2)" }}>
              Caption (opcional)
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ej: Tarta de boda de Sara y Pedro"
                maxLength={120}
                style={{ marginTop: 4, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", fontSize: 14 }}
              />
            </label>
            {error && <p style={{ color: "#d33", fontSize: 13, margin: 0 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={uploading} className="btn btn-pink" style={{ padding: "10px 20px", fontSize: 14 }}>
                {uploading ? "Subiendo…" : "Guardar post"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setFile(null);
                  setPostUrl("");
                  setCaption("");
                  setError("");
                }}
                className="btn"
                style={{ background: "rgba(0,0,0,.06)", padding: "10px 20px", fontSize: 14 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Posts ({posts.length})</h2>
          <span className="admin-count">
            Los publicados ({posts.filter((p) => p.published).length}) aparecen en la home
          </span>
        </header>
        <div style={{ padding: "12px 20px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {posts.length === 0 && (
            <p style={{ color: "var(--ink-2)" }}>No hay posts. Añade el primero arriba.</p>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              style={{
                background: "var(--paper-2)",
                borderRadius: 12,
                overflow: "hidden",
                opacity: p.published ? 1 : 0.5,
                border: p.published ? "1px solid rgba(0,0,0,.06)" : "1px dashed rgba(0,0,0,.2)",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "1/1", background: "#fff" }}>
                <Image
                  src={p.image_url}
                  alt={p.caption || ""}
                  width={400}
                  height={400}
                  unoptimized
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 10, fontSize: 12 }}>
                {p.caption && (
                  <p style={{ margin: "0 0 6px", color: "var(--ink)", fontWeight: 500 }}>{p.caption}</p>
                )}
                {p.post_url && (
                  <a
                    href={p.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--pink-deep)", fontSize: 11, wordBreak: "break-all" }}
                  >
                    Ver en Instagram →
                  </a>
                )}
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <input
                    type="number"
                    value={p.position}
                    onChange={(e) => changePosition(p, parseInt(e.target.value, 10) || 0)}
                    style={{ width: 50, padding: "4px 6px", fontSize: 11, border: "1px solid rgba(0,0,0,.15)", borderRadius: 6 }}
                    title="Posición (0 = primero)"
                  />
                  <button
                    type="button"
                    onClick={() => togglePublished(p)}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      fontSize: 11,
                      background: p.published ? "rgba(10,140,74,.10)" : "rgba(0,0,0,.06)",
                      color: p.published ? "#0a8c4a" : "var(--ink-2)",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {p.published ? "✓ Publicado" : "Oculto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePost(p)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      background: "transparent",
                      color: "#d33",
                      border: 0,
                      cursor: "pointer",
                    }}
                    aria-label="Borrar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
