/**
 * Helpers para recordar el email del suscriptor en el navegador.
 * - Lo usan TODOS los formularios de newsletter (popup, home, footer, blog).
 * - El componente <Game /> lo lee para precargar el campo de email
 *   y marcar el consent (ya nos lo dieron antes).
 */

const EMAIL_KEY = "evangelcake_email";

export function saveSubscribedEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EMAIL_KEY, email.toLowerCase().trim());
  } catch {}
}

export function getSubscribedEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}
