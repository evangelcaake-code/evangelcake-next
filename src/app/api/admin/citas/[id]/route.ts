/**
 * PATCH /api/admin/citas/[id]
 *
 * Body (uno u otro, o ambos):
 *   { status: "pending" | "confirmed" | "vino" | "no_vino" | "cancelada" }
 *   { appointment_date: "YYYY-MM-DD", appointment_slot: "HH:MM" }   ← reprogramar
 *
 * Efectos:
 *   - status → "confirmed": manda el email de confirmación al cliente (si dejó email).
 *   - reprogramar: comprueba conflicto con otras citas y MUEVE el evento
 *     de Google Calendar vinculado.
 */
import { NextRequest, NextResponse, after } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { madridIso, updateAppointmentEventTime } from "@/lib/googleCalendar";
import { sendCitaConfirmada } from "@/lib/emails/citaConfirmada";

const VALID_STATUSES = ["pending", "confirmed", "vino", "no_vino", "cancelada"] as const;
type Status = (typeof VALID_STATUSES)[number];

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const sb = getSupabaseAdmin();

    // ── Fila actual (necesaria para mover el evento / mandar email) ──
    const { data: current, error: curErr } = await sb
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (curErr) {
      console.error("[admin citas patch] fetch:", curErr);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};

    // ── Cambio de estado ──────────────────────────────────────
    let status: Status | null = null;
    if (body.status !== undefined) {
      status = String(body.status) as Status;
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
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
        return NextResponse.json({ error: "Fecha no válida" }, { status: 400 });
      }
      if (!/^\d{2}:\d{2}$/.test(targetSlot)) {
        return NextResponse.json({ error: "Hora no válida" }, { status: 400 });
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
        return NextResponse.json(
          { error: "Ese hueco choca con otra cita — elige otra hora." },
          { status: 409 },
        );
      }
      patch.appointment_date = targetDate;
      patch.appointment_slot = targetSlot;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada que cambiar" }, { status: 400 });
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
        return NextResponse.json(
          { error: "Ese hueco ya está ocupado por otra cita." },
          { status: 409 },
        );
      }
      console.error("[admin citas patch]", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
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
          console.error("[admin citas patch] mover evento GCal:", e);
        }
      }
      // Email de confirmación al cliente — solo al pasar a "confirmed"
      if (status === "confirmed" && current.status !== "confirmed") {
        await sendCitaConfirmada(updated);
      }
    });

    return NextResponse.json({ ok: true, cita: { id: updated.id, status: updated.status, appointment_date: updated.appointment_date, appointment_slot: updated.appointment_slot } });
  } catch (e) {
    console.error("[admin citas patch]", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
