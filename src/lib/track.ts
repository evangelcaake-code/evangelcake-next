/**
 * Helper cliente para mandar eventos de analytics a /api/track.
 * Fire-and-forget: no espera respuesta, no rompe nada si falla.
 * Usa sendBeacon cuando está disponible (sobrevive al unload de página).
 */

const VISITOR_KEY = "evangelcake_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      // ID anónimo, no PII. 16 hex chars.
      id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function getEmail(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const e = localStorage.getItem("evangelcake_email");
    return e || undefined;
  } catch {
    return undefined;
  }
}

export type TrackEvent =
  | "page_view"
  | "popup_shown"
  | "popup_dismissed"
  | "popup_converted"
  | "newsletter_signup"
  | "game_start"
  | "game_complete"
  | "lead_submit"
  | "configurator_open"
  | "cake_modal_open"
  | "cta_click";

export function track(
  eventType: TrackEvent,
  options: { page?: string; meta?: Record<string, unknown>; email?: string } = {},
): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    event_type: eventType,
    page: options.page ?? window.location.pathname,
    visitor_id: getVisitorId(),
    email: options.email ?? getEmail(),
    meta: options.meta ?? null,
  });

  // sendBeacon es la forma "correcta" — funciona aún si la página se cierra.
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }
  } catch {}

  // Fallback fetch sin esperar respuesta.
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
