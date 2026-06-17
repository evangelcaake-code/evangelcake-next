"use client";

import { useState } from "react";
import { saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    if (!consent) {
      setError("Marca la casilla para suscribirte.");
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
          source,
          consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      saveSubscribedEmail(email);
      track("newsletter_signup", { email, meta: { source } });
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
      <aside className="nf-card nf-card-success" role="status">
        <div className="nf-eyebrow">¡Hecho!</div>
        <h3 className="nf-title">Mira tu email <span aria-hidden="true">📩</span></h3>
        <p className="nf-desc">
          La receta te llega en menos de un minuto. Si no la ves, revisa la carpeta de spam.
        </p>
      </aside>
    );
  }

  return (
    <aside className="nf-card" aria-labelledby="nf-title">
      <div className="nf-head">
        <span className="nf-eyebrow">{eyebrow}</span>
        <h3 id="nf-title" className="nf-title">{title}</h3>
        <p className="nf-desc">{description}</p>
      </div>

      <form className="nf-form" onSubmit={onSubmit} noValidate>
        <div className="nf-field">
          <label htmlFor="nf-name" className="nf-label">Tu nombre</label>
          <input
            id="nf-name"
            type="text"
            placeholder="María, Carlos, Andreia…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={40}
            autoComplete="given-name"
            className="nf-input"
          />
        </div>

        <div className="nf-field">
          <label htmlFor="nf-email" className="nf-label">Tu email</label>
          <input
            id="nf-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="nf-input"
          />
        </div>

        <div className="nf-field nf-field-birthday">
          <label htmlFor="nf-bday" className="nf-label">
            Tu cumpleaños <span className="nf-optional">(opcional)</span>
          </label>
          <input
            id="nf-bday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            min="1900-01-01"
            className="nf-input"
          />
          <small className="nf-hint">
            Si lo dejas, ese día te llega algo especial 🎂
          </small>
        </div>

        <label className="nf-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Acepto recibir el newsletter de EvangelCake. Sin spam, baja de la
            lista cuando quieras. <a href="/privacidad" target="_blank" rel="noopener">Privacidad</a>.
          </span>
        </label>

        <button type="submit" className="nf-submit" disabled={loading}>
          {loading ? "Enviando…" : buttonLabel}
        </button>

        {error && (
          <p className="nf-error" role="alert">{error}</p>
        )}
      </form>
    </aside>
  );
}
