-- =====================================================
-- EvangelCake · Campaña Lanzamiento Web Mayo 2026
-- Tablas: campaign_reels, campaign_stories
-- Idempotente: se puede ejecutar varias veces sin romper.
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_reels (
  id              integer PRIMARY KEY,           -- 1..9
  title           text NOT NULL,
  scheduled_date  date,
  reel_type       text DEFAULT 'juego',          -- 'juego' | 'zanahoria'
  hook            text,
  body            text,
  cta             text,
  notes           text,
  status          text DEFAULT 'pending',        -- 'pending' | 'recorded' | 'published'
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE campaign_reels ENABLE ROW LEVEL SECURITY;
-- Solo service_role escribe/lee (admin)

CREATE TABLE IF NOT EXISTS campaign_stories (
  id              text PRIMARY KEY,              -- 'c1s1' .. 'c3s3'
  cadena          integer NOT NULL,              -- 1..3
  story_num       integer NOT NULL,              -- 1..3
  scheduled_date  date,
  title           text,
  subtitle        text,
  cta             text,
  bg              text DEFAULT 'cream',          -- 'cream' | 'pink' | 'gradient'
  image           text,                          -- 'logo' | 'mascot' | 'sticker' | null
  accent_color    text DEFAULT '#c79a4a',
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE campaign_stories ENABLE ROW LEVEL SECURITY;

-- Seed inicial: 9 reels con plantilla (idempotente con ON CONFLICT DO NOTHING)
INSERT INTO campaign_reels (id, title, scheduled_date, reel_type, hook, body, cta) VALUES
  (1, 'Lanzamiento web + juego', '2026-05-14', 'juego',
    '¿Sabes que ya puedes ganar una tarta gratis sin moverte del sofá?',
    'Acabamos de lanzar nuestra web. Y en la home hay un mini juego — Dulci''s Sweet Challenge — donde solo tienes que esquivar bombas y atrapar tartas. Los 3 mejores del mes se llevan una tarta personalizada GRATIS.',
    'Link en bio. Pasa, juega 30 segundos y compite por la tarta.'),
  (2, 'Tutorial juego paso a paso', '2026-05-17', 'juego',
    'Os explico cómo va el juego porque algunos no lo han pillado.',
    '1) Entras a evangelcake.com — 2) Bajas al juego — 3) Dale a JUGAR — 4) Mueves a Dulci con el dedo (o las flechas en pc) — 5) Atrapas tartas, esquivas bombas. 30 segundos. El que más puntos haga este mes gana.',
    'Probadlo. Es gratis y se tarda menos en jugar que en leer este reel.'),
  (3, 'Tarta de zanahoria brasileña', '2026-05-19', 'zanahoria',
    'La tarta más vendida del obrador NO es la que crees.',
    'Es nuestra tarta de zanahoria. Pero NO la española. Es la brasileña — bizcocho de zanahoria mezclada en crudo + cobertura de brigadeiro de chocolate fundente. Una bomba.',
    'Solo los jueves. Reserva por WhatsApp en bio.'),
  (4, 'Ranking del mes (mid-campaign)', '2026-05-21', 'juego',
    'Os enseño cómo va el ranking del mes de Dulci''s Sweet Challenge.',
    'Llevamos dos semanas con el juego online y ya hay [X] jugadores. El top 3 ahora mismo es [...]. Quedan [Y] días para que termine el mes y se entreguen las tartas.',
    'Aún estás a tiempo de meterte en el top 3. Juega ahora en evangelcake.com.'),
  (5, 'Behind the scenes obrador', '2026-05-24', 'juego',
    'Así se hace una tarta personalizada en el obrador.',
    'Desde la masa, el relleno, la decoración. Vídeo rápido del proceso real en Pº María Agustín 13. Las tartas no salen de moldes — se piensan una a una.',
    'Link en bio para pedir la tuya. Y si juegas a Dulci''s Sweet Challenge, puede salir gratis.'),
  (6, 'Receta zanahoria (blog)', '2026-05-26', 'zanahoria',
    '3 cosas que la gente hace mal con la tarta de zanahoria.',
    '1) Rallar la zanahoria en vez de licuarla con aceite (cambia la textura). 2) Echar canela industrial (matamos el sabor real). 3) Cobertura de queso en vez de brigadeiro brasileño.',
    'Receta completa en el blog: evangelcake.com/blog → bizcocho de zanahoria Brasil.'),
  (7, 'Última semana del juego (urgencia)', '2026-05-28', 'juego',
    'Última semana para entrar al top 3 del juego y ganar tarta gratis.',
    'El mes acaba el 31 de mayo. Top 3 a esa fecha = tarta personalizada gratis (no figurada, GRATIS). Han jugado ya más de [X] personas. Quedan 3 días.',
    'Pasate ahora, juega 30 segundos, métete en el podio. evangelcake.com.'),
  (8, 'Resultado / ganadores', '2026-06-01', 'juego',
    'Ya tenemos los 3 ganadores del primer mes.',
    'Mostrar los 3 nombres + score. Felicitar. Avisar que el ranking se reinicia hoy 1 de junio.',
    'Junio empieza con podio limpio. ¿Te apuntas?'),
  (9, 'Recap + invitación abierta', '2026-06-04', 'juego',
    '15 días con la web online + lo que hemos visto.',
    'Resumen rápido: cuántas tartas se pidieron por la web, cuánta gente jugó, qué fue lo que más se pidió. Y la invitación: la pastelería sigue en Pº María Agustín 13, el juego sigue, los pedidos también.',
    'evangelcake.com. Te esperamos.')
ON CONFLICT (id) DO NOTHING;

-- Seed inicial: 9 stories (3 cadenas × 3 stories)
INSERT INTO campaign_stories (id, cadena, story_num, scheduled_date, title, subtitle, cta, bg, image, accent_color) VALUES
  ('c1s1', 1, 1, '2026-05-14', 'Tartas personalizadas', 'desde la web', 'evangelcake.com/tartas-personalizadas', 'gradient', 'logo', '#c79a4a'),
  ('c1s2', 1, 2, '2026-05-14', '5% descuento', 'en pedidos online', 'Solo esta semana', 'pink', 'mascot', '#e85a9a'),
  ('c1s3', 1, 3, '2026-05-14', 'Haz tu pedido ahora', 'Descuento automático al finalizar', 'evangelcake.com →', 'cream', 'sticker', '#c79a4a'),
  ('c2s1', 2, 1, '2026-05-21', 'Siguen las personalizadas', 'desde la web', 'evangelcake.com', 'gradient', 'logo', '#c79a4a'),
  ('c2s2', 2, 2, '2026-05-21', '5% sigue activo', 'esta semana también', 'evangelcake.com', 'pink', 'mascot', '#e85a9a'),
  ('c2s3', 2, 3, '2026-05-21', 'Pide tu tarta', 'Descuento al checkout', 'evangelcake.com →', 'cream', 'sticker', '#c79a4a'),
  ('c3s1', 3, 1, '2026-05-28', 'Última semana', 'del descuento del 5%', 'evangelcake.com', 'gradient', 'logo', '#e85a9a'),
  ('c3s2', 3, 2, '2026-05-28', 'No te quedes sin tarta', '5% acaba este domingo', 'Solo 4 días', 'pink', 'mascot', '#e85a9a'),
  ('c3s3', 3, 3, '2026-05-28', 'Último aviso', 'Pide hoy con descuento', 'evangelcake.com →', 'cream', 'sticker', '#e85a9a')
ON CONFLICT (id) DO NOTHING;
