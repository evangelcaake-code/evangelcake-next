"use client";

import { useState } from "react";
import { track } from "@/lib/track";

export default function ContactFormCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
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
    if (!message.trim()) {
      setError("Escribe un mensaje.");
      return;
    }
    setLoading(true);
    try {
      const body = subject.trim()
        ? `Asunto: ${subject.trim()}\n\n${message}`
        : message;
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: body, source: "contacto" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      track("lead_submit", { email, meta: { source: "contacto" } });
      setSuccess(true);
    } catch (err: unknown) {
      const m =
        err instanceof Error
          ? err.message
          : "Hubo un problema. Inténtalo otra vez.";
      setError(m);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <form className="contact-form" aria-live="polite">
        <h3>¡Gracias!</h3>
        <p style={{ marginTop: 8 }}>
          Te contestamos en menos de 24 h. Si tienes prisa, escríbenos por{" "}
          <a
            href="https://wa.me/34624131348"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          .
        </p>
      </form>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <h3>Escríbenos</h3>
      <div className="row">
        <div>
          <label htmlFor="cf-name">Nombre</label>
          <input
            type="text"
            id="cf-name"
            name="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cf-email">Email</label>
          <input
            type="email"
            id="cf-email"
            name="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="cf-subject">Asunto</label>
        <input
          type="text"
          id="cf-subject"
          name="subject"
          placeholder="¿De qué hablamos?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cf-message">Mensaje</label>
        <textarea
          id="cf-message"
          name="message"
          placeholder="Tu mensaje…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      {error && (
        <p
          role="alert"
          style={{ color: "var(--pink-deep)", fontSize: 14, margin: 0 }}
        >
          {error}
        </p>
      )}
      <button type="submit" className="submit" disabled={loading}>
        {loading ? "Enviando…" : "Enviar mensaje →"}
      </button>
    </form>
  );
}
