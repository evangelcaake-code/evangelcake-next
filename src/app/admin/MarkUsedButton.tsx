"use client";

import { useState } from "react";

export default function MarkUsedButton({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    if (!confirm(`¿Marcar el código ${code} como usado? No se puede deshacer.`))
      return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/codes/mark-used", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      // Refrescar la página para que la tabla actualice estado
      window.location.reload();
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Error";
      setError(m);
      setLoading(false);
    }
  }

  if (error) {
    return (
      <span style={{ color: "#c0392b", fontSize: 11 }} role="alert">
        {error}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="admin-mark-used"
      onClick={onClick}
      disabled={loading}
      title="Marcar este código como ya canjeado"
    >
      {loading ? "…" : "Marcar usado"}
    </button>
  );
}
