-- =====================================================
-- EvangelCake · Schema Supabase
-- Ejecutar en SQL Editor del dashboard de Supabase
-- =====================================================

-- ===== EXTENSIONES =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: subscribers (captura de emails)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           text UNIQUE NOT NULL,
  name            text,
  source          text NOT NULL DEFAULT 'web',   -- 'game' | 'newsletter' | 'lead-magnet' | 'contact'
  birthday        date,                          -- opcional, para campañas de cumpleaños
  discount_code   text,                          -- código asignado al registrarse
  discount_used   boolean DEFAULT false,
  consent_marketing boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON subscribers(source);
CREATE INDEX IF NOT EXISTS idx_subscribers_birthday_md
  ON subscribers (EXTRACT(MONTH FROM birthday), EXTRACT(DAY FROM birthday));

-- =====================================================
-- TABLA: scores (ranking del juego)
-- =====================================================
CREATE TABLE IF NOT EXISTS scores (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       text NOT NULL,
  name        text NOT NULL,
  score       integer NOT NULL CHECK (score >= 0),
  month       text NOT NULL,                     -- 'YYYY-MM' para ranking mensual
  created_at  timestamptz DEFAULT now(),
  UNIQUE(email, month)                            -- un mejor score por email por mes
);

CREATE INDEX IF NOT EXISTS idx_scores_month_score ON scores(month, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_email ON scores(email);

-- =====================================================
-- TABLA: leads (formulario de contacto / encargos)
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        text NOT NULL,
  name         text,
  phone        text,
  event_type   text,                              -- 'boda' | 'cumple' | 'comunion' | 'otro'
  event_date   date,
  guests       integer,
  message      text,
  source       text,                              -- 'contacto' | 'encargos' | (otro form)
  status       text DEFAULT 'new',                -- 'new' | 'contacted' | 'won' | 'lost'
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

-- =====================================================
-- TABLA: events (analytics — page views, clicks, conversiones)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type    text NOT NULL,        -- 'page_view', 'popup_shown', 'popup_dismissed', 'popup_converted', 'newsletter_signup', 'game_start', 'game_complete', 'lead_submit'
  page          text,                 -- ruta donde ocurrió
  email         text,                 -- si se puede asociar a un usuario conocido
  visitor_id    text,                 -- identificador anónimo por navegador
  meta          jsonb,                -- payload opcional (score, source, etc.)
  user_agent    text,
  referer       text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_type_date ON events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_page ON events(page);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);

-- =====================================================
-- TABLA: discount_codes (códigos generados)
-- =====================================================
CREATE TABLE IF NOT EXISTS discount_codes (
  code        text PRIMARY KEY,
  percent     integer NOT NULL DEFAULT 5,
  email       text NOT NULL,
  used        boolean DEFAULT false,
  used_at     timestamptz,
  expires_at  timestamptz DEFAULT (now() + interval '90 days'),
  created_at  timestamptz DEFAULT now()
);

-- =====================================================
-- RLS (Row Level Security)
-- Permitimos solo lo necesario desde el cliente público.
-- Las API routes de Next.js usan service_role (acceso total).
-- =====================================================
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events      ENABLE ROW LEVEL SECURITY;

-- Cliente público (anon): solo puede LEER ranking del mes
CREATE POLICY "public can read scores" ON scores
  FOR SELECT TO anon, authenticated
  USING (true);

-- Todo lo demás → solo desde el servidor (service_role bypasea RLS)

-- =====================================================
-- VISTA: top mensual (útil para queries rápidas)
-- =====================================================
CREATE OR REPLACE VIEW monthly_top AS
SELECT
  month,
  name,
  email,
  score,
  ROW_NUMBER() OVER (PARTITION BY month ORDER BY score DESC) AS position
FROM scores
ORDER BY month DESC, score DESC;

-- =====================================================
-- FIN
-- =====================================================
