-- ============================================================
-- Tabla appointments (citas) — EvangelCake
-- ============================================================
-- Registra cada solicitud de cita hecha desde /pedir-cita.
-- Betaña la gestiona desde /admin/citas (siguiente iteración).
-- ============================================================

create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  -- Clasificación
  type              text not null,                              -- id: cumpleanos, boda, comunion, etc.
  type_label        text not null,                              -- "Cumpleaños", "Boda"…
  premium           boolean not null default false,
  duration_min      integer not null default 20,                -- 20 · normal | 45 · premium

  -- Datos de la tarta (rellenos por el cliente)
  event_date        date,                                       -- fecha del evento
  people            text,                                       -- rango elegido del select
  bizcochos         text[] not null default '{}',               -- 2 bizcochos a probar
  sabores           text[] not null default '{}',               -- rellenos a probar
  idea_mode         text check (idea_mode in ('clara','asesoria')),

  -- Slot de la cita
  appointment_date  date not null,
  appointment_slot  text not null,                              -- HH:MM

  -- Contacto (email opcional — la confirmación principal va por WhatsApp)
  customer_name     text not null,
  customer_phone    text not null,
  customer_email    text,
  notes             text,

  -- NOTA: si ya ejecutaste una versión anterior de esta migración donde
  -- customer_email era NOT NULL, ejecuta en su lugar:
  --   alter table public.appointments alter column customer_email drop not null;

  -- Estado — flujo Betaña
  status            text not null default 'pending'
                    check (status in ('pending','confirmed','vino','no_vino','cancelada')),

  -- Integración
  gcal_event_id     text,                                       -- id del evento en Google Calendar

  -- Auditoría / seguimiento
  order_id          uuid,                                       -- cuando se convierte en pedido del shop
  no_show_count    integer generated always as (
                     case when status = 'no_vino' then 1 else 0 end
                   ) stored
);

create index if not exists appointments_by_date        on public.appointments (appointment_date);
create index if not exists appointments_by_status      on public.appointments (status);
create index if not exists appointments_by_customer   on public.appointments (customer_email);

-- ────────────────────────────────────────────────────────────
-- RLS: sólo service role escribe/lee. El panel admin usa el
-- cliente admin (SUPABASE_SERVICE_ROLE_KEY).
-- ────────────────────────────────────────────────────────────
alter table public.appointments enable row level security;
-- Sin políticas públicas: todo el tráfico llega por la API con
-- la service role key, que salta RLS.
