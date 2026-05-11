"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error de login");
        setLoading(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("No se pudo contactar el servidor.");
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={onSubmit} noValidate>
      <label className="admin-login-field">
        <span>Contraseña</span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && (
        <p role="alert" className="admin-login-error">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-pink" disabled={loading}>
        {loading ? "Entrando…" : "Entrar →"}
      </button>
    </form>
  );
}
