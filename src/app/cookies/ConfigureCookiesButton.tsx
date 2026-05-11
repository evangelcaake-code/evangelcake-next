"use client";

export default function ConfigureCookiesButton() {
  return (
    <button
      type="button"
      className="btn"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("open-cookie-settings"))
      }
    >
      Configurar mis cookies
    </button>
  );
}
