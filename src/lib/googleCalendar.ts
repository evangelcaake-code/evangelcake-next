/**
 * Google Calendar — capa de acceso (implementación real, cero dependencias).
 *
 * Autenticación: service account → JWT firmado con RS256 → access token.
 * Sin googleapis (pesa ~100MB); hablamos con la API REST directamente.
 *
 * Contrato público:
 *   GCAL_CONNECTED           → true si hay credenciales configuradas
 *   getBusyForMonth(y, m)    → intervalos ocupados del mes
 *   getBusyForDate(iso)      → intervalos ocupados de un día concreto
 *   createAppointmentEvent() → crea evento y devuelve su id
 *
 * Setup (ver docs/google-calendar-setup.md):
 *   GOOGLE_CALENDAR_CONNECTED=true
 *   GOOGLE_CALENDAR_ID=...            (ID del calendario de Andreia)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL=...  (client_email del JSON)
 *   GOOGLE_SERVICE_ACCOUNT_KEY=...    (private_key del JSON, con \n)
 *
 * Nota: el service account NO puede invitar asistentes sin delegación de
 * dominio, así que el email del cliente va en la descripción del evento.
 */
import { createSign } from "crypto";

const SCOPE = "https://www.googleapis.com/auth/calendar";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

export const GCAL_CONNECTED = process.env.GOOGLE_CALENDAR_CONNECTED === "true";

export type BusyInterval = { start: string; end: string }; // ISO strings

// ── Auth: JWT → access token (cacheado hasta caducar) ────────

let cachedToken: { token: string; exp: number } | null = null;

function b64url(s: string) {
  return Buffer.from(s).toString("base64url");
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // En .env la clave viaja en una línea con \n literales — restauramos saltos.
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "").replace(/\\n/g, "\n");
  if (!email || !key) {
    throw new Error("Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_KEY en .env");
  }

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key).toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = { token: data.access_token, exp: now + (data.expires_in ?? 3600) };
  return cachedToken.token;
}

function calendarId(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error("Falta GOOGLE_CALENDAR_ID en .env");
  return id;
}

// ── Fechas Madrid (DST europeo: último domingo marzo → octubre) ──

function lastSundayUtc(y: number, month: number) {
  const d = new Date(Date.UTC(y, month + 1, 0));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  d.setUTCHours(1, 0, 0, 0);
  return d;
}
function madridOffsetMin(d: Date): number {
  const y = d.getUTCFullYear();
  return d >= lastSundayUtc(y, 2) && d < lastSundayUtc(y, 9) ? 120 : 60;
}
/**
 * "2026-07-17" + "18:00" (+addMinutes) → "2026-07-17T18:00:00+02:00"
 * La hora es hora de pared de Madrid; solo se le añade el sufijo de offset.
 */
export function madridIso(dateIso: string, time: string, addMinutes = 0): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const total = h * 60 + min + addMinutes;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const probe = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const off = madridOffsetMin(probe);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dateIso}T${pad(hh)}:${pad(mm)}:00+${pad(off / 60)}:00`;
}

// ── API pública ───────────────────────────────────────────────

async function freeBusy(timeMin: string, timeMax: string): Promise<BusyInterval[]> {
  if (!GCAL_CONNECTED) return [];
  const token = await getAccessToken();
  const id = calendarId();
  const res = await fetch(`${API}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id }] }),
  });
  if (!res.ok) throw new Error(`freeBusy ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: BusyInterval[] }>;
  };
  return data.calendars?.[id]?.busy ?? [];
}

export async function getBusyForMonth(y: number, m: number): Promise<BusyInterval[]> {
  if (!GCAL_CONNECTED) return [];
  const pad = (n: number) => String(n).padStart(2, "0");
  const first = `${y}-${pad(m + 1)}-01`;
  const next = m === 11 ? `${y + 1}-01-01` : `${y}-${pad(m + 2)}-01`;
  try {
    return await freeBusy(madridIso(first, "00:00"), madridIso(next, "00:00"));
  } catch (e) {
    console.error("[gcal] getBusyForMonth:", e);
    return [];
  }
}

export async function getBusyForDate(dateIso: string): Promise<BusyInterval[]> {
  if (!GCAL_CONNECTED) return [];
  try {
    return await freeBusy(madridIso(dateIso, "00:00"), madridIso(dateIso, "23:59"));
  } catch (e) {
    console.error("[gcal] getBusyForDate:", e);
    return [];
  }
}

/** Mueve un evento existente a un nuevo horario (al reprogramar una cita). */
export async function updateAppointmentEventTime(
  eventId: string,
  startIso: string,
  endIso: string,
): Promise<void> {
  if (!GCAL_CONNECTED || !eventId) return;
  const token = await getAccessToken();
  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(calendarId())}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        start: { dateTime: startIso, timeZone: "Europe/Madrid" },
        end: { dateTime: endIso, timeZone: "Europe/Madrid" },
      }),
    },
  );
  if (!res.ok) throw new Error(`event patch ${res.status}: ${await res.text()}`);
}

export async function createAppointmentEvent(opts: {
  summary: string;
  description: string;
  startIso: string;   // "2026-07-17T18:00:00+02:00"
  endIso: string;
  attendeeEmail?: string;
}): Promise<{ eventId: string | null; htmlLink: string | null }> {
  if (!GCAL_CONNECTED) return { eventId: null, htmlLink: null };
  const token = await getAccessToken();
  const description = opts.attendeeEmail
    ? `${opts.description}\n\nEmail del cliente: ${opts.attendeeEmail}`
    : opts.description;
  const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId())}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: opts.summary,
      description,
      start: { dateTime: opts.startIso, timeZone: "Europe/Madrid" },
      end: { dateTime: opts.endIso, timeZone: "Europe/Madrid" },
      reminders: { useDefault: true },
    }),
  });
  if (!res.ok) throw new Error(`event insert ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { id?: string; htmlLink?: string };
  return { eventId: data.id ?? null, htmlLink: data.htmlLink ?? null };
}
