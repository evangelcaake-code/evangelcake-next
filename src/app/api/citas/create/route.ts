/**
 * POST /api/citas/create
 *
 * Crea una cita en Supabase (tabla `appointments`) y responde al momento.
 * Después de responder (via after()) hace el trabajo lento:
 *   1. Crea el evento en Google Calendar (si está conectado).
 *   2. Manda aviso interno al equipo (APPOINTMENTS_NOTIFY_TO).
 *
 * OJO: al cliente NO se le manda email aquí. Su email de confirmación sale
 * cuando el equipo pulsa "✓ Confirmar" en el panel (PATCH /api/admin/citas).
 *
 * Body esperado — ver PedirCitaWizard.tsx (submit()).
 */
import { NextRequest, NextResponse, after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createAppointmentEvent, madridIso } from "@/lib/googleCalendar";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Validación mínima ─────────────────────────────────────
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const phone = String(body.phone || "").trim();
    const appointmentDate = String(body.appointmentDate || "").trim();
    const appointmentSlot = String(body.appointmentSlot || "").trim();
    const type = String(body.type || "").trim();
    const typeLabel = String(body.typeLabel || "").trim();
    const duration = Number(body.duration) || 20;
    const premium = Boolean(body.premium);

    if (name.length < 2) return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    // Email opcional — si viene, tiene que ser válido.
    if (email && !EMAIL_REGEX.test(email)) return NextResponse.json({ error: "Email no válido" }, { status: 400 });
    if (!/^[0-9+ ]{7,}$/.test(phone)) return NextResponse.json({ error: "Teléfono no válido" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) return NextResponse.json({ error: "Fecha de la cita no válida" }, { status: 400 });
    if (!/^\d{2}:\d{2}$/.test(appointmentSlot)) return NextResponse.json({ error: "Hora de la cita no válida" }, { status: 400 });

    // Antelación mínima del encargo (misma regla que el wizard: 5 días).
    if (body.eventDate && /^\d{4}-\d{2}-\d{2}$/.test(String(body.eventDate))) {
      const min = new Date(Date.now() + 5 * 86400000);
      const pad = (n: number) => String(n).padStart(2, "0");
      const minIso = `${min.getFullYear()}-${pad(min.getMonth() + 1)}-${pad(min.getDate())}`;
      if (String(body.eventDate) < minIso) {
        return NextResponse.json(
          { error: "La fecha del evento necesita al menos 5 días de antelación. Para urgencias, escríbenos por WhatsApp." },
          { status: 400 },
        );
      }
    }

    // ── ¿El hueco sigue libre? ────────────────────────────────
    // Comprueba solapes contra las citas vivas de ese día (una cita de
    // 45 min bloquea también los slots que pisa).
    const sb = getSupabaseAdmin();
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    const reqStart = toMin(appointmentSlot);
    const reqEnd = reqStart + duration;
    const { data: sameDay } = await sb
      .from("appointments")
      .select("appointment_slot, duration_min")
      .eq("appointment_date", appointmentDate)
      .in("status", ["pending", "confirmed"]);
    const conflict = (sameDay ?? []).some((a) => {
      const s = toMin(a.appointment_slot);
      const e = s + (a.duration_min || 20);
      return reqStart < e && reqEnd > s;
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Ese hueco se acaba de ocupar — elige otra hora, porfa." },
        { status: 409 },
      );
    }

    // ── Guardar en Supabase ───────────────────────────────────
    const { data: inserted, error: dbErr } = await sb
      .from("appointments")
      .insert({
        type,
        type_label: typeLabel,
        premium,
        duration_min: duration,
        event_date: body.eventDate || null,
        people: body.people || null,
        bizcochos: body.bizcochos ?? [],
        sabores: body.sabores ?? [],
        idea_mode: body.ideaMode || null,
        appointment_date: appointmentDate,
        appointment_slot: appointmentSlot,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        notes: body.notes || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (dbErr) {
      // 23505 = violación del índice único (dos personas confirmando el
      // mismo hueco exactamente a la vez) → mismo mensaje que el conflicto.
      if ((dbErr as { code?: string }).code === "23505") {
        return NextResponse.json(
          { error: "Ese hueco se acaba de ocupar — elige otra hora, porfa." },
          { status: 409 },
        );
      }
      throw dbErr;
    }

    // ── Trabajo lento DESPUÉS de responder (no bloquea al cliente) ──
    after(async () => {
      // 1 · Evento en Google Calendar (si está conectado)
      const startIso = madridIso(appointmentDate, appointmentSlot);
      const endIso = madridIso(appointmentDate, appointmentSlot, duration);
      try {
        const event = await createAppointmentEvent({
          summary: `Cita ${premium ? "★ " : ""}${typeLabel} — ${name}`,
          description: buildEventDescription(body),
          startIso,
          endIso,
          attendeeEmail: email || undefined,
        });
        if (event.eventId) {
          await sb.from("appointments").update({ gcal_event_id: event.eventId }).eq("id", inserted.id);
        }
      } catch (e) {
        // No bloquea la reserva — se puede sincronizar más tarde manualmente.
        console.error("[citas] createAppointmentEvent failed:", e);
      }

      // 2 · Aviso interno al equipo (el email al cliente sale al CONFIRMAR)
      try {
        const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
        const internalTo = process.env.APPOINTMENTS_NOTIFY_TO?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        if (resend && internalTo.length > 0) {
          const humanDate = new Date(appointmentDate + "T00:00:00").toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long",
          });
          await resend.emails.send({
            from: "EvangelCake <hola@evangelcake.com>",
            to: internalTo,
            subject: `Nueva cita · ${typeLabel} · ${humanDate} ${appointmentSlot} · ${name}`,
            html: buildInternalEmail({ ...body, humanDate }),
          });
        }
      } catch (e) {
        console.error("[citas] email send failed:", e);
      }
    });

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (e) {
    console.error("[citas] create error:", e);
    return NextResponse.json({ error: "Algo ha ido mal. Vuelve a probar en un minuto." }, { status: 500 });
  }
}

// ── Helpers de contenido ──────────────────────────────────────

function buildEventDescription(b: Record<string, unknown>) {
  const rows: string[] = [];
  rows.push(`Cliente: ${b.name}`);
  rows.push(`Teléfono: ${b.phone}`);
  if (b.email) rows.push(`Email: ${b.email}`);
  rows.push("");
  rows.push(`Tipo: ${b.typeLabel}${b.premium ? " (premium)" : ""}`);
  if (b.eventDate) rows.push(`Fecha del evento: ${b.eventDate}`);
  if (b.people) rows.push(`Personas: ${b.people}`);
  if (Array.isArray(b.bizcochos) && b.bizcochos.length) rows.push(`Bizcochos a probar: ${b.bizcochos.join(" · ")}`);
  if (Array.isArray(b.sabores) && b.sabores.length) rows.push(`Rellenos a probar: ${b.sabores.join(" · ")}`);
  if (b.ideaMode) rows.push(`Idea: ${b.ideaMode === "clara" ? "Tiene la idea clara" : "Necesita asesoramiento"}`);
  if (b.notes) { rows.push(""); rows.push(`Notas: ${b.notes}`); }
  return rows.join("\n");
}

function buildInternalEmail(b: Record<string, unknown> & { humanDate: string }) {
  return `<!doctype html>
<html><body style="font-family:Georgia,serif;padding:20px;">
  <h2>Nueva cita solicitada</h2>
  <p><strong>${escapeHtml(String(b.typeLabel))}${b.premium ? " · PREMIUM" : ""}</strong> — ${escapeHtml(String(b.humanDate))} a las ${escapeHtml(String(b.appointmentSlot))}</p>
  <hr />
  <p><b>Cliente:</b> ${escapeHtml(String(b.name))}<br/>
     <b>Teléfono:</b> ${escapeHtml(String(b.phone))}<br/>
     <b>Email:</b> ${escapeHtml(String(b.email || "—"))}</p>
  <hr />
  <p><b>Fecha del evento:</b> ${escapeHtml(String(b.eventDate ?? "—"))}<br/>
     <b>Personas:</b> ${escapeHtml(String(b.people ?? "—"))}<br/>
     <b>Bizcochos a probar:</b> ${Array.isArray(b.bizcochos) ? b.bizcochos.map(String).map(escapeHtml).join(" · ") : "—"}<br/>
     <b>Rellenos a probar:</b> ${Array.isArray(b.sabores) ? b.sabores.map(String).map(escapeHtml).join(" · ") : "—"}<br/>
     <b>Idea:</b> ${b.ideaMode === "clara" ? "Tiene la idea clara" : b.ideaMode === "asesoria" ? "Necesita asesoramiento" : "—"}</p>
  ${b.notes ? `<p><b>Notas:</b><br/>${escapeHtml(String(b.notes))}</p>` : ""}
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
