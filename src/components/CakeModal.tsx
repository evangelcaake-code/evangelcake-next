"use client";

import { useEffect, useRef, useState } from "react";
import { markCodeUsed } from "@/lib/markCodeUsed";
import DesignPicker, { type DesignSelection } from "@/components/DesignPicker";
import DiscountCodeBox from "@/components/DiscountCodeBox";
import { SIZES, RELLENOS, COBERTURAS } from "@/data/cakeOptions";

const BIZCOCHOS = ["Vainilla", "Red Velvet", "Chocolate", "Otro (a consultar)"];

type State = {
  raciones: string;
  bizcocho: string;
  rellenos: string[];
  cobertura: string;
};

const EMPTY: State = { raciones: "", bizcocho: "", rellenos: [], cobertura: "" };

function maxFills(state: State): 1 | 2 {
  const found = SIZES.find((s) => s.value === state.raciones);
  return found?.rellenos ?? 1;
}

function buildWA(
  state: State,
  date: string,
  notes: string,
  code: string,
  design: DesignSelection,
): string {
  const rellenoLine =
    state.rellenos.length === 2
      ? `✨ Rellenos: ${state.rellenos[0]} + ${state.rellenos[1]}`
      : `✨ Relleno: ${state.rellenos[0] || ""}`;
  const lines = [
    "Hola! Quiero personalizar una tarta con estas opciones:",
    "",
    `👥 Raciones: ${state.raciones}`,
    `🎂 Bizcocho: ${state.bizcocho}`,
    rellenoLine,
    `🍓 Cobertura: ${state.cobertura}`,
  ];
  if (date) {
    try {
      const d = new Date(date + "T00:00:00");
      lines.push(
        `📅 Fecha: ${d.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
      );
    } catch {
      lines.push(`📅 Fecha: ${date}`);
    }
  }
  if (design) {
    lines.push("");
    if (design.kind === "gallery") {
      const site = typeof window !== "undefined" ? window.location.origin : "https://evangelcake.com";
      lines.push(`🎨 Diseño de referencia (galería · ${design.caption}):`);
      lines.push(`${site}${design.url}`);
    } else if (design.kind === "upload") {
      lines.push(`🎨 Foto de referencia subida:`);
      lines.push(design.url);
    } else if (design.kind === "describe") {
      lines.push(`🎨 Idea (sin diseño claro todavía):`);
      lines.push(design.description.trim());
    }
  }
  if (notes.trim()) lines.push("", `📝 Notas: ${notes.trim()}`);
  if (code) lines.push("", `🎁 Código de descuento: ${code} (5%)`);
  lines.push("", "¿Podríais pasarme presupuesto y hablamos del diseño?");
  return `https://wa.me/34624131348?text=${encodeURIComponent(lines.join("\n"))}`;
}

const CODE_LS_KEY = "evangelcake_discount_code";

export default function CakeModal() {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(1);
  const [state, setState] = useState<State>(EMPTY);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [design, setDesign] = useState<DesignSelection>(null);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [spinReset, setSpinReset] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar código del localStorage en el primer render del cliente.
  // (El que viene de la URL ya lo procesa CakeConfigurator; aquí solo leemos lo guardado.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(CODE_LS_KEY);
      if (saved) setDiscountCode(saved);
    } catch {}
  }, []);

  useEffect(() => {
    function onOpen() {
      setMounted(true);
      setStep(1);
      requestAnimationFrame(() => setEntered(true));
    }
    window.addEventListener("open-cake-modal", onOpen);
    return () => window.removeEventListener("open-cake-modal", onOpen);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted]);

  const fills = maxFills(state);

  function close() {
    setEntered(false);
    setTimeout(() => setMounted(false), 300);
  }
  function reset() {
    setState(EMPTY);
    setDate("");
    setNotes("");
    setDesign(null);
    setStep(1);
    setSpinReset(true);
    setTimeout(() => setSpinReset(false), 600);
  }
  function next() {
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function scheduleAdvance(currentStep: number) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setStep((s) => (s === currentStep && s < 5 ? s + 1 : s));
    }, 380);
  }

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const canNext =
    (step === 1 && !!state.raciones) ||
    (step === 2 && !!state.bizcocho) ||
    (step === 3 && state.rellenos.length >= 1) ||
    (step === 4 && !!state.cobertura) ||
    step === 5;

  function pickRaciones(v: string) {
    setState((s) => {
      const found = SIZES.find((x) => x.value === v);
      const max = found?.rellenos ?? 1;
      return {
        ...s,
        raciones: v,
        rellenos: s.rellenos.slice(0, max),
      };
    });
    scheduleAdvance(1);
  }
  function pickBizcocho(v: string) {
    setState((s) => ({ ...s, bizcocho: v }));
    scheduleAdvance(2);
  }
  function toggleRelleno(v: string) {
    setState((s) => {
      const max = maxFills(s);
      if (s.rellenos.includes(v)) {
        return { ...s, rellenos: s.rellenos.filter((r) => r !== v) };
      }
      if (s.rellenos.length >= max) {
        if (max === 1) {
          return { ...s, rellenos: [v] };
        }
        setShakeKey(v);
        setTimeout(() => setShakeKey(null), 400);
        return s;
      }
      const next = { ...s, rellenos: [...s.rellenos, v] };
      if (next.rellenos.length === max) {
        scheduleAdvance(3);
      }
      return next;
    });
  }
  function pickCobertura(v: string) {
    setState((s) => ({ ...s, cobertura: v }));
    scheduleAdvance(4);
  }

  return (
    <div
      className={`cake-config${entered ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cc-title"
      hidden={!mounted}
    >
      <div className="cc-backdrop" onClick={close} />
      <div className="cc-box" role="document">
        <header className="cc-head">
          <div>
            <span className="cc-eyebrow">Personaliza tu tarta</span>
            <h2 id="cc-title" className="cc-title">
              Diseña tu tarta <em>paso a paso.</em>
            </h2>
          </div>
          <div className="cc-head-actions">
            <button
              type="button"
              className={`cc-reset${spinReset ? " spinning" : ""}`}
              aria-label="Limpiar selecciones"
              onClick={reset}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M3 6h18 M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2 M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14 M10 11v6 M14 11v6" />
              </svg>
              <span>Limpiar</span>
            </button>
            <button
              type="button"
              className="cc-close"
              aria-label="Cerrar configurador"
              onClick={close}
            >
              ×
            </button>
          </div>
        </header>

        <div className="cc-progress" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((d) => (
            <span
              key={d}
              className={`cc-dot${d === step ? " active" : ""}${d < step ? " done" : ""}`}
            />
          ))}
        </div>

        <div className="cc-stage">
          {step === 1 && (
            <section className="cc-step active" aria-labelledby="cc-s1">
              <span className="cc-step-meta">Paso 1 de 4</span>
              <h3 id="cc-s1">
                ¿Para cuántas <em>personas?</em>
              </h3>
              <div className="cc-options cc-options-grid cc-options-small">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`cc-opt cc-opt-priced${state.raciones === s.value ? " selected" : ""}`}
                    onClick={() => pickRaciones(s.value)}
                  >
                    <span>{s.display}</span>
                    <small>{s.price}</small>
                  </button>
                ))}
              </div>
              <p className="cc-prices-mini">
                ★ Estos precios incluyen oblea comestible. Pueden tener coste
                extra fondant, formato corazón, merengue, buttercream o
                decoración con piezas acrílicas.
              </p>
              <p className="cc-note">
                ¿Más de 55 personas?{" "}
                <a
                  href="https://wa.me/34624131348?text=Hola!%20Necesito%20una%20tarta%20para%20m%C3%A1s%20de%2055%20personas%2C%20%C2%BFpodemos%20hablar%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Háblanos directamente →
                </a>
              </p>
              {state.raciones && fills === 2 && (
                <p className="cc-bonus">
                  <strong>★ Genial:</strong> con este tamaño puedes elegir{" "}
                  <strong>2 sabores</strong> de relleno.
                </p>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="cc-step active" aria-labelledby="cc-s2">
              <span className="cc-step-meta">Paso 2 de 4</span>
              <h3 id="cc-s2">
                Escoge tu <em>bizcocho.</em>
              </h3>
              <div className="cc-options">
                {BIZCOCHOS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`cc-opt${b.startsWith("Otro") ? " cc-opt-other" : ""}${state.bizcocho === b ? " selected" : ""}`}
                    onClick={() => pickBizcocho(b)}
                  >
                    {b.startsWith("Otro") ? (
                      <>
                        Otro <span>(consultar por WhatsApp)</span>
                      </>
                    ) : (
                      b
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="cc-step active" aria-labelledby="cc-s3">
              <span className="cc-step-meta">Paso 3 de 4</span>
              <h3 id="cc-s3">
                Escoge {fills === 2 ? "tus " : "tu "}
                <em>{fills === 2 ? "2 rellenos" : "relleno"}.</em>
              </h3>
              {fills === 2 && (
                <p className="cc-multi-help">
                  ✨ Puedes elegir <strong>1 o 2 sabores</strong>. Click para
                  añadir, click otra vez para quitar.
                </p>
              )}
              <div
                className="cc-options cc-options-grid"
                data-multi={fills === 2 ? "true" : "false"}
              >
                {RELLENOS.map((r) => {
                  const idx = state.rellenos.indexOf(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      className={`cc-opt${idx >= 0 ? " selected" : ""}${shakeKey === r ? " cc-shake" : ""}`}
                      data-order={idx >= 0 ? idx + 1 : undefined}
                      onClick={() => toggleRelleno(r)}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="cc-step active" aria-labelledby="cc-s4">
              <span className="cc-step-meta">Paso 4 de 4</span>
              <h3 id="cc-s4">
                Escoge tu <em>cobertura.</em>
              </h3>
              <div className="cc-options">
                {COBERTURAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cc-opt${state.cobertura === c ? " selected" : ""}`}
                    onClick={() => pickCobertura(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 5 && (
            <section
              className="cc-step cc-summary-step active"
              aria-labelledby="cc-s5"
            >
              <span className="cc-step-meta">¡Casi listo!</span>
              <h3 id="cc-s5">
                Esta es <em>tu tarta.</em>
              </h3>
              <ul className="cc-summary">
                <li>
                  <span className="cc-sum-label">Raciones</span>
                  <span className="cc-sum-value">{state.raciones || "—"}</span>
                </li>
                <li>
                  <span className="cc-sum-label">Bizcocho</span>
                  <span className="cc-sum-value">{state.bizcocho || "—"}</span>
                </li>
                <li>
                  <span className="cc-sum-label">Relleno</span>
                  <span className="cc-sum-value">
                    {state.rellenos.length ? state.rellenos.join(" + ") : "—"}
                  </span>
                </li>
                <li>
                  <span className="cc-sum-label">Cobertura</span>
                  <span className="cc-sum-value">{state.cobertura || "—"}</span>
                </li>
              </ul>

              <DiscountCodeBox
                value={discountCode}
                onChange={(code) => {
                  setDiscountCode(code);
                  try {
                    if (code) localStorage.setItem(CODE_LS_KEY, code);
                    else localStorage.removeItem(CODE_LS_KEY);
                  } catch {}
                }}
              />

              <div className="cc-date-picker">
                <label htmlFor="ccDate" className="cc-date-label">
                  <span className="cc-date-icon" aria-hidden="true">📅</span>
                  <span>¿Para qué fecha la quieres?</span>
                </label>
                <input
                  type="date"
                  id="ccDate"
                  className="cc-date-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <p className="cc-date-help">
                  Trabajamos con agenda limitada. Te confirmamos disponibilidad
                  al recibir tu pedido.
                </p>
              </div>

              <div className="cc-notes">
                <label htmlFor="ccNotes" className="cc-notes-label">
                  <span className="cc-notes-icon" aria-hidden="true">✏️</span>
                  <span>
                    Notas u observaciones <em>(opcional)</em>
                  </span>
                </label>
                <textarea
                  id="ccNotes"
                  className="cc-notes-input"
                  rows={3}
                  maxLength={500}
                  placeholder="Alergias, gustos, nivel de azúcar, sin frutos secos, intolerancias..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="cc-design">
                <label className="cc-notes-label" style={{ marginBottom: 4 }}>
                  <span className="cc-notes-icon" aria-hidden="true">🎨</span>
                  <span>
                    Diseño de referencia <em>(opcional)</em>
                  </span>
                </label>
                <DesignPicker value={design} onChange={setDesign} />
              </div>

              <p className="cc-finish-note">
                Tras enviar, hablaremos del{" "}
                <strong>diseño y los detalles</strong> directamente por
                WhatsApp. En menos de 24h te confirmamos disponibilidad y
                presupuesto.
              </p>
              <a
                className="btn btn-pink cc-finish"
                href={buildWA(state, date, notes, discountCode, design)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (discountCode) markCodeUsed(discountCode);
                }}
              >
                Enviar pedido por WhatsApp →
              </a>
            </section>
          )}
        </div>

        <footer className="cc-foot">
          <button
            type="button"
            className="btn btn-secondary cc-back"
            onClick={back}
            disabled={step === 1}
          >
            ← Atrás
          </button>
          <span className="cc-step-counter">
            <span>{step}</span> / 5
          </span>
          <button
            type="button"
            className="btn cc-next"
            onClick={next}
            disabled={!canNext || step === 5}
            hidden={step === 5}
          >
            Siguiente →
          </button>
        </footer>
      </div>
    </div>
  );
}

export function OpenCakeModalButton({
  children,
  className = "btn btn-pink",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  function open() {
    window.dispatchEvent(new CustomEvent("open-cake-modal"));
  }
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}
