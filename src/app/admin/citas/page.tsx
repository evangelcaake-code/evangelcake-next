import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import CitaActions from "./CitaActions";

export const metadata: Metadata = {
  title: "Citas · Admin EvangelCake",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Appointment = {
  id: string;
  created_at: string;
  type: string;
  type_label: string;
  premium: boolean;
  duration_min: number;
  event_date: string | null;
  people: string | null;
  bizcochos: string[];
  sabores: string[];
  idea_mode: string | null;
  appointment_date: string;
  appointment_slot: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  vino: "Vino",
  no_vino: "No vino",
  cancelada: "Cancelada",
};

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDaysIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function StatusPill({ status }: { status: string }) {
  return <span className={`cita-pill ${status}`}>{STATUS_LABEL[status] ?? status}</span>;
}

function CitaRow({
  cita, isPast, showDay, reminder,
}: {
  cita: Appointment;
  isPast: boolean;
  showDay?: boolean;
  reminder?: boolean;
}) {
  return (
    <article className={`cita-card${cita.premium ? " premium" : ""}${cita.status === "cancelada" ? " off" : ""}`}>
      <div className="cita-time">
        <span className="cita-hour">{cita.appointment_slot}</span>
        <span className="cita-dur">{cita.duration_min} min{cita.premium ? " · premium" : ""}</span>
        {showDay && <span className="cita-day-inline">{fmtDay(cita.appointment_date)}</span>}
      </div>
      <div className="cita-info">
        <div className="cita-name">{cita.customer_name}</div>
        <div className="cita-meta">
          <span className={`cita-tag${cita.premium ? " premium" : ""}`}>{cita.type_label}</span>
          {cita.event_date && <span>tarta para el {fmtDay(cita.event_date)}</span>}
          {cita.people && <span>{cita.people}</span>}
          <StatusPill status={cita.status} />
        </div>
        <div className="cita-detail">
          {cita.bizcochos.length > 0 && <span>Bizcochos: {cita.bizcochos.join(" · ")}</span>}
          {cita.sabores.length > 0 && <span>Rellenos: {cita.sabores.join(" · ")}</span>}
          {cita.idea_mode && (
            <span>{cita.idea_mode === "clara" ? "Tiene la idea clara" : "Necesita asesoramiento"}</span>
          )}
        </div>
        {cita.notes && <div className="cita-notes">&ldquo;{cita.notes}&rdquo;</div>}
        <div className="cita-contact">
          {cita.customer_phone}{cita.customer_email ? ` · ${cita.customer_email}` : ""}
        </div>
      </div>
      <CitaActions
        id={cita.id}
        status={cita.status}
        customerName={cita.customer_name}
        customerPhone={cita.customer_phone}
        appointmentDate={cita.appointment_date}
        appointmentSlot={cita.appointment_slot}
        isPast={isPast}
        reminder={reminder}
      />
    </article>
  );
}

export default async function AdminCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; d?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sp = await searchParams;
  const today = isoToday();
  const tomorrow = addDaysIso(today, 1);
  const realMonth = today.slice(0, 7);

  // Mes visible del calendario (?m=YYYY-MM) y día seleccionado (?d=YYYY-MM-DD)
  const monthKey = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : realMonth;
  const [yy, mm] = monthKey.split("-").map(Number);
  const selDay = /^\d{4}-\d{2}-\d{2}$/.test(sp.d ?? "") ? sp.d! : today;

  const daysInMonth = new Date(yy, mm, 0).getDate();
  const monthFirst = `${monthKey}-01`;
  const monthLast = `${monthKey}-${pad(daysInMonth)}`;

  // Rango: cubre el mes visible + pasado reciente (por cerrar) + próximos 60 días
  const from = addDaysIso(monthFirst < today ? monthFirst : today, -35);
  const to = addDaysIso(monthLast > today ? monthLast : today, 60);

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("appointments")
    .select("*")
    .gte("appointment_date", from)
    .lte("appointment_date", to)
    .order("appointment_date", { ascending: true })
    .order("appointment_slot", { ascending: true });

  const tableMissing = Boolean(
    error && /relation .* does not exist|appointments|schema cache/.test(error.message ?? ""),
  );
  const citas = (data ?? []) as Appointment[];
  const live = citas.filter((c) => c.status !== "cancelada");

  const todayCitas = live.filter((c) => c.appointment_date === today);
  const tomorrowCitas = live.filter((c) => c.appointment_date === tomorrow);
  const pendingUpcoming = live.filter((c) => c.status === "pending" && c.appointment_date >= today);
  const toClose = citas.filter(
    (c) => c.appointment_date < today && (c.status === "pending" || c.status === "confirmed"),
  );
  const noShowsMonth = citas.filter(
    (c) => c.status === "no_vino" && c.appointment_date.startsWith(realMonth),
  ).length;

  // Nº de citas vivas por día → puntos del calendario
  const countByDay = new Map<string, number>();
  for (const c of live) countByDay.set(c.appointment_date, (countByDay.get(c.appointment_date) ?? 0) + 1);

  // Celdas del calendario (lunes primero)
  const firstDow = (new Date(yy, mm - 1, 1).getDay() + 6) % 7;
  const prevM = mm === 1 ? `${yy - 1}-12` : `${yy}-${pad(mm - 1)}`;
  const nextM = mm === 12 ? `${yy + 1}-01` : `${yy}-${pad(mm + 1)}`;

  const selDayCitas = citas.filter((c) => c.appointment_date === selDay);
  const nothingToDo = pendingUpcoming.length === 0 && tomorrowCitas.length === 0 && toClose.length === 0;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Panel interno</span>
          <h1>Citas</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <a href="/admin" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver al admin
            </a>
          </p>
        </div>
      </header>

      {tableMissing && (
        <section className="admin-section">
          <div className="cita-warning">
            <b>La tabla <code>appointments</code> no existe todavía en Supabase.</b>
            <p>
              Abre el SQL Editor del dashboard de Supabase, pega el contenido de{" "}
              <code>supabase/migrations/20260710_appointments.sql</code> y dale a Run. Después recarga esta página.
            </p>
          </div>
        </section>
      )}

      <section className="admin-kpis">
        <div className="admin-kpi">
          <span className="admin-kpi-num">{todayCitas.length}</span>
          <span className="admin-kpi-lbl">Citas hoy</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{pendingUpcoming.length}</span>
          <span className="admin-kpi-lbl">Por confirmar</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{tomorrowCitas.length}</span>
          <span className="admin-kpi-lbl">Citas mañana</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-num">{noShowsMonth}</span>
          <span className="admin-kpi-lbl">No-shows este mes</span>
        </div>
      </section>

      {/* ── Tareas de citas (generadas solas a partir del estado) ── */}
      <section className="admin-section">
        <h2 className="cita-section-h">Hoy toca</h2>
        {nothingToDo && !tableMissing && (
          <p className="cita-section-sub">Nada urgente — todo al día ✨</p>
        )}

        {pendingUpcoming.length > 0 && (
          <div className="cita-taskgroup">
            <h3 className="cita-task-h">📲 Confirmar por WhatsApp <span className="cita-count">{pendingUpcoming.length}</span></h3>
            <div className="cita-list">
              {pendingUpcoming.map((c) => (
                <CitaRow key={c.id} cita={c} isPast={false} showDay />
              ))}
            </div>
          </div>
        )}

        {tomorrowCitas.length > 0 && (
          <div className="cita-taskgroup">
            <h3 className="cita-task-h">⏰ Mañana · enviar recordatorio y preparar la cata <span className="cita-count">{tomorrowCitas.length}</span></h3>
            <div className="cita-list">
              {tomorrowCitas.map((c) => (
                <CitaRow key={c.id} cita={c} isPast={false} reminder />
              ))}
            </div>
          </div>
        )}

        {toClose.length > 0 && (
          <div className="cita-taskgroup">
            <h3 className="cita-task-h">✅ Cerrar resultado <span className="cita-count">{toClose.length}</span></h3>
            <p className="cita-section-sub">Citas pasadas sin resultado — marca si vinieron o no.</p>
            <div className="cita-list">
              {toClose.map((c) => (
                <CitaRow key={c.id} cita={c} isPast showDay />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Calendario mensual ── */}
      <section className="admin-section">
        <div className="ccal">
          <div className="ccal-head">
            <h2 className="cita-section-h" style={{ margin: 0 }}>{MONTHS_ES[mm - 1]} {yy}</h2>
            <div className="ccal-nav">
              <Link href={`/admin/citas?m=${prevM}`} aria-label="Mes anterior">‹</Link>
              <Link href={`/admin/citas?m=${realMonth}&d=${today}`}>Hoy</Link>
              <Link href={`/admin/citas?m=${nextM}`} aria-label="Mes siguiente">›</Link>
            </div>
          </div>
          <div className="ccal-grid">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <div key={d} className="ccal-dow">{d}</div>
            ))}
            {Array.from({ length: firstDow }, (_, i) => (
              <div key={`b${i}`} className="ccal-day blank" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const iso = `${monthKey}-${pad(i + 1)}`;
              const count = countByDay.get(iso) ?? 0;
              const cls = [
                "ccal-day",
                iso === today ? "today" : "",
                iso === selDay ? "selected" : "",
                count > 0 ? "has" : "",
              ].filter(Boolean).join(" ");
              return (
                <Link key={iso} href={`/admin/citas?m=${monthKey}&d=${iso}`} className={cls}>
                  <span className="n">{i + 1}</span>
                  {count > 0 && <span className="c">{count}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Agenda del día seleccionado ── */}
      <section className="admin-section">
        <h2 className="cita-section-h" style={{ textTransform: "capitalize" }}>
          {fmtDay(selDay)}
          {selDay === today && <span className="cita-today-badge">hoy</span>}
        </h2>
        {selDayCitas.length === 0 ? (
          <p className="cita-section-sub">Sin citas este día.</p>
        ) : (
          <div className="cita-list">
            {selDayCitas.map((c) => (
              <CitaRow key={c.id} cita={c} isPast={selDay < today} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
