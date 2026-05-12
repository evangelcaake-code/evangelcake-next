"use client";

import { useEffect, useRef, useState } from "react";
import { markCodeUsed } from "@/lib/markCodeUsed";
import DesignPicker, { type DesignSelection } from "@/components/DesignPicker";

type Size = {
  value: string;
  display: string;
  px: string;
  price: string;
  rellenos: 1 | 2;
  consult?: boolean;
};

const SIZES: Size[] = [
  { value: "4–6 personas", display: "4–6", px: "personas", price: "desde 42€", rellenos: 1 },
  { value: "6–8 personas", display: "6–8", px: "personas", price: "desde 48€", rellenos: 1 },
  { value: "8–10 personas", display: "8–10", px: "personas", price: "desde 52€", rellenos: 2 },
  { value: "10–12 personas", display: "10–12", px: "personas", price: "desde 58€", rellenos: 2 },
  { value: "15–18 personas", display: "15–18", px: "personas", price: "desde 75€", rellenos: 2 },
  { value: "20 personas", display: "20", px: "personas", price: "desde 85€", rellenos: 2 },
  { value: "22–25 personas", display: "22–25", px: "personas", price: "desde 100€", rellenos: 2 },
  { value: "30–35 personas", display: "30–35", px: "personas", price: "desde 140€", rellenos: 2 },
  { value: "40–45 personas", display: "40–45", px: "personas", price: "a consultar", rellenos: 2, consult: true },
  { value: "50–55 personas", display: "50–55", px: "personas", price: "a consultar", rellenos: 2, consult: true },
];

const BIZCOCHOS = ["Vainilla", "Red Velvet", "Chocolate"];

const RELLENOS = [
  "Chocolate", "Vainilla", "Nutella", "Pistacho", "Fresa", "Lotus",
  "Tres Leches", "Kinder", "Oreo", "Piña", "Dulce de Leche", "Trufa",
  "Maracuyá", "Nata", "Queso crema", "Coco", "Frutos Rojos", "Chocolate blanco",
];

const COBERTURAS = [
  "Chantilly (nata)", "Trufa", "Buttercream",
  "Naked Cake", "Drip de chocolate", "Ganache de chocolate",
];

type Selection = {
  raciones: string;
  bizcocho: string;
  rellenos: string[];
  cobertura: string;
};

const EMPTY: Selection = { raciones: "", bizcocho: "", rellenos: [], cobertura: "" };

function maxRellenos(s: Selection): 1 | 2 {
  const found = SIZES.find((x) => x.value === s.raciones);
  return found?.rellenos ?? 1;
}

function buildWhatsAppLink(
  s: Selection,
  date: string,
  notes: string,
  code: string,
  design: DesignSelection,
): string {
  const rellenoLine =
    s.rellenos.length === 2
      ? `✨ Rellenos: ${s.rellenos[0]} + ${s.rellenos[1]}`
      : `✨ Relleno: ${s.rellenos[0] || ""}`;
  const lines = [
    "Hola! Quiero personalizar una tarta con estas opciones:",
    "",
    `👥 Raciones: ${s.raciones}`,
    `🎂 Bizcocho: ${s.bizcocho}`,
    rellenoLine,
    `🍓 Cobertura: ${s.cobertura}`,
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
  // Diseño de referencia: foto de la galería, foto subida o descripción
  if (design) {
    lines.push("");
    if (design.kind === "gallery") {
      const site = (typeof window !== "undefined" ? window.location.origin : "https://evangelcake.com");
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

export default function CakeConfigurator() {
  const [sel, setSel] = useState<Selection>(EMPTY);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [design, setDesign] = useState<DesignSelection>(null);
  const cartToggleRef = useRef<HTMLDivElement | null>(null);

  const maxFills = maxRellenos(sel);

  // Aplicar código si viene en la URL (?code=XXXX) o si quedó guardado de antes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    if (urlCode && /^\d{4}$|^[A-Z0-9-]{4,16}$/.test(urlCode)) {
      setDiscountCode(urlCode);
      localStorage.setItem(CODE_LS_KEY, urlCode);
      // Abrir el carrito automáticamente para que vean que se ha aplicado
      setCartOpen(true);
      // Quitar el code de la URL para que un refresh no lo vuelva a procesar
      const u = new URL(window.location.href);
      u.searchParams.delete("code");
      window.history.replaceState({}, "", u.toString());
      return;
    }
    const saved = localStorage.getItem(CODE_LS_KEY);
    if (saved) setDiscountCode(saved);
  }, []);

  function removeCode() {
    setDiscountCode("");
    try {
      localStorage.removeItem(CODE_LS_KEY);
    } catch {}
  }

  useEffect(() => {
    if (sel.rellenos.length > maxFills) {
      setSel((s) => ({ ...s, rellenos: s.rellenos.slice(0, maxFills) }));
    }
  }, [maxFills, sel.rellenos.length]);

  function bumpCart() {
    setBumping(true);
    setTimeout(() => setBumping(false), 500);
  }

  function flyToCart(originEl: HTMLElement, label: string) {
    const target = cartToggleRef.current;
    if (!target) return;
    const o = originEl.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.className = "cart-fly";
    ghost.textContent = label;
    ghost.style.left = `${o.left + o.width / 2}px`;
    ghost.style.top = `${o.top + o.height / 2}px`;
    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      const tx = t.left + t.width / 2 - (o.left + o.width / 2);
      const ty = t.top + t.height / 2 - (o.top + o.height / 2);
      ghost.style.transform = `translate(${tx}px, ${ty}px) scale(0.3)`;
      ghost.style.opacity = "0";
    });
    setTimeout(() => ghost.remove(), 700);
    bumpCart();
  }

  function pickRaciones(value: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (sel.raciones === value) {
      setSel((s) => ({ ...s, raciones: "" }));
      return;
    }
    setSel((s) => ({ ...s, raciones: value }));
    flyToCart(e.currentTarget, value);
  }
  function pickBizcocho(value: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (sel.bizcocho === value) {
      setSel((s) => ({ ...s, bizcocho: "" }));
      return;
    }
    setSel((s) => ({ ...s, bizcocho: value }));
    flyToCart(e.currentTarget, value);
  }
  function toggleRelleno(value: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (sel.rellenos.includes(value)) {
      setSel((s) => ({ ...s, rellenos: s.rellenos.filter((r) => r !== value) }));
      return;
    }
    if (sel.rellenos.length >= maxFills) {
      if (maxFills === 1) {
        setSel((s) => ({ ...s, rellenos: [value] }));
        flyToCart(e.currentTarget, value);
        return;
      }
      setShakeKey(value);
      setTimeout(() => setShakeKey(null), 400);
      return;
    }
    setSel((s) => ({ ...s, rellenos: [...s.rellenos, value] }));
    flyToCart(e.currentTarget, value);
  }
  function pickCobertura(value: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (sel.cobertura === value) {
      setSel((s) => ({ ...s, cobertura: "" }));
      return;
    }
    setSel((s) => ({ ...s, cobertura: value }));
    flyToCart(e.currentTarget, value);
  }
  function clear() {
    setSel(EMPTY);
    setDate("");
    setNotes("");
    setDesign(null);
    setClearing(true);
    setTimeout(() => setClearing(false), 500);
  }

  const filled =
    (sel.raciones ? 1 : 0) +
    (sel.bizcocho ? 1 : 0) +
    (sel.rellenos.length ? 1 : 0) +
    (sel.cobertura ? 1 : 0);
  const complete = filled === 4;
  const waHref = buildWhatsAppLink(sel, date, notes, discountCode, design);

  return (
    <>
      <section className="section tp-config" id="sabores" aria-labelledby="cfg-title">
        <div className="section-head">
          <h2 id="cfg-title">
            Configura <em>tu tarta.</em>
          </h2>
          <p className="section-sub">
            Click en cada opción para añadirla al carrito. El carrito flotante
            te resume tu pedido y abre WhatsApp cuando termines.
          </p>
        </div>

        <div className="cfg-block" id="bRaciones">
          <div className="cfg-block-head">
            <span className="cfg-num">01</span>
            <div>
              <h3>Personas / Tamaño</h3>
              <span className="cfg-help">¿Para cuántas personas?</span>
            </div>
          </div>
          <div className="cfg-grid cfg-grid-sizes">
            {SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`cfg-size${s.consult ? " cfg-size-consult" : ""}${sel.raciones === s.value ? " selected" : ""}`}
                onClick={(e) => pickRaciones(s.value, e)}
              >
                <span className="cfg-size-num">{s.display}</span>
                <span className="cfg-size-px">{s.px}</span>
                <span className="cfg-size-price">{s.price}</span>
                {s.rellenos === 2 && (
                  <span className="cfg-size-tag">+ 2 sabores</span>
                )}
              </button>
            ))}
          </div>

          <div className="cfg-prices-note">
            <div className="prices-note-icon" aria-hidden="true">★</div>
            <div className="prices-note-content">
              <strong>Sobre los precios</strong>
              <p>
                Estos precios <strong>incluyen</strong> decoraciones con
                figuras de oblea (comestible) o fotografía personalizada en
                oblea. <strong>Pueden tener coste extra:</strong> piezas en
                fondant, formato corazón, cobertura merengue o buttercream,
                colores intensos, más de 2 colores, piezas acrílicas o
                decorativas, etc.
              </p>
              <p className="prices-note-handcraft">
                Trabajamos cada pedido de forma individual para asegurar
                calidad y detalle.
              </p>
            </div>
          </div>

          <p className="cfg-extra">
            ¿Más de 55 personas?{" "}
            <a
              href="https://wa.me/34624131348?text=Hola!%20Necesito%20una%20tarta%20para%20m%C3%A1s%20de%2055%20personas"
              target="_blank"
              rel="noopener noreferrer"
            >
              Háblanos directamente →
            </a>
          </p>
        </div>

        <div className="cfg-block">
          <div className="cfg-block-head">
            <span className="cfg-num">02</span>
            <div>
              <h3>Bizcocho</h3>
              <span className="cfg-help">La base de tu tarta</span>
            </div>
          </div>
          <div className="cfg-grid cfg-grid-3">
            {BIZCOCHOS.map((b) => (
              <button
                key={b}
                type="button"
                className={`cfg-card${sel.bizcocho === b ? " selected" : ""}`}
                onClick={(e) => pickBizcocho(b, e)}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="cfg-extra">
            ¿Quieres otro bizcocho?{" "}
            <a
              href="https://wa.me/34624131348?text=Hola!%20Quer%C3%ADa%20preguntar%20por%20otros%20bizcochos%20fuera%20de%20la%20carta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbenos por WhatsApp →
            </a>
          </p>
        </div>

        <div className="cfg-block">
          <div className="cfg-block-head">
            <span className="cfg-num">03</span>
            <div>
              <h3>Relleno</h3>
              <span className="cfg-help">
                Click para añadir, otra vez para quitar. Hasta {maxFills}{" "}
                {maxFills === 1 ? "sabor" : "sabores"} con tu tamaño actual.
              </span>
            </div>
          </div>
          <div className="cfg-grid cfg-chips">
            {RELLENOS.map((r) => {
              const idx = sel.rellenos.indexOf(r);
              return (
                <button
                  key={r}
                  type="button"
                  className={`cfg-chip${idx >= 0 ? " selected" : ""}${shakeKey === r ? " cart-shake" : ""}`}
                  data-order={idx >= 0 ? idx + 1 : undefined}
                  onClick={(e) => toggleRelleno(r, e)}
                >
                  {r}
                  {r === "Maracuyá" && <span className="chip-tag">BR</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cfg-block">
          <div className="cfg-block-head">
            <span className="cfg-num">04</span>
            <div>
              <h3>Cobertura</h3>
              <span className="cfg-help">El acabado exterior</span>
            </div>
          </div>
          <div className="cfg-grid cfg-grid-3">
            {COBERTURAS.map((c) => (
              <button
                key={c}
                type="button"
                className={`cfg-card cfg-card-gold${sel.cobertura === c ? " selected" : ""}`}
                onClick={(e) => pickCobertura(c, e)}
              >
                {c.includes("(") ? (
                  <>
                    {c.split(" (")[0]}{" "}
                    <span className="cfg-card-sub">
                      ({c.split("(")[1]}
                    </span>
                  </>
                ) : (
                  c
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="cfg-cta">
          <button
            type="button"
            className="btn btn-pink"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-cake-modal"))
            }
          >
            Personaliza tu tarta paso a paso →
          </button>
          <p className="cfg-cta-note">
            ¿Prefieres ir guiado? Abre el asistente con todo el flujo en una
            minipágina focalizada.
          </p>
        </div>
      </section>

      <aside
        className={`builder-cart${filled > 0 ? " visible" : ""}${complete ? " ready" : ""}`}
        aria-label="Tu pedido"
      >
        <div
          ref={cartToggleRef}
          className={`cart-toggle${bumping ? " bumping" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Ver tu tarta"
          onClick={() => setCartOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCartOpen((o) => !o);
            }
          }}
        >
          <div className="cart-icon">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M4 6h2l1.5 9h10l1.5-7H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            <span className="cart-badge">{filled}</span>
          </div>
          <div className="cart-toggle-label">
            <strong>Tu tarta</strong>
            <span>{filled}/4 elegidas</span>
          </div>
        </div>
        <div className={`cart-panel${cartOpen ? " open" : ""}`} hidden={!cartOpen}>
          <header className="cart-head">
            <h4>Tu tarta personalizada</h4>
            <button
              type="button"
              className="cart-close"
              aria-label="Cerrar"
              onClick={() => setCartOpen(false)}
            >
              ×
            </button>
          </header>
          <ul className="cart-list">
            <li className={sel.raciones ? "done" : ""}>
              <span className="cart-label">Raciones</span>
              <span className="cart-value">{sel.raciones || "—"}</span>
            </li>
            <li className={sel.bizcocho ? "done" : ""}>
              <span className="cart-label">Bizcocho</span>
              <span className="cart-value">{sel.bizcocho || "—"}</span>
            </li>
            <li className={sel.rellenos.length ? "done" : ""}>
              <span className="cart-label">Relleno</span>
              <span className="cart-value">
                {sel.rellenos.length ? sel.rellenos.join(" + ") : "—"}
              </span>
            </li>
            <li className={sel.cobertura ? "done" : ""}>
              <span className="cart-label">Cobertura</span>
              <span className="cart-value">{sel.cobertura || "—"}</span>
            </li>
          </ul>

          {discountCode && (
            <div className="cart-code-box" role="status">
              <div className="cart-code-info">
                <span className="cart-code-icon" aria-hidden="true">🎁</span>
                <div>
                  <strong>Código activo · −5%</strong>
                  <span className="cart-code-value">{discountCode}</span>
                </div>
              </div>
              <button
                type="button"
                className="cart-code-remove"
                onClick={removeCode}
                aria-label="Quitar código de descuento"
              >
                ×
              </button>
            </div>
          )}

          <div className="cart-date">
            <label htmlFor="cartDate" className="cart-date-label">
              <span className="cart-date-icon" aria-hidden="true">📅</span>
              <span>¿Para qué fecha la quieres?</span>
            </label>
            <input
              type="date"
              id="cartDate"
              className="cart-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="cart-date-help">
              Trabajamos con agenda limitada. Te confirmamos disponibilidad al
              recibir tu pedido.
            </p>
          </div>

          <div className="cart-notes">
            <label htmlFor="cartNotes" className="cart-notes-label">
              <span className="cart-notes-icon" aria-hidden="true">✏️</span>
              <span>
                Notas u observaciones <em>(opcional)</em>
              </span>
            </label>
            <textarea
              id="cartNotes"
              className="cart-notes-input"
              rows={3}
              maxLength={500}
              placeholder="Alergias, gustos, nivel de azúcar, sin frutos secos, intolerancias..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="cart-design">
            <label className="cart-notes-label" style={{ marginBottom: 4 }}>
              <span className="cart-notes-icon" aria-hidden="true">🎨</span>
              <span className="cart-notes-text">
                Diseño de referencia <em>(opcional)</em>
              </span>
            </label>
            <DesignPicker value={design} onChange={setDesign} />
          </div>

          <div className="cart-actions">
            <button
              type="button"
              className={`cart-clear${clearing ? " clearing" : ""}`}
              onClick={clear}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 6h18 M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2 M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" />
              </svg>
              <span>Vaciar carrito</span>
            </button>
            {complete ? (
              <a
                className="btn btn-pink cart-finish"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (discountCode) markCodeUsed(discountCode);
                }}
              >
                Pedir por WhatsApp →
              </a>
            ) : (
              <button
                type="button"
                className="btn btn-pink cart-finish disabled"
                disabled
              >
                Pedir por WhatsApp →
              </button>
            )}
          </div>
          <p className="cart-foot-note">
            Completa las 4 elecciones para activar el botón.
          </p>
        </div>
      </aside>
    </>
  );
}
