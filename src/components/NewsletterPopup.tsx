"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSubscribedEmail, saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

const DELAY_MS = 60_000; // 1 minuto
const DISMISS_KEY = "evangelcake_popup_dismissed_at";
const SUBSCRIBED_KEY = "evangelcake_popup_subscribed";
const SUPPRESS_DAYS = 7;
// Marca de cuándo empezó la visita actual (sessionStorage = persiste entre
// navegaciones dentro de la misma pestaña, se borra al cerrar el navegador).
// Así el contador acumula tiempo total en el sitio, no por página.
const VISIT_START_KEY = "evangelcake_visit_started_at";

// === A/B TEST ===
// Cada visitante recibe aleatoriamente una variante de copy, la fijamos en
// localStorage para que vea siempre la misma (si no, distorsionaría las
// métricas de conversión).
const VARIANT_KEY = "evangelcake_popup_variant";
type Variant = "A" | "B";
const VARIANTS: Record<Variant, { title: React.ReactNode; description: string; cta: string }> = {
  A: {
    title: (
      <>
        Un 5% para tu primera tarta y <em>cosas muy exclusivas.</em>
      </>
    ),
    description:
      "Suscríbete y te mandamos el código al instante. Una vez al mes: novedades del obrador, recetas y avances que solo verás aquí.",
    cta: "Quiero mi 5% →",
  },
  B: {
    title: (
      <>
        Las recetas de Andreia + <em>tu primer 5%.</em>
      </>
    ),
    description:
      "Antes que en redes, antes que en el blog. Déjanos tu email y te llega el código al momento. Sin spam, solo cosas buenas.",
    cta: "Apúntame →",
  },
};

function pickVariant(): Variant {
  if (typeof window === "undefined") return "A";
  try {
    const saved = localStorage.getItem(VARIANT_KEY);
    if (saved === "A" || saved === "B") return saved;
    const v: Variant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(VARIANT_KEY, v);
    return v;
  } catch {
    return "A";
  }
}

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [variant, setVariant] = useState<Variant>("A");
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
    const assigned = pickVariant();
    setVariant(assigned);
    const t = setTimeout(() => {
      setOpen(true);
      if (!trackedShownRef.current) {
        trackedShownRef.current = true;
        track("popup_shown", { meta: { variant: assigned } });
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
    track("popup_dismissed", { meta: { variant } });
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
        track("popup_converted", { email, meta: { variant } });
        track("newsletter_signup", { email, meta: { source: "popup", variant } });
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
      className={`nf-overlay${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="nf-card nf-popup">
        <button
          type="button"
          className="nf-popup-close"
          onClick={close}
          aria-label="Cerrar"
        >
          ×
        </button>

        {done ? (
          <div className="nf-card-success">
            <div className="nf-eyebrow">¡Hecho!</div>
            <h3 id="popup-title" className="nf-title">
              Mira tu email <span aria-hidden="true">📩</span>
            </h3>
            <p className="nf-desc">
              Te hemos mandado el código del 5% para tu primera tarta personalizada.
              Si no lo ves, revisa la carpeta de spam.
            </p>
            <button
              type="button"
              className="nf-submit"
              onClick={close}
              style={{ marginTop: 18, width: "100%" }}
            >
              Seguir explorando →
            </button>
          </div>
        ) : (
          <>
            <div className="nf-head">
              <span className="nf-eyebrow">solo para ti</span>
              <h3 id="popup-title" className="nf-title">
                {VARIANTS[variant].title}
              </h3>
              <p className="nf-desc">{VARIANTS[variant].description}</p>
            </div>

            <form className="nf-form" onSubmit={onSubmit} noValidate>
              <div className="nf-field">
                <label htmlFor="nf-pop-name" className="nf-label">Tu nombre</label>
                <input
                  id="nf-pop-name"
                  className="nf-input"
                  type="text"
                  placeholder="María, Carlos, Andreia…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={40}
                  autoFocus
                  autoComplete="given-name"
                />
              </div>

              <div className="nf-field">
                <label htmlFor="nf-pop-email" className="nf-label">Tu email</label>
                <input
                  id="nf-pop-email"
                  className="nf-input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="nf-field nf-field-birthday">
                <label htmlFor="nf-pop-bday" className="nf-label">
                  Tu cumpleaños <span className="nf-optional">(opcional)</span>
                </label>
                <input
                  id="nf-pop-bday"
                  className="nf-input"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                />
                <small className="nf-hint">
                  Si lo dejas, ese día te llega algo especial 🎂
                </small>
              </div>

              <button type="submit" className="nf-submit" disabled={loading}>
                {loading ? "Enviando…" : VARIANTS[variant].cta}
              </button>

              {error && (
                <p className="nf-error" role="alert">
                  {error}
                </p>
              )}
            </form>

            <p className="nf-popup-tiny">
              Sin spam. Puedes darte de baja cuando quieras.{" "}
              <Link href="/privacidad" onClick={close}>
                Privacidad
              </Link>
              .
            </p>

            <button
              type="button"
              className="nf-popup-skip"
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
