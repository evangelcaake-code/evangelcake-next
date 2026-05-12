"use client";

import { useState } from "react";
import Link from "next/link";
import { saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

export default function HomeNewsletter() {
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
          source: "home",
          consent: true,
        }),
      });
      if (res.ok) {
        saveSubscribedEmail(email);
        track("newsletter_signup", { email, meta: { source: "home" } });
        setDone(true);
        setName("");
        setEmail("");
        setBirthday("");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No pudimos guardarlo. Inténtalo otra vez.");
      }
    } catch {
      setError("Hubo un problema. Inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="newsletter"
      className="newsletter"
      aria-labelledby="news-title"
    >
      <span className="tag">Newsletter</span>
      <h2 id="news-title">
        Un 5% en tu primera tarta y <em>cosas muy exclusivas.</em>
      </h2>
      <p className="lede">
        Suscríbete y te mandamos el código al instante. Una vez al mes:
        novedades del obrador, recetas y avances que solo verás aquí.
      </p>

      {done ? (
        <p
          aria-live="polite"
          style={{
            marginTop: 16,
            color: "var(--ink-2)",
            fontFamily: "var(--serif-2)",
            fontStyle: "italic",
            fontSize: 18,
          }}
        >
          ¡Hecho! Mira tu correo en unos minutos.
        </p>
      ) : (
        <form
          className="newsletter-form newsletter-form-stacked"
          onSubmit={onSubmit}
          noValidate
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
            name="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-label="Tu correo electrónico"
          />
          <label className="newsletter-birthday">
            <span>Tu cumpleaños (opcional)</span>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              min="1900-01-01"
            />
            <small>Si lo dejas, ese día te llega algo especial 🎂</small>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Enviando…" : "Suscribir →"}
          </button>
        </form>
      )}

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 10,
            color: "var(--pink-deep)",
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <p className="gdpr">
        Al suscribirte aceptas la{" "}
        <Link href="/privacidad">política de privacidad</Link>.
      </p>
    </section>
  );
}
