/**
 * GET /api/citas/slots
 *
 * Query:
 *   - month=YYYY-MM  → devuelve el mapa de días del mes con status.
 *   - date=YYYY-MM-DD → devuelve la lista de slots (huecos) de ese día.
 *   - duration=20|45 — duración de la cita solicitada (para calcular solapes).
 *
 * Respuesta:
 *   { days: [{ date, status: 'available' | 'full' | 'closed' }],
 *     slots?: { [date]: [{ time, taken }] } }
 *
 * Ocupación real = citas guardadas en Supabase (pending/confirmed)
 *                + free/busy de Google Calendar (cuando esté conectado).
 * Una cita de 45 min bloquea también los slots que pisa.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getBusyForMonth, getBusyForDate } from "@/lib/googleCalendar";

// Horario del obrador — ajustar cuando confirmen el definitivo.
// Clave = día de la semana con 0 = Lunes. Valor = franjas horarias.
type Range = { from: string; to: string; step: number };
const SCHEDULE: Record<number, Range[]> = {
  0: [],                                                              // Lun cerrado
  1: [{ from: "10:00", to: "14:00", step: 30 }, { from: "18:00", to: "20:00", step: 30 }], // Mar
  2: [{ from: "10:00", to: "14:00", step: 30 }],                      // Mié
  3: [{ from: "12:00", to: "14:00", step: 30 }, { from: "18:00", to: "20:00", step: 30 }], // Jue
  4: [{ from: "10:00", to: "14:00", step: 30 }],                      // Vie
  5: [],                                                              // Sáb solo entregas
  6: [],                                                              // Dom cerrado
};

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dayOfWeekMonFirst(d: Date) {
  return (d.getDay() + 6) % 7; // 0 = Lunes
}
function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function times(range: Range): string[] {
  const out: string[] = [];
  const start = toMin(range.from);
  const end = toMin(range.to);
  for (let t = start; t + range.step <= end; t += range.step) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

/** Intervalos ocupados (minutos desde medianoche) por fecha. */
type BusyLocal = { startMin: number; endMin: number };

async function getBookedIntervals(fromIso: string, toIso: string): Promise<Record<string, BusyLocal[]>> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("appointments")
    .select("appointment_date, appointment_slot, duration_min")
    .gte("appointment_date", fromIso)
    .lte("appointment_date", toIso)
    .in("status", ["pending", "confirmed"]);
  if (error) {
    // Ante la duda, no bloqueamos la agenda entera — log y seguimos.
    console.error("[citas slots] error leyendo appointments:", error);
    return {};
  }
  const map: Record<string, BusyLocal[]> = {};
  for (const a of data ?? []) {
    const start = toMin(a.appointment_slot);
    (map[a.appointment_date] ??= []).push({
      startMin: start,
      endMin: start + (a.duration_min || 20),
    });
  }
  return map;
}

function overlapsAny(slotStart: number, slotEnd: number, busy: BusyLocal[]): boolean {
  return busy.some((b) => slotStart < b.endMin && slotEnd > b.startMin);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");   // YYYY-MM
  const date = searchParams.get("date");     // YYYY-MM-DD
  const duration = Math.max(15, Math.min(90, Number(searchParams.get("duration") ?? "20") || 20));

  // Rama día concreto → devolver slots
  if (date) {
    const [booked, gcalBusy] = await Promise.all([
      getBookedIntervals(date, date),
      getBusyForDate(date),
    ]);
    const dayBusy = [
      ...(booked[date] ?? []),
      ...gcalBusy.map((b) => ({
        startMin: minutesOfDay(new Date(b.start)),
        endMin: minutesOfDay(new Date(b.end)),
      })),
    ];
    const d = new Date(date + "T00:00:00");
    const ranges = SCHEDULE[dayOfWeekMonFirst(d)] ?? [];
    const slots = ranges.flatMap(times).map((time) => {
      const s = toMin(time);
      return { time, taken: overlapsAny(s, s + duration, dayBusy) };
    });
    return NextResponse.json({ days: [], slots: { [date]: slots } });
  }

  // Rama mes → devolver estado de cada día
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const firstIso = `${month}-01`;
    const lastIso = `${month}-${String(daysInMonth).padStart(2, "0")}`;
    const [booked, gcalBusy] = await Promise.all([
      getBookedIntervals(firstIso, lastIso),
      getBusyForMonth(y, m - 1),
    ]);
    // Reparte busy de GCal por día (simplificación: solo eventos intra-día)
    for (const b of gcalBusy) {
      const start = new Date(b.start);
      const key = isoDay(start);
      (booked[key] ??= []).push({
        startMin: minutesOfDay(start),
        endMin: minutesOfDay(new Date(b.end)),
      });
    }

    const today = isoDay(new Date());
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m - 1, day);
      const iso = isoDay(d);
      if (iso < today) {
        days.push({ date: iso, status: "closed" as const });
        continue;
      }
      const ranges = SCHEDULE[dayOfWeekMonFirst(d)] ?? [];
      if (ranges.length === 0) {
        days.push({ date: iso, status: "closed" as const });
        continue;
      }
      const dayBusy = booked[iso] ?? [];
      const allTaken = ranges.flatMap(times).every((time) => {
        const s = toMin(time);
        return overlapsAny(s, s + duration, dayBusy);
      });
      days.push({ date: iso, status: allTaken ? ("full" as const) : ("available" as const) });
    }
    return NextResponse.json({ days });
  }

  return NextResponse.json({ error: "Falta ?month=YYYY-MM o ?date=YYYY-MM-DD" }, { status: 400 });
}

// Minutos desde medianoche EN MADRID — el servidor (Vercel) corre en UTC,
// así que getHours() a pelo desplazaría los bloqueos 1-2 horas.
const madridFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: "Europe/Madrid",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
function minutesOfDay(d: Date) {
  const parts = madridFmt.formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}
