-- =====================================================
-- EvangelCake · Tabla instagram_posts
-- Idempotente: ejecutar en el SQL Editor de Supabase.
-- =====================================================

CREATE TABLE IF NOT EXISTS instagram_posts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url   text NOT NULL,           -- URL pública (Supabase Storage o externa)
  post_url    text,                    -- link al post de Instagram (opcional)
  caption     text,                    -- pie de la foto (opcional)
  position    integer DEFAULT 0,       -- orden de aparición (0 = primero)
  published   boolean DEFAULT true,    -- si se muestra en la home
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_posts_position
  ON instagram_posts(position) WHERE published = true;

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Lectura pública (anon) — el feed lo ve cualquiera que entre a la home
DROP POLICY IF EXISTS "public can read published instagram posts" ON instagram_posts;
CREATE POLICY "public can read published instagram posts" ON instagram_posts
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- Escritura solo desde service_role (admin API)
