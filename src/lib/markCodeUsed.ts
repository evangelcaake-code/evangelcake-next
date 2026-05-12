/**
 * Marca un código de descuento como "usado" llamando a /api/codes/use.
 * Pensado para llamarse justo antes de redirigir al usuario a WhatsApp
 * (al pulsar "Pedir por WhatsApp" en el configurador o el modal).
 *
 * Usa navigator.sendBeacon cuando está disponible para que la petición
 * sobreviva a la navegación / cierre de pestaña. Fire-and-forget — si falla,
 * el admin siempre puede marcarlo a mano desde el dashboard.
 */
export function markCodeUsed(code: string): void {
  if (!code || typeof window === "undefined") return;
  const payload = JSON.stringify({ code });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/codes/use", blob);
      return;
    }
  } catch {}
  fetch("/api/codes/use", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
