"use client";

import { useState } from "react";

export default function ContactForm() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    event_type: "",
    event_date: "",
    guests: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof data>(key: K, val: string) {
    setData((d) => ({ ...d, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email no válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          guests: data.guests ? Number(data.guests) : undefined,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Error");
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hubo un problema. Inténtalo otra vez.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="game-card" style={{ maxWidth: 560 }}>
        <span className="game-eyebrow">¡Recibido!</span>
        <h2>Gracias, te escribimos pronto</h2>
        <p className="game-lede">
          Hemos guardado tu mensaje. Andreia o Tiago te contestan en menos de 24
          horas (normalmente mucho antes).
        </p>
        <a className="btn btn-pink game-cta" href="/">
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <form className="game-form" onSubmit={onSubmit} style={{ maxWidth: 560 }} noValidate>
      <label className="game-field">
        <span>Tu nombre</span>
        <input value={data.name} onChange={(e) => update("name", e.target.value)} required />
      </label>
      <label className="game-field">
        <span>Email</span>
        <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} required />
      </label>
      <label className="game-field">
        <span>Teléfono (opcional)</span>
        <input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} />
      </label>
      <label className="game-field">
        <span>Tipo de evento</span>
        <select
          value={data.event_type}
          onChange={(e) => update("event_type", e.target.value)}
          style={{
            padding: "14px 16px",
            border: "1px solid rgba(0,0,0,.12)",
            borderRadius: 999,
            fontSize: 15,
            fontFamily: "inherit",
            background: "#fff",
          }}
        >
          <option value="">Selecciona…</option>
          <option value="boda">Boda</option>
          <option value="cumple">Cumpleaños</option>
          <option value="comunion">Comunión</option>
          <option value="aniversario">Aniversario</option>
          <option value="otro">Otro</option>
        </select>
      </label>
      <label className="game-field">
        <span>Fecha del evento</span>
        <input type="date" value={data.event_date} onChange={(e) => update("event_date", e.target.value)} />
      </label>
      <label className="game-field">
        <span>Comensales</span>
        <input type="number" min={1} max={500} value={data.guests} onChange={(e) => update("guests", e.target.value)} />
      </label>
      <label className="game-field">
        <span>Cuéntanos más</span>
        <textarea
          value={data.message}
          onChange={(e) => update("message", e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Sabores, colores, inspiraciones, alergias…"
          style={{
            padding: "14px 16px",
            border: "1px solid rgba(0,0,0,.12)",
            borderRadius: 16,
            fontSize: 15,
            fontFamily: "inherit",
            background: "#fff",
            resize: "vertical",
          }}
        />
      </label>
      <button type="submit" className="btn btn-pink game-cta" disabled={loading}>
        {loading ? "Enviando…" : "Enviar →"}
      </button>
      {error && <p className="game-error">{error}</p>}
    </form>
  );
}
