"use client";

/**
 * Cajita de código de descuento usada en CakeConfigurator (carrito) y
 * CakeModal (paso a paso). Dos estados:
 *
 *   • Vacío  → input compacto "¿Tienes un código?" + botón Aplicar
 *   • Activo → muestra el código aplicado + botón × para quitarlo
 *
 * Validación local: 4 dígitos numéricos (formato actual del welcome email)
 * o el formato legacy alfanumérico de 4-16 chars. No consulta el backend —
 * la validación real ocurre cuando la pastelera lo canjea.
 */
import { useState } from "react";

const CODE_REGEX = /^\d{4}$|^[A-Z0-9-]{4,16}$/;

interface Props {
  /** Código actualmente activo (vacío si no hay) */
  value: string;
  /** Llamado al aplicar uno nuevo o quitar el existente (con "") */
  onChange: (code: string) => void;
}

export default function DiscountCodeBox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  if (value) {
    return (
      <div className="cart-code-box" role="status">
        <div className="cart-code-info">
          <span className="cart-code-icon" aria-hidden="true">🎁</span>
          <div>
            <strong>Código activo · −5%</strong>
            <span className="cart-code-value">{value}</span>
          </div>
        </div>
        <button
          type="button"
          className="cart-code-remove"
          onClick={() => onChange("")}
          aria-label="Quitar código de descuento"
        >
          ×
        </button>
      </div>
    );
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const code = input.trim().toUpperCase();
    if (!CODE_REGEX.test(code)) {
      setError("Pon el código de 4 dígitos que te llegó al email.");
      return;
    }
    setError("");
    setInput("");
    onChange(code);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="cart-code-trigger"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">🎁</span>
        <span>¿Tienes un código de descuento?</span>
        <span className="cart-code-trigger-arrow" aria-hidden="true">+</span>
      </button>
    );
  }

  return (
    <form className="cart-code-form" onSubmit={apply}>
      <label htmlFor="discountCodeInput" className="cart-code-form-label">
        <span aria-hidden="true">🎁</span>
        <span>Código de bienvenida (4 dígitos)</span>
      </label>
      <div className="cart-code-form-row">
        <input
          id="discountCodeInput"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={16}
          placeholder="1234"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
        />
        <button
          type="submit"
          className="btn btn-pink cart-code-apply"
          disabled={!input.trim()}
        >
          Aplicar
        </button>
      </div>
      {error && <p className="cart-code-error">{error}</p>}
      <p className="cart-code-hint">
        Es el código que te llegó al suscribirte. También puedes cerrar y
        seguir sin código.
      </p>
      <button
        type="button"
        className="cart-code-close"
        onClick={() => {
          setOpen(false);
          setInput("");
          setError("");
        }}
      >
        Cerrar
      </button>
    </form>
  );
}
