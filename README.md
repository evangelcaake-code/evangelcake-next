# EvangelCake · Next.js

> Migración completa del sitio vanilla HTML/JS a Next.js 16 + React 19, con Supabase como base de datos y Resend para envío de emails.

---

## 📚 Índice

1. [Stack técnico nuevo](#stack-técnico-nuevo)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Setup inicial (15 minutos)](#setup-inicial-15-minutos)
4. [Comandos del día a día](#comandos-del-día-a-día)
5. [Cómo funcionan las cosas](#cómo-funcionan-las-cosas-formación)
6. [Deploy a producción](#deploy-a-producción)
7. [Estado de la migración](#estado-de-la-migración)

---

## Stack técnico nuevo

| Capa | Tecnología | Por qué |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR + SSG + API routes en un mismo proyecto, despliegue en Vercel en 1 click |
| **UI** | React 19 + TypeScript | Componentes reutilizables, autocompletado, menos bugs en runtime |
| **Estilos** | CSS global migrado del proyecto viejo | Cero rework visual — mismas clases, mismo look |
| **Base de datos** | Supabase (Postgres + RLS) | Hosted, gratis hasta 50k filas, panel de admin incluido |
| **Email transaccional** | Resend | 3.000 emails/mes gratis, deliverability profesional |
| **Hosting** | Vercel (recomendado) | Hosting gratis, CI automático con git push |

## Estructura del proyecto

```
evangelcake-next/
├── src/
│   ├── app/                    # App Router (cada carpeta = una ruta)
│   │   ├── layout.tsx          # Header + Footer + meta + Schema.org
│   │   ├── page.tsx            # / (home)
│   │   ├── globals.css         # Todos los estilos (~3900 líneas)
│   │   ├── game/page.tsx       # /game
│   │   ├── blog/page.tsx       # /blog
│   │   ├── blog/<slug>/page.tsx
│   │   ├── tartas-personalizadas/page.tsx
│   │   ├── galeria/page.tsx
│   │   ├── ...
│   │   ├── sitemap.ts          # genera /sitemap.xml automáticamente
│   │   ├── robots.ts           # genera /robots.txt automáticamente
│   │   └── api/                # endpoints del backend
│   │       ├── newsletter/route.ts  → POST captura email + manda código por Resend
│   │       ├── ranking/route.ts     → GET top, POST score (juego)
│   │       └── lead/route.ts        → POST formulario contacto/encargos
│   ├── components/             # componentes React reutilizables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── WhatsAppFloat.tsx
│   │   ├── CookiesBanner.tsx
│   │   ├── NewsletterForm.tsx
│   │   ├── ContactForm.tsx
│   │   └── Game.tsx            # ¡el juego entero!
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts       # cliente browser (anon key)
│       │   └── server.ts       # cliente admin (service role) — SOLO server-side
│       └── resend.ts           # cliente + plantillas email
├── supabase/
│   └── schema.sql              # ejecutar en SQL Editor de Supabase
├── public/
│   └── images/                 # todas las imágenes
├── .env.example                # copia esto a .env.local
└── package.json
```

---

## Setup inicial (15 minutos)

### 1. Variables de entorno

```bash
cp .env.example .env.local
# Abre .env.local y rellena con valores reales (ver pasos 2 y 3)
```

### 2. Configurar Supabase

1. Crear cuenta en https://supabase.com → **New project**
2. Esperar 1–2 min a que provisione
3. **Settings → API**: copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRETO — solo server-side)
4. **SQL Editor → New query**: pegar todo el contenido de `supabase/schema.sql` → Run
5. ¡Listo! Tienes 4 tablas: `subscribers`, `scores`, `leads`, `discount_codes`

### 3. Configurar Resend

1. Crear cuenta en https://resend.com
2. **API Keys → Create**: copia la key → `RESEND_API_KEY`
3. Para pruebas: `RESEND_FROM=onboarding@resend.dev`
4. Para producción: verifica tu dominio (Settings → Domains) → puedes enviar desde `hola@evangelcake.com`

### 4. Instalar y arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

---

## Comandos del día a día

```bash
npm run dev      # servidor de desarrollo con hot reload
npm run build    # build de producción (verifica TypeScript + optimiza)
npm run start    # arranca el build de producción local
npm run lint     # revisa errores de código
```

---

## Cómo funcionan las cosas (formación)

### 🧠 Conceptos clave de Next.js (App Router)

**1. Cada carpeta dentro de `src/app/` es una ruta.**
- `src/app/page.tsx` → `/`
- `src/app/blog/page.tsx` → `/blog`
- `src/app/blog/[slug]/page.tsx` → `/blog/lo-que-sea` (dinámico)

**2. Server Components por defecto.**
Los componentes se renderizan en el servidor (rápido, SEO friendly). Si necesitas
interactividad (estado, eventos, hooks), añades `"use client"` arriba del archivo.

```tsx
// Server Component (default)
export default function Page() {
  return <h1>Hola</h1>;
}

// Client Component
"use client";
import { useState } from "react";
export default function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

**3. API routes en `src/app/api/.../route.ts`.**
```ts
// src/app/api/saludo/route.ts
export async function GET() {
  return Response.json({ mensaje: "Hola!" });
}
```

**4. Metadata SEO via export.**
```tsx
export const metadata = {
  title: "Mi página",
  description: "Algo",
};
```
Next genera los `<meta>` tags automáticamente.

### 🗄 Supabase: cómo se usa

**Cliente browser (en `"use client"`):**
```ts
import { getSupabaseBrowser } from "@/lib/supabase/client";
const sb = getSupabaseBrowser();
const { data } = await sb.from("scores").select("*").limit(10);
```

**Cliente admin (en API routes — server-side):**
```ts
import { getSupabaseAdmin } from "@/lib/supabase/server";
const sb = getSupabaseAdmin();
await sb.from("subscribers").insert({ email, name });
```

**Ver datos:** Supabase dashboard → Table editor. Queries SQL en SQL Editor.

### 📧 Resend: cómo se usa

Solo desde API routes:

```ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: "EvangelCake <hola@evangelcake.com>",
  to: "destinatario@ejemplo.com",
  subject: "Asunto",
  html: "<h1>Hola</h1>",
});
```

Plantillas listas en `src/lib/resend.ts`:
- `sendWelcomeDiscount()` — código de descuento del 5%
- `sendLeadNotification()` — notificación interna del contacto

### 🎮 Flujo del juego paso a paso

1. Usuario entra a `/game` → form de registro
2. Submit → `POST /api/newsletter`
   - Inserta en `subscribers` (Supabase)
   - Genera código `EVAN-XXXX`
   - Inserta en `discount_codes`
   - Envía email con Resend
3. Juega 60 s
4. Termina → `POST /api/ranking`
   - Actualiza si supera score previo del mes
   - Devuelve posición + top 10
5. Ve resultado con su posición y top 5

### 🎁 Tu funnel de captación

Cuando alguien rellena cualquier form:
1. Email entra en Supabase → centralizado
2. Resend envía email con código del 5%
3. Cuando hagan el pedido lo mencionan, lo buscas en `discount_codes`
4. Al cumplir el pedido marcas `discount_used = true`

---

## Deploy a producción

### Opción A: Vercel (recomendado, gratis)

1. Cuenta en https://vercel.com con tu GitHub
2. Sube este proyecto a GitHub
3. Vercel → Add new project → Import tu repo
4. Environment Variables: pega las del `.env.local`
5. Deploy. En ~2 min tienes URL pública

**Custom domain:** Vercel → Project Settings → Domains → añade `evangelcake.com`.

### Opción B: cualquier hosting con Node 20+

```bash
npm run build
npm run start
```

---

## Estado de la migración

### ✅ Migrado y funcionando

- Estructura de páginas (13 rutas)
- Header + Footer + WhatsApp + Cookies banner
- CSS completo (3900 líneas, mismo look)
- Schema.org JSON-LD
- sitemap.xml + robots.txt automáticos
- API routes: newsletter, ranking, lead
- Cliente Supabase (browser + admin)
- Resend con 2 plantillas HTML
- Schema SQL (4 tablas + RLS + vista)
- **Juego entero** convertido a React
- Formulario contacto/encargos → Supabase
- Formulario newsletter → Supabase + email con código

### 🚧 Contenido textual abreviado (estructura lista, falta pegar texto largo)

- `/tartas-personalizadas` — falta el configurador
- `/galeria` — 8 fotos (el viejo tenía ~30)
- `/sobre-nosotros` — texto corto
- 3 posts del blog — versiones reducidas

Para migrar contenido completo: copia el texto de los HTML viejos en `evangelcake-web/` y pégalo en los `page.tsx`.

### 🔮 Próximos pasos opcionales

- Conectar `evangelcake.com` a Vercel
- Verificar dominio en Resend
- Migrar configurador de tartas (cart.js → React)
- Cloud Function mensual para anunciar ganadores
- Google Analytics 4

---

## 🆘 Si algo se rompe

| Síntoma | Causa |
|---|---|
| `/api/ranking` da 500 | Falta `.env.local` o tiene placeholders. Configura Supabase. |
| Build falla con TS error | Mira el log, suele ser un tipo en algún `page.tsx`. |
| Email no llega | `RESEND_FROM` debe ser dominio verificado, o usa `onboarding@resend.dev`. |
| RLS error en Supabase | Usaste `getSupabaseBrowser()` donde debería ser `getSupabaseAdmin()`. |

---

**Hecho con amor** · EvangelCake Andreia & Tiago
