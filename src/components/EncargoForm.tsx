"use client";

import { useState } from "react";
import { track } from "@/lib/track";

const EVENT_TYPES = ["Cumpleaños", "Boda", "Bautizo", "Empresa", "Otro"];
const FLAVORS = [
  "Frambuesa",
  "Vainilla",
  "Chocolate",
  "Limón",
  "Pistacho",
  "Tres leches",
  "Zanahoria-chocolate",
];

export default function EncargoForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [event, setEvent] = useState(EVENT_TYPES[0]);
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Falta tu nombre.");
      return;
    }
    if (!phone.trim()) {
      setError("Necesitamos un teléfono para contactarte.");
      return;
    }
    setLoading(true);
    try {
      const lines: string[] = [];
      if (flavor) lines.push(`Sabor preferido: ${flavor}`);
      if (message.trim()) lines.push("", message.trim());
      // El API exige email — usamos uno sintetico a partir del teléfono
      // para no añadir un campo extra que el formulario original no tenía.
      const syntheticEmail = `lead-${phone.replace(/\D/g, "")}@encargos.evangelcake.local`;
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: syntheticEmail,
          phone,
          event_type: event.toLowerCase(),
          event_date: date || undefined,
          guests: people ? Number(people) : undefined,
          message: lines.join("\n") || undefined,
          source: "encargos",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      track("lead_submit", { meta: { source: "encargos", phone, event_type: event } });
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
        <h3>¡Recibido!</h3>
        <p style={{ marginTop: 8 }}>
          Andreia o Tiago te contestan en menos de 24 h. Si tienes prisa,
          escríbenos por{" "}
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
    <form
      className="contact-form"
      onSubmit={onSubmit}
      noValidate
      style={{ marginTop: 0 }}
    >
      <h3>Cuéntanos sobre tu pedido</h3>
      <div className="row">
        <div>
          <label htmlFor="ef-name">Nombre</label>
          <input
            type="text"
            id="ef-name"
            name="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="ef-phone">Móvil</label>
          <input
            type="tel"
            id="ef-phone"
            name="phone"
            placeholder="+34 6 ··· ·· ··"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div>
          <label htmlFor="ef-date">Fecha del evento</label>
          <input
            type="date"
            id="ef-date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ef-people">Comensales</label>
          <input
            type="number"
            id="ef-people"
            name="people"
            placeholder="15"
            min={1}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="ef-event">Tipo de evento</label>
        <select
          id="ef-event"
          name="event"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ef-flavor">Sabor preferido</label>
        <select
          id="ef-flavor"
          name="flavor"
          value={flavor}
          onChange={(e) => setFlavor(e.target.value)}
        >
          {FLAVORS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ef-msg">Cuéntanos tu idea</label>
        <textarea
          id="ef-msg"
          name="message"
          placeholder="Tarta de dos pisos, decoración floral en tonos rosa empolvado…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 0",
          borderTop: "1px dashed rgba(0,0,0,.15)",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
          Estimación inicial
        </span>
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: 32,
            color: "var(--pink-deep)",
          }}
        >
          desde €45
        </span>
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
        {loading ? "Enviando…" : "Enviar consulta · respuesta en 24h →"}
      </button>
    </form>
  );
}
