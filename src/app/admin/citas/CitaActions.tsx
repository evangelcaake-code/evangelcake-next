"use client";

import { useState } from "react";

/**
 * Botones de acción de una cita en el panel de Betaña:
 *  - WhatsApp con mensaje prellenado según el estado
 *  - Cambios de estado (confirmar / vino / no vino / cancelar)
 */

type Props = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentSlot: string; // HH:MM
  isPast: boolean;
  /** Cita de mañana: añade botón de WhatsApp con el recordatorio prellenado. */
  reminder?: boolean;
};

function waHref(phone: string, message: string) {
  // Normaliza: quita todo menos dígitos; móvil español de 9 cifras → prefijo 34.
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 9 && /^[67]/.test(digits)) digits = "34" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function humanDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function CitaActions({
  id, status, customerName, customerPhone, appointmentDate, appointmentSlot, isPast, reminder,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);
  const [newDate, setNewDate] = useState(appointmentDate);
  const [newSlot, setNewSlot] = useState(appointmentSlot);

  async function patch(body: Record<string, unknown>, loadingKey: string) {
    setLoading(loadingKey);
    setError("");
    try {
      const res = await fetch(`/api/admin/citas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(null);
    }
  }

  async function setStatus(next: string, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    await patch({ status: next }, next);
  }

  async function saveMove() {
    if (newDate === appointmentDate && newSlot === appointmentSlot) {
      setMoving(false);
      return;
    }
    await patch({ appointment_date: newDate, appointment_slot: newSlot }, "move");
  }

  const firstName = customerName.split(" ")[0];
  const fecha = humanDate(appointmentDate);

  const waMessage =
    status === "pending"
      ? `Hola ${firstName}! Te escribimos de EvangelCake para confirmar tu cita del ${fecha} a las ${appointmentSlot}. ¿Te va bien? Cualquier cosa nos dices por aquí. ¡Gracias!`
      : `Hola ${firstName}! Te escribimos de EvangelCake sobre tu cita del ${fecha} a las ${appointmentSlot}.`;

  return (
    <div className="cita-actions">
      {error && (
        <span className="cita-actions-error" role="alert">{error}</span>
      )}
      <a
        className="cita-btn wa"
        href={waHref(customerPhone, waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir WhatsApp con mensaje prellenado"
      >
        WhatsApp
      </a>

      {reminder && !isPast && status !== "cancelada" && (
        <a
          className="cita-btn wa"
          href={waHref(
            customerPhone,
            `Hola ${firstName}! Te escribimos de EvangelCake para recordarte tu cita de mañana a las ${appointmentSlot} (Pº María Agustín 13, Zaragoza). ¡Te esperamos!`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          title="Enviar recordatorio de mañana por WhatsApp"
        >
          ⏰ Recordatorio
        </a>
      )}

      {status === "pending" && !isPast && (
        <button
          type="button"
          className="cita-btn ok"
          disabled={loading !== null}
          onClick={() => setStatus("confirmed")}
          title="Confirma la cita y le envía el email al cliente (si dejó email)"
        >
          {loading === "confirmed" ? "…" : "✓ Confirmar"}
        </button>
      )}

      {!isPast && status !== "cancelada" && !moving && (
        <button
          type="button"
          className="cita-btn"
          disabled={loading !== null}
          onClick={() => setMoving(true)}
          title="Cambiar el día o la hora de la cita (mueve también el evento del calendario)"
        >
          🕑 Mover
        </button>
      )}

      {moving && (
        <span className="cita-move">
          <input
            type="date"
            className="cita-move-input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            aria-label="Nueva fecha"
          />
          <input
            type="time"
            className="cita-move-input"
            value={newSlot}
            step={300}
            onChange={(e) => setNewSlot(e.target.value)}
            aria-label="Nueva hora"
          />
          <button
            type="button"
            className="cita-btn ok"
            disabled={loading !== null}
            onClick={saveMove}
          >
            {loading === "move" ? "…" : "Guardar"}
          </button>
          <button
            type="button"
            className="cita-btn ghost"
            disabled={loading !== null}
            onClick={() => { setMoving(false); setNewDate(appointmentDate); setNewSlot(appointmentSlot); setError(""); }}
          >
            ✕
          </button>
        </span>
      )}

      {isPast && (status === "pending" || status === "confirmed") && (
        <>
          <button
            type="button"
            className="cita-btn ok"
            disabled={loading !== null}
            onClick={() => setStatus("vino")}
          >
            {loading === "vino" ? "…" : "✓ Vino"}
          </button>
          <button
            type="button"
            className="cita-btn bad"
            disabled={loading !== null}
            onClick={() => setStatus("no_vino", `¿Marcar que ${firstName} NO vino a la cita?`)}
          >
            {loading === "no_vino" ? "…" : "✗ No vino"}
          </button>
        </>
      )}

      {!isPast && status !== "cancelada" && (
        <button
          type="button"
          className="cita-btn ghost"
          disabled={loading !== null}
          onClick={() => setStatus("cancelada", `¿Cancelar la cita de ${firstName}? El hueco quedará libre.`)}
          title="Cancelar la cita"
        >
          {loading === "cancelada" ? "…" : "Cancelar"}
        </button>
      )}
    </div>
  );
}
