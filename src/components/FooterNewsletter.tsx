"use client";

import { useState } from "react";
import { saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

export default function FooterNewsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Pon tu nombre.");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email no válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email,
          birthday: birthday || undefined,
          source: "footer",
          consent: true,
        }),
      });
      if (res.ok) {
        saveSubscribedEmail(email);
        track("newsletter_signup", { email, meta: { source: "footer" } });
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No pudimos suscribirte.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 12 }}>
        ¡Hecho! Mira tu correo en unos minutos.
      </p>
    );
  }

  return (
    <form
      className="foot-news foot-news-stacked"
      onSubmit={onSubmit}
      aria-label="Newsletter"
    >
      <input
        type="text"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={40}
        autoComplete="given-name"
        aria-label="Tu nombre"
      />
      <input
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        aria-label="Tu correo"
      />
      <input
        type="date"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        max={new Date().toISOString().slice(0, 10)}
        min="1900-01-01"
        title="Cumpleaños (opcional) — te mandamos algo el día"
        aria-label="Tu cumpleaños (opcional)"
      />
      <button type="submit" disabled={loading}>
        {loading ? "…" : "Suscribir →"}
      </button>
      {error && (
        <p
          role="alert"
          style={{
            color: "#ff9bb8",
            fontSize: 11,
            margin: "6px 0 0",
            gridColumn: "1 / -1",
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
