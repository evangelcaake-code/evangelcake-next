"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSubscribedEmail, saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

const DELAY_MS = 15_000; // 15 segundos
const DISMISS_KEY = "evangelcake_popup_dismissed_at";
const SUBSCRIBED_KEY = "evangelcake_popup_subscribed";
const SUPPRESS_DAYS = 7;
// Marca de cuándo empezó la visita actual (sessionStorage = persiste entre
// navegaciones dentro de la misma pestaña, se borra al cerrar el navegador).
// Así el contador acumula tiempo total en el sitio, no por página.
const VISIT_START_KEY = "evangelcake_visit_started_at";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const trackedShownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Si ya está suscrito vía popup, no mostrar nunca más
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY) === "yes") return;
    } catch {}

    // Si tenemos su email de cualquier suscripción anterior (popup, home,
    // footer, blog, game o cookie firmada), no le mostramos el popup.
    if (getSubscribedEmail()) return;

    // Si fue dismissado hace < 7 días, no mostrar
    try {
      const at = localStorage.getItem(DISMISS_KEY);
      if (at) {
        const elapsed = Date.now() - Number(at);
        if (elapsed < SUPPRESS_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch {}

    // Marca de tiempo de inicio de la visita.
    // sessionStorage persiste entre navegaciones dentro de la misma pestaña,
    // así el contador acumula tiempo TOTAL en el sitio (no por página).
    let visitStart: number;
    try {
      const stored = sessionStorage.getItem(VISIT_START_KEY);
      if (stored) {
        visitStart = Number(stored);
      } else {
        visitStart = Date.now();
        sessionStorage.setItem(VISIT_START_KEY, String(visitStart));
      }
    } catch {
      visitStart = Date.now();
    }

    const elapsed = Date.now() - visitStart;
    const remaining = Math.max(0, DELAY_MS - elapsed);
    const t = setTimeout(() => {
      setOpen(true);
      if (!trackedShownRef.current) {
        trackedShownRef.current = true;
        track("popup_shown");
      }
    }, remaining);
    return () => clearTimeout(t);
  }, []);

  // Bloquear scroll del body cuando está abierto + Esc cierra
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    track("popup_dismissed");
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Pon tu nombre, aunque sea solo el primero.");
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
          source: "popup",
          consent: true,
        }),
      });
      if (res.ok) {
        try {
          localStorage.setItem(SUBSCRIBED_KEY, "yes");
        } catch {}
        saveSubscribedEmail(email);
        track("popup_converted", { email });
        track("newsletter_signup", { email, meta: { source: "popup" } });
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No pudimos suscribirte. Inténtalo otra vez.");
      }
    } catch {
      setError("Hubo un problema. Inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className={`newsletter-popup${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="newsletter-popup-card">
        <button
          type="button"
          className="newsletter-popup-close"
          onClick={close}
          aria-label="Cerrar"
        >
          ×
        </button>

        <span className="newsletter-popup-badge">−5%</span>

        {done ? (
          <>
            <h3 id="popup-title">¡Hecho! 🎂</h3>
            <p>
              Mira tu correo en unos minutos. Te hemos mandado el código del 5%
              para tu primera tarta personalizada.
            </p>
            <button
              type="button"
              className="btn btn-pink"
              onClick={close}
              style={{ marginTop: 10 }}
            >
              Seguir explorando →
            </button>
          </>
        ) : (
          <>
            <h3 id="popup-title">
              Un 5% para tu primera tarta y <em>novedades exclusivas.</em>
            </h3>
            <p>
              Déjanos tu email y te mandamos el código al instante. Una vez al
              mes, recetas y novedades que solo verás aquí.
            </p>

            <form
              className="newsletter-popup-form newsletter-popup-form-stacked"
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
                autoFocus
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
                aria-label="Tu correo electrónico"
              />
              <label className="newsletter-popup-birthday">
                <span>Tu cumpleaños (opcional)</span>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                />
                <small>
                  Si lo dejas, ese día te llega algo especial 🎂
                </small>
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Enviando…" : "Quiero mi 5% →"}
              </button>
            </form>

            {error && (
              <p
                role="alert"
                style={{
                  color: "var(--pink-deep)",
                  fontSize: 13,
                  margin: "8px 0 0",
                }}
              >
                {error}
              </p>
            )}

            <p className="newsletter-popup-tiny">
              Sin spam. Puedes darte de baja cuando quieras.{" "}
              <Link href="/privacidad" onClick={close}>
                Privacidad
              </Link>
              .
            </p>

            <button
              type="button"
              className="newsletter-popup-skip"
              onClick={close}
            >
              No, gracias
            </button>
          </>
        )}
      </div>
    </div>
  );
}
