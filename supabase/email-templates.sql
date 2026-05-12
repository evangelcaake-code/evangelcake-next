-- =====================================================
-- EvangelCake · Migración email_templates + broadcasts
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- =====================================================

-- =====================================================
-- TABLA: email_templates
-- Plantillas editables desde /admin/emails/templates
-- Una fila por cada tipo de email automático.
-- Si la fila no existe, resend.ts hace fallback al HTML del código.
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  key         text PRIMARY KEY,
  label       text NOT NULL,
  description text,
  subject     text NOT NULL,
  html        text NOT NULL,
  text_body   text,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas → solo accesible vía service_role (admin API).

-- =====================================================
-- TABLA: broadcasts
-- Campañas one-off (emails masivos puntuales) compuestos desde
-- /admin/emails/broadcasts. NO afectan a los emails automáticos.
-- =====================================================
CREATE TABLE IF NOT EXISTS broadcasts (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject          text NOT NULL,
  html             text NOT NULL,
  text_body        text,
  audience         text NOT NULL DEFAULT 'subscribed',
                   -- 'all' (todos los subscribers) | 'subscribed' (consent_marketing=true) |
                   -- 'with_birthday_this_month' | 'with_unused_code'
  status           text NOT NULL DEFAULT 'draft',
                   -- 'draft' | 'sending' | 'sent' | 'failed'
  recipients_count integer,
  sent_count       integer DEFAULT 0,
  fail_count       integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  sent_at          timestamptz
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_created ON broadcasts(created_at DESC);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas → solo accesible vía service_role.

-- =====================================================
-- FIN
-- =====================================================
