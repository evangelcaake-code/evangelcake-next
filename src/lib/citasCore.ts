/**
 * Lógica central de gestión de citas — compartida por:
 *   - /api/admin/citas/[id]    (panel embebido, auth por cookie de admin)
 *   - /api/sistema/citas/*     (SOP interno, auth por Bearer token)
 *
 * IMPORTANTE: los efectos secundarios viven AQUÍ y solo aquí:
 *   - status → "confirmed": email de confirmación al cliente (si dejó email)
 *   - reprogramar: mueve el evento vinculado de Google Calendar
 * Nadie debe escribir en la tabla `appointments` directamente — siempre
 * a través de estas funciones (o de sus endpoints), o los efectos se pierden.
 */
import { after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { madridIso, updateAppointmentEventTime } from "@/lib/googleCalendar";
import { sendCitaConfirmada } from "@/lib/emails/citaConfirmada";

export const VALID_STATUSES = ["pending", "confirmed", "vino", "no_vino", "cancelada"] as const;
export type CitaStatus = (typeof VALID_STATUSES)[number];

export type CitaPatchBody = {
  status?: string;
  appointment_date?: string; // YYYY-MM-DD
  appointment_slot?: string; // HH:MM
};

export type CitaPatchResult = {
  httpStatus: number;
  body: Record<string, unknown>;
};

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Lista citas en un rango de fechas (ambos inclusive). */
export async function listCitas(fromIso: string, toIso: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("appointments")
    .select("*")
    .gte("appointment_date", fromIso)
    .lte("appointment_date", toIso)
    .order("appointment_date", { ascending: true })
    .order("appointment_slot", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Aplica un cambio a una cita (estado y/o reprogramación) con todas las
 * reglas de negocio y efectos secundarios. Devuelve el status HTTP y el body.
 */
export async function applyCitaPatch(id: string, body: CitaPatchBody): Promise<CitaPatchResult> {
  const sb = getSupabaseAdmin();

  // ── Fila actual (necesaria para mover el evento / mandar email) ──
  const { data: current, error: curErr } = await sb
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (curErr) {
    console.error("[citasCore] fetch:", curErr);
    return { httpStatus: 500, body: { error: "DB error" } };
  }
  if (!current) {
    return { httpStatus: 404, body: { error: "Cita no encontrada" } };
  }

  const patch: Record<string, unknown> = {};

  // ── Cambio de estado ──────────────────────────────────────
  let status: CitaStatus | null = null;
  if (body.status !== undefined) {
    status = String(body.status) as CitaStatus;
    if (!VALID_STATUSES.includes(status)) {
      return { httpStatus: 400, body: { error: "Estado no válido" } };
    }
    patch.status = status;
  }

  // ── Reprogramación (fecha y/u hora nuevas) ────────────────
  const newDate = body.appointment_date !== undefined ? String(body.appointment_date) : null;
  const newSlot = body.appointment_slot !== undefined ? String(body.appointment_slot) : null;
  const rescheduling = newDate !== null || newSlot !== null;
  const targetDate = newDate ?? current.appointment_date;
  const targetSlot = newSlot ?? current.appointment_slot;

  if (rescheduling) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return { httpStatus: 400, body: { error: "Fecha no válida" } };
    }
    if (!/^\d{2}:\d{2}$/.test(targetSlot)) {
      return { httpStatus: 400, body: { error: "Hora no válida" } };
    }

    // Conflicto con otras citas vivas de ese día (solape por duración)
    const { data: sameDay } = await sb
      .from("appointments")
      .select("id, appointment_slot, duration_min")
      .eq("appointment_date", targetDate)
      .in("status", ["pending", "confirmed"])
      .neq("id", id);
    const s0 = toMin(targetSlot);
    const e0 = s0 + (current.duration_min || 20);
    const conflict = (sameDay ?? []).some((a) => {
      const s = toMin(a.appointment_slot);
      const e = s + (a.duration_min || 20);
      return s0 < e && e0 > s;
    });
    if (conflict) {
      return { httpStatus: 409, body: { error: "Ese hueco choca con otra cita — elige otra hora." } };
    }
    patch.appointment_date = targetDate;
    patch.appointment_slot = targetSlot;
  }

  if (Object.keys(patch).length === 0) {
    return { httpStatus: 400, body: { error: "Nada que cambiar" } };
  }

  // ── Aplicar ───────────────────────────────────────────────
  const { data: updated, error } = await sb
    .from("appointments")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return { httpStatus: 409, body: { error: "Ese hueco ya está ocupado por otra cita." } };
    }
    console.error("[citasCore] update:", error);
    return { httpStatus: 500, body: { error: "DB error" } };
  }
  if (!updated) {
    return { httpStatus: 404, body: { error: "Cita no encontrada" } };
  }

  // ── Trabajo lento tras responder ──────────────────────────
  after(async () => {
    // Mover el evento de Google Calendar si se reprogramó
    if (rescheduling && updated.gcal_event_id) {
      try {
        await updateAppointmentEventTime(
          updated.gcal_event_id,
          madridIso(targetDate, targetSlot),
          madridIso(targetDate, targetSlot, updated.duration_min || 20),
        );
      } catch (e) {
        console.error("[citasCore] mover evento GCal:", e);
      }
    }
    // Email de confirmación al cliente — solo al pasar a "confirmed"
    if (status === "confirmed" && current.status !== "confirmed") {
      await sendCitaConfirmada(updated);
    }
  });

  return {
    httpStatus: 200,
    body: {
      ok: true,
      cita: {
        id: updated.id,
        status: updated.status,
        appointment_date: updated.appointment_date,
        appointment_slot: updated.appointment_slot,
      },
    },
  };
}
