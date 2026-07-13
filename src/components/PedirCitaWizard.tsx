"use client";

import { useEffect, useMemo, useState } from "react";
import { BIZCOCHOS as CAKE_BIZCOCHOS, RELLENOS as CAKE_RELLENOS } from "@/data/cakeOptions";

/* ============================================================
 * PedirCitaWizard
 * ------------------------------------------------------------
 * Wizard de 4 pasos para reservar cita en el obrador:
 *   1. Tu tarta  — tipo, fecha del evento, personas, cata, idea/asesoría
 *   2. Día y hora — calendario + slots
 *   3. Tus datos — nombre, teléfono, email
 *   4. Confirmación — resumen + botón de enviar
 *
 * Los slots se consultan a /api/citas/slots (que hoy devuelve mocks y
 * mañana leerá free/busy de Google Calendar — misma respuesta JSON).
 * El envío final va a POST /api/citas/create.
 * ============================================================ */

// ─── Configuración estática ────────────────────────────────────

type AppointmentType = {
  id: string;
  label: string;
  glyph: string;
  duration: 20 | 45;
  premium: boolean;
};

const TYPES: AppointmentType[] = [
  { id: "cumpleanos",  label: "Cumpleaños",  glyph: "Cu", duration: 20, premium: false },
  { id: "aniversario", label: "Aniversario", glyph: "An", duration: 20, premium: false },
  { id: "boda",        label: "Boda",        glyph: "Bo", duration: 45, premium: true  },
  { id: "comunion",    label: "Comunión",    glyph: "Cm", duration: 45, premium: true  },
  { id: "empresa",     label: "Empresa",     glyph: "Em", duration: 45, premium: true  },
  { id: "otro",        label: "Otro",        glyph: "+",  duration: 20, premium: false },
];

// Sincronizado con /tartas-personalizadas — fuente única en src/data/cakeOptions.ts.
// Un id estable para persistir en Supabase aunque el nombre visible cambie.
const BIZCOCHOS = CAKE_BIZCOCHOS.map((name) => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
}));
const SABORES = CAKE_RELLENOS;

// Límites de la cata
const MAX_BIZCOCHOS = 2;
const MAX_SABORES = 3;

// Antelación mínima del encargo: la fecha del evento tiene que estar
// al menos a N días vista para poder producir la tarta con calma.
const MIN_DIAS_ANTELACION = 5;

const PEOPLE_OPTIONS = ["6 personas", "8 personas", "10 personas", "12 personas", "15 personas", "20 personas", "30 personas", "50+ personas"];

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DOW_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const DOW_LONG  = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// ─── Utilidades de fecha ───────────────────────────────────────

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function humanDate(iso: string) {
  const d = fromIsoDate(iso);
  return `${DOW_LONG[(d.getDay() + 6) % 7]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()].toLowerCase()}`;
}

// ─── Tipos de la respuesta del API de slots ────────────────────

type DayInfo = {
  date: string;              // YYYY-MM-DD
  status: "available" | "full" | "closed";
};
type SlotInfo = {
  time: string;              // HH:MM
  taken: boolean;
};
type SlotsResponse = {
  days: DayInfo[];
  slots?: Record<string, SlotInfo[]>; // por fecha
};

// ─── Componente ────────────────────────────────────────────────

export default function PedirCitaWizard() {
  // ── Estado del formulario ─────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [typeId, setTypeId] = useState<string>("cumpleanos");
  const [eventDate, setEventDate] = useState<string>("");     // ISO YYYY-MM-DD
  const [people, setPeople] = useState<string>("12 personas");
  const [bizcochos, setBizcochos] = useState<string[]>([]);
  const [sabores, setSabores] = useState<string[]>([]);
  const [ideaMode, setIdeaMode] = useState<"clara" | "asesoria" | null>(null);

  // Paso 2 — calendario
  const [visibleMonth, setVisibleMonth] = useState<{ y: number; m: number }>(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [availability, setAvailability] = useState<SlotsResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");   // ISO
  const [selectedSlot, setSelectedSlot] = useState<string>(""); // HH:MM

  // Paso 3 — datos
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Envío
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const type = useMemo(() => TYPES.find((t) => t.id === typeId) ?? TYPES[0], [typeId]);

  // Fecha mínima del evento (hoy + antelación). Calculada una vez por montaje.
  const minEventDate = useMemo(
    () => toIsoDate(new Date(Date.now() + MIN_DIAS_ANTELACION * 86400000)),
    [],
  );
  const eventDateTooSoon = Boolean(eventDate) && eventDate < minEventDate;

  // ── Cargar disponibilidad al cambiar de mes en el paso 2 ─────
  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;
    setLoadingSlots(true);
    const monthStr = `${visibleMonth.y}-${String(visibleMonth.m + 1).padStart(2, "0")}`;
    fetch(`/api/citas/slots?month=${monthStr}&duration=${type.duration}`)
      .then((r) => r.json())
      .then((data: SlotsResponse) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {
        if (!cancelled) setAvailability({ days: [] });
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => { cancelled = true; };
  }, [step, visibleMonth.y, visibleMonth.m, type.duration]);

  // Cargar slots del día seleccionado
  useEffect(() => {
    if (step !== 2 || !selectedDay) return;
    let cancelled = false;
    fetch(`/api/citas/slots?date=${selectedDay}&duration=${type.duration}`)
      .then((r) => r.json())
      .then((data: SlotsResponse) => {
        if (cancelled) return;
        setAvailability((prev) => ({
          days: prev?.days ?? [],
          slots: { ...(prev?.slots ?? {}), ...(data.slots ?? {}) },
        }));
      })
      .catch(() => { /* silencio: el UI muestra "sin huecos" */ });
    return () => { cancelled = true; };
  }, [step, selectedDay, type.duration]);

  // ── Validaciones ─────────────────────────────────────────────
  const canGoStep2 =
    eventDate && !eventDateTooSoon &&
    bizcochos.length === MAX_BIZCOCHOS && sabores.length >= 1 && ideaMode !== null;
  const canGoStep3 = selectedDay && selectedSlot;
  // Email opcional: si lo escriben, tiene que ser válido.
  const canGoStep4 =
    name.trim().length >= 2 &&
    /^[0-9+ ]{7,}$/.test(phone.trim()) &&
    (email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

  // ── Handlers ─────────────────────────────────────────────────
  function toggleBizcocho(id: string) {
    setBizcochos((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_BIZCOCHOS) return [cur[cur.length - 1], id];
      return [...cur, id];
    });
  }
  function toggleSabor(s: string) {
    setSabores((cur) => {
      if (cur.includes(s)) return cur.filter((x) => x !== s);
      if (cur.length >= MAX_SABORES) return [...cur.slice(1), s];
      return [...cur, s];
    });
  }
  function selectDay(iso: string) {
    setSelectedDay(iso);
    setSelectedSlot("");
  }

  async function submit() {
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/citas/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type.id,
          typeLabel: type.label,
          premium: type.premium,
          duration: type.duration,
          eventDate,
          people,
          bizcochos: bizcochos.map((id) => BIZCOCHOS.find((b) => b.id === id)?.name).filter(Boolean),
          sabores,
          ideaMode,
          appointmentDate: selectedDay,
          appointmentSlot: selectedSlot,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No hemos podido guardar la cita.");
      setStep(5);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Algo ha ido mal.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="pc-wrap">

      {/* Rail de pasos */}
      {step < 5 && (
        <ol className="pc-steps" aria-label="Progreso de la reserva">
          {[
            { n: 1, label: "Tu tarta" },
            { n: 2, label: "Día y hora" },
            { n: 3, label: "Datos" },
            { n: 4, label: "Listo" },
          ].map((s, i) => (
            <li key={s.n} className={`pc-step ${step > s.n ? "done" : step === s.n ? "active" : ""}`}>
              <span className="pc-step-num">{step > s.n ? "✓" : s.n}</span>
              <span className="pc-step-label">{s.label}</span>
              {i < 3 && <span className="pc-step-line" aria-hidden />}
            </li>
          ))}
        </ol>
      )}

      {/* ─────────── PASO 1 ─────────── */}
      {step === 1 && (
        <section className="pc-card">
          <h2 className="pc-title">¿Qué celebras?</h2>
          <p className="pc-sub">Elige el tipo — la cata y los detalles vienen justo después.</p>

          <div className="pc-label">Tipo de tarta</div>
          <div className="pc-type-grid">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`pc-type ${t.premium ? "premium" : ""} ${typeId === t.id ? "on" : ""}`}
                onClick={() => setTypeId(t.id)}
                aria-pressed={typeId === t.id}
              >
                <span className="pc-type-glyph">{t.glyph}</span>
                <span className="pc-type-body">
                  <span className="pc-type-name">{t.label}</span>
                  <span className="pc-type-meta">
                    {t.premium ? `premium · ~${t.duration} min` : `cita ~${t.duration} min`}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="pc-row-2">
            <label className="pc-field">
              <span className="pc-label">¿Para qué día necesitas la tarta?</span>
              <input
                type="date"
                className={`pc-input${eventDateTooSoon ? " error" : ""}`}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={minEventDate}
                aria-describedby="pc-date-note"
              />
            </label>
            <label className="pc-field">
              <span className="pc-label">Nº de personas (aprox.)</span>
              <select className="pc-input" value={people} onChange={(e) => setPeople(e.target.value)}>
                {PEOPLE_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
          </div>

          <p id="pc-date-note" className={`pc-date-note${eventDateTooSoon ? " error" : ""}`} role={eventDateTooSoon ? "alert" : undefined}>
            {eventDateTooSoon
              ? `Esa fecha está demasiado cerca — necesitamos al menos ${MIN_DIAS_ANTELACION} días para preparar tu tarta con calma. Si es urgente, escríbenos por WhatsApp.`
              : `Trabajamos con un mínimo de ${MIN_DIAS_ANTELACION} días de antelación para cada encargo.`}
          </p>

          <div className="pc-label">Cata · elige {MAX_BIZCOCHOS} bizcochos para probar</div>
          <div className="pc-taste-grid">
            {BIZCOCHOS.map((b) => {
              const on = bizcochos.includes(b.id);
              return (
                <button
                  type="button"
                  key={b.id}
                  className={`pc-taste ${on ? "on" : ""}`}
                  onClick={() => toggleBizcocho(b.id)}
                  aria-pressed={on}
                >
                  <span className="pc-taste-check">{on ? "✓" : "+"}</span>
                  <span className="pc-taste-name">{b.name}</span>
                </button>
              );
            })}
          </div>
          <div className="pc-hint">{bizcochos.length} de {MAX_BIZCOCHOS} seleccionados</div>

          <div className="pc-label">Cata · elige hasta {MAX_SABORES} rellenos para probar</div>
          <div className="pc-pill-grid">
            {SABORES.map((s) => {
              const on = sabores.includes(s);
              const disabled = !on && sabores.length >= MAX_SABORES;
              return (
                <button
                  type="button"
                  key={s}
                  className={`pc-pill ${on ? "on" : ""} ${disabled ? "off" : ""}`}
                  onClick={() => toggleSabor(s)}
                  aria-pressed={on}
                  disabled={disabled}
                >
                  {on ? "✓ " : ""}{s}
                </button>
              );
            })}
          </div>
          <div className="pc-hint">{sabores.length} de {MAX_SABORES} seleccionados</div>

          <div className="pc-label">¿Cómo lo tienes pensado?</div>
          <div className="pc-motive-two">
            <button
              type="button"
              className={`pc-motive ${ideaMode === "clara" ? "on" : ""}`}
              onClick={() => setIdeaMode("clara")}
              aria-pressed={ideaMode === "clara"}
            >
              <span className="pc-motive-ic">✓</span>
              <span>
                <span className="pc-motive-h">Tengo la idea clara</span>
                <span className="pc-motive-p">Sé el estilo, colores y detalles que quiero — solo hay que producirla.</span>
              </span>
            </button>
            <button
              type="button"
              className={`pc-motive ${ideaMode === "asesoria" ? "on" : ""}`}
              onClick={() => setIdeaMode("asesoria")}
              aria-pressed={ideaMode === "asesoria"}
            >
              <span className="pc-motive-ic">✦</span>
              <span>
                <span className="pc-motive-h">Necesito asesoramiento</span>
                <span className="pc-motive-p">Vengo con ganas — Andreia me ayuda a decidir estilo, sabores y detalles.</span>
              </span>
            </button>
          </div>

          <div className="pc-nav">
            <span />
            <button
              type="button"
              className="btn btn-pink pc-next"
              onClick={() => setStep(2)}
              disabled={!canGoStep2}
            >
              Siguiente · elegir día y hora →
            </button>
          </div>
        </section>
      )}

      {/* ─────────── PASO 2 ─────────── */}
      {step === 2 && (
        <section className="pc-card">
          <h2 className="pc-title">Elige día y hora</h2>
          <p className="pc-sub">
            Tu cita será de <strong>~{type.duration} min</strong>
            {type.premium ? " (cata premium)" : ""}. Elige el hueco que mejor te venga.
          </p>

          <div className="pc-picker">
            <div className="pc-calendar">
              <MonthCalendar
                y={visibleMonth.y}
                m={visibleMonth.m}
                days={availability?.days ?? []}
                selectedDay={selectedDay}
                onDaySelect={selectDay}
                onMonthChange={setVisibleMonth}
              />
              <div className="pc-legend">
                <span className="pc-legend-item avail">Con huecos</span>
                <span className="pc-legend-item full">Completo</span>
                <span className="pc-legend-item closed">Cerrado</span>
              </div>
            </div>

            <div className="pc-slots">
              {!selectedDay && (
                <div className="pc-slots-empty">
                  <div className="pc-slots-empty-h">Elige primero un día</div>
                  <p>Los huecos disponibles aparecerán aquí.</p>
                </div>
              )}
              {selectedDay && (
                <>
                  <div className="pc-slots-date">{humanDate(selectedDay)}</div>
                  <h4 className="pc-slots-h">Huecos disponibles</h4>
                  <SlotsList
                    slots={availability?.slots?.[selectedDay] ?? []}
                    loading={loadingSlots}
                    selected={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                </>
              )}
            </div>
          </div>

          <div className="pc-nav">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Volver</button>
            <button
              type="button"
              className="btn btn-pink pc-next"
              onClick={() => setStep(3)}
              disabled={!canGoStep3}
            >
              Siguiente · tus datos →
            </button>
          </div>
        </section>
      )}

      {/* ─────────── PASO 3 ─────────── */}
      {step === 3 && (
        <section className="pc-card">
          <h2 className="pc-title">Tus datos</h2>
          <p className="pc-sub">Para confirmarte la cita y avisarte si algo cambia.</p>

          <label className="pc-field">
            <span className="pc-label">Nombre y apellido</span>
            <input
              className="pc-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej.: Marta Ramírez"
              autoComplete="name"
            />
          </label>

          <div className="pc-row-2">
            <label className="pc-field">
              <span className="pc-label">Teléfono</span>
              <input
                className="pc-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 6XX XX XX XX"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
              />
            </label>
            <label className="pc-field">
              <span className="pc-label">Email (opcional)</span>
              <input
                className="pc-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                type="email"
                autoComplete="email"
                inputMode="email"
              />
            </label>
          </div>

          <label className="pc-field">
            <span className="pc-label">¿Algo que debamos saber antes de la cita? (opcional)</span>
            <textarea
              className="pc-input pc-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, referencias, fotos que traes, etc."
              rows={3}
            />
          </label>

          <div className="pc-nav">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Volver</button>
            <button
              type="button"
              className="btn btn-pink pc-next"
              onClick={() => setStep(4)}
              disabled={!canGoStep4}
            >
              Ver mi cita →
            </button>
          </div>
        </section>
      )}

      {/* ─────────── PASO 4 ─────────── */}
      {step === 4 && (
        <section className="pc-card">
          <h2 className="pc-title">Confirmación</h2>
          <p className="pc-sub">Repásalo — si algo no cuadra, aún puedes editarlo.</p>

          <div className="pc-confirm">
            <h3 className="pc-confirm-h">Tu cita, en breve</h3>
            <Row k="Celebras" v={type.label} />
            <Row k="Fecha del evento" v={eventDate ? humanDate(eventDate) : ""} />
            <Row k="Personas" v={people} />
            <Row
              k="Bizcochos a probar"
              v={bizcochos.map((id) => BIZCOCHOS.find((b) => b.id === id)?.name).filter(Boolean).join(" · ")}
            />
            <Row k="Rellenos a probar" v={sabores.join(" · ") || "—"} />
            <Row k="Idea" v={ideaMode === "clara" ? "Tengo la idea clara" : "Necesito asesoramiento"} />
            <Row k="Cita" v={`${selectedDay ? humanDate(selectedDay) : ""} · ${selectedSlot}`} />
            <Row k="Duración" v={`~${type.duration} min${type.premium ? " · cata premium" : ""}`} />
            <Row k="Contacto" v={`${name} · ${phone}`} />
            {email.trim() !== "" && <Row k="Email" v={email} />}
          </div>

          <div className="pc-what-next">
            <b>Qué pasa después:</b> Te confirmaremos por WhatsApp en un ratito. El día antes te enviamos recordatorio. Si no puedes venir, avísanos con 24h.
          </div>

          {submitError && <div className="pc-error">{submitError}</div>}

          <div className="pc-nav">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(3)} disabled={submitting}>
              ← Editar
            </button>
            <button
              type="button"
              className="btn btn-pink pc-next"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Enviando…" : "Confirmar cita ✓"}
            </button>
          </div>
        </section>
      )}

      {/* ─────────── PASO 5 · Éxito ─────────── */}
      {step === 5 && (
        <section className="pc-card pc-success">
          <div className="pc-success-mark" aria-hidden>✓</div>
          <h2 className="pc-title">¡Cita solicitada!</h2>
          <p className="pc-success-lead">
            Te esperamos <strong>{humanDate(selectedDay)}</strong> a las <strong>{selectedSlot}</strong>.
          </p>
          <p className="pc-success-body">
            {email
              ? <>Te escribiremos por WhatsApp muy pronto para confirmarla — y en cuanto esté confirmada te llegará un email a <b>{email}</b> con todos los detalles.</>
              : <>Te escribiremos por WhatsApp muy pronto para confirmarla.</>}
          </p>
          <div className="pc-success-actions">
            <a className="btn btn-secondary" href="/">Volver al inicio</a>
            <a
              className="btn"
              href={`https://wa.me/34624131348?text=${encodeURIComponent(`Hola, soy ${name} — acabo de pedir cita para ${humanDate(selectedDay)} a las ${selectedSlot}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25d366" }}
            >
              Escribirnos por WhatsApp
            </a>
          </div>
        </section>
      )}

    </div>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="pc-confirm-row">
      <span className="pc-confirm-k">{k}</span>
      <span className="pc-confirm-v">{v}</span>
    </div>
  );
}

function MonthCalendar({
  y, m, days, selectedDay, onDaySelect, onMonthChange,
}: {
  y: number;
  m: number;
  days: DayInfo[];
  selectedDay: string;
  onDaySelect: (iso: string) => void;
  onMonthChange: (v: { y: number; m: number }) => void;
}) {
  // Lookup rápido por ISO
  const byIso: Record<string, DayInfo> = {};
  for (const d of days) byIso[d.date] = d;

  const first = new Date(y, m, 1);
  const firstDow = (first.getDay() + 6) % 7; // 0 = Lunes
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: Array<{ iso?: string; day: number; mute?: boolean }> = [];

  // Días del mes anterior (mudos)
  const prevMonthDays = new Date(y, m, 0).getDate();
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, mute: true });
  }
  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toIsoDate(new Date(y, m, d));
    cells.push({ iso, day: d });
  }
  // Rellenar hasta múltiplos de 7
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - firstDow + 1, mute: true });
  }

  function shift(delta: number) {
    const nd = new Date(y, m + delta, 1);
    onMonthChange({ y: nd.getFullYear(), m: nd.getMonth() });
  }

  return (
    <>
      <div className="pc-cal-head">
        <div className="pc-cal-month">{MONTHS_ES[m]} {y}</div>
        <div className="pc-cal-nav">
          <button type="button" aria-label="Mes anterior" onClick={() => shift(-1)}>‹</button>
          <button type="button" aria-label="Mes siguiente" onClick={() => shift(+1)}>›</button>
        </div>
      </div>
      <div className="pc-cal-grid">
        {DOW_SHORT.map((d) => <div key={d} className="pc-cal-dow">{d}</div>)}
        {cells.map((c, i) => {
          if (c.mute) return <div key={i} className="pc-cal-day mute">{c.day}</div>;
          const info = c.iso ? byIso[c.iso] : undefined;
          const status = info?.status ?? "closed";
          const isSelected = c.iso === selectedDay;
          const isClickable = status === "available";
          const cls = ["pc-cal-day", status, isSelected ? "selected" : ""].filter(Boolean).join(" ");
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={isClickable && c.iso ? () => onDaySelect(c.iso!) : undefined}
              disabled={!isClickable}
              aria-label={c.iso}
            >
              {c.day}
              {status === "available" && <span className="pc-cal-pip" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function SlotsList({
  slots, loading, selected, onSelect,
}: {
  slots: SlotInfo[];
  loading: boolean;
  selected: string;
  onSelect: (t: string) => void;
}) {
  if (loading) return <div className="pc-slots-loading">Cargando huecos…</div>;
  if (!slots.length) return <div className="pc-slots-loading">Sin huecos este día.</div>;

  const morning = slots.filter((s) => Number(s.time.split(":")[0]) < 14);
  const evening = slots.filter((s) => Number(s.time.split(":")[0]) >= 14);

  return (
    <>
      {morning.length > 0 && (
        <div className="pc-slot-group">
          <div className="pc-slot-group-l">Mañana</div>
          <div className="pc-slot-row">
            {morning.map((s) => (
              <button
                key={s.time}
                type="button"
                className={`pc-slot ${s.taken ? "taken" : ""} ${selected === s.time ? "on" : ""}`}
                onClick={s.taken ? undefined : () => onSelect(s.time)}
                disabled={s.taken}
                aria-pressed={selected === s.time}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
      )}
      {evening.length > 0 && (
        <div className="pc-slot-group">
          <div className="pc-slot-group-l">Tarde</div>
          <div className="pc-slot-row">
            {evening.map((s) => (
              <button
                key={s.time}
                type="button"
                className={`pc-slot ${s.taken ? "taken" : ""} ${selected === s.time ? "on" : ""}`}
                onClick={s.taken ? undefined : () => onSelect(s.time)}
                disabled={s.taken}
                aria-pressed={selected === s.time}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
