"use client";

import { useState } from "react";

interface Props {
  source?: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  buttonLabel?: string;
}

export default function NewsletterForm({
  source = "newsletter",
  title = "Un 5% para tu primera tarta",
  description = "Déjanos tu email y te mandamos el código al momento.",
  eyebrow = "Solo para ti",
  buttonLabel = "Quiero mi código",
}: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email no válido.");
      return;
    }
    if (!consent) {
      setError("Marca la casilla para suscribirte.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Hubo un problema. Inténtalo otra vez.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <aside className="newsletter-inline">
        <span className="newsletter-badge" aria-hidden="true">−5%</span>
        <span className="newsletter-inline-tag">¡Hecho!</span>
        <h3>Mira tu email 📩</h3>
        <p>Te hemos enviado tu código del 5%. Si no lo ves, revisa el spam.</p>
      </aside>
    );
  }

  return (
    <aside className="newsletter-inline">
      <span className="newsletter-badge" aria-hidden="true">−5%</span>
      <span className="newsletter-inline-tag">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <form className="newsletter-form" onSubmit={onSubmit} noValidate>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-label="Tu email"
        />
        <button type="submit" className="btn btn-pink" disabled={loading}>
          {loading ? "Enviando…" : buttonLabel}
        </button>
      </form>
      <label className="newsletter-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Acepto el newsletter · <a href="/privacidad">Privacidad</a>
        </span>
      </label>
      {error && (
        <p className="game-error" role="alert" style={{ marginTop: 10 }}>
          {error}
        </p>
      )}
    </aside>
  );
}
