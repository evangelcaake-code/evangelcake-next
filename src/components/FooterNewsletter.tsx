"use client";

import { useState } from "react";
import { saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", consent: true }),
      });
      if (res.ok) {
        saveSubscribedEmail(email);
        track("newsletter_signup", { email, meta: { source: "footer" } });
        setDone(true);
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
    <form className="foot-news" onSubmit={onSubmit} aria-label="Newsletter">
      <input
        type="email"
        placeholder="Tu correo · recetas y novedades"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "…" : "Suscribir →"}
      </button>
    </form>
  );
}
