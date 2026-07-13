# Conectar Google Calendar a `/pedir-cita`

Este documento es el paso a paso para que Andreia (o quien gestione la agenda) enganche su Google Calendar con la web. Una vez hecho:

- La web pregunta al Google Calendar **qué huecos están libres** antes de mostrar los slots al cliente → nunca se ofrece un hueco ocupado.
- Al confirmar la cita, la web **crea el evento** en el Google Calendar de Andreia → aparece en la app del móvil, con notificación nativa.
- Si Andreia bloquea manualmente un rato en su Google Calendar ("comida familia 14-16h"), esos slots desaparecen de la web al momento.

> **Coste:** 0 €. La Google Calendar API es gratis hasta 1 M de llamadas al día. Nosotros vamos a hacer, con mucho, 100-200 al día.

---

## Paso 1 · Crear proyecto en Google Cloud Console

1. Entra en [console.cloud.google.com](https://console.cloud.google.com) con la cuenta Gmail que use **el Calendar de EvangelCake** (la de Andreia si es la suya, o una cuenta compartida si preferís).
2. Arriba a la izquierda pulsa **"Seleccionar un proyecto" → "Nuevo proyecto"**.
3. Ponle nombre `EvangelCake Reservas`. Deja la organización en blanco. Crear.
4. Espera 30 segundos y selecciona ese proyecto arriba.

## Paso 2 · Habilitar la Google Calendar API

1. Menú lateral izquierda → **"APIs y servicios" → "Biblioteca"**.
2. Busca `Google Calendar API` → click → **"Habilitar"**.

## Paso 3 · Crear una Cuenta de Servicio (service account)

Es una "cuenta técnica" que la web usa para hablar con el Calendar sin que Andreia tenga que iniciar sesión cada vez.

1. **"APIs y servicios" → "Credenciales"**.
2. Arriba **"Crear credenciales" → "Cuenta de servicio"**.
3. Nombre: `evangelcake-reservas`. Crear y continuar.
4. Rol: **Ninguno** (no hace falta rol dentro del proyecto). Continuar. Hecho.
5. En la lista de cuentas de servicio, entra en `evangelcake-reservas@…iam.gserviceaccount.com`.
6. Pestaña **"Claves" → "Añadir clave" → "Crear clave nueva" → JSON**.
7. Se descarga un archivo `.json`. **Guárdalo bien** — es como una contraseña.

**Anota** de ese JSON dos cosas:
- `"client_email"` — es el email del service account, algo tipo `evangelcake-reservas@evangelcake-reservas.iam.gserviceaccount.com`.
- `"private_key"` — es la clave completa (empieza por `-----BEGIN PRIVATE KEY-----`).

## Paso 4 · Compartir el Calendar con el service account

Aquí es donde le damos permiso al service account para leer/escribir en el Calendar de Andreia.

1. Abre [calendar.google.com](https://calendar.google.com) con la cuenta de Andreia.
2. En la barra lateral izquierda, sobre el calendario que quieras usar (probablemente "Mis eventos"), pasa el ratón y pulsa los **3 puntos → "Configuración y uso compartido"**.
3. Baja hasta **"Compartir con determinadas personas o grupos" → "Añadir personas y grupos"**.
4. Pega el email del service account (paso 3).
5. Permisos: **"Realizar cambios en los eventos"**.
6. Enviar. Ya está compartido.
7. Baja hasta **"Integrar el calendario" → "ID del calendario"**. Cópialo. Es algo tipo `andreia@gmail.com` o `abcd1234@group.calendar.google.com`.

## Paso 5 · Configurar `.env.local`

En el repo, en la raíz del proyecto (`evangelcake-next/.env.local`), añade estas variables:

```bash
# ── Google Calendar ────────────────────────────────
GOOGLE_CALENDAR_CONNECTED=true
GOOGLE_CALENDAR_ID=<el ID del calendario del paso 4>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<el client_email del paso 3>
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"

# ── Aviso a Betaña / Andreia por cada cita nueva ──
APPOINTMENTS_NOTIFY_TO=betana@evangelcake.com,andreia@evangelcake.com
```

> **Ojo con `GOOGLE_SERVICE_ACCOUNT_KEY`:** hay que meterla toda en una sola línea con los saltos como `\n`. Si abres el `.json` y copias el valor de `private_key`, ya viene así.

En Vercel: **Project → Settings → Environment Variables**, añade las mismas para `Production` (y `Preview` si quieres probar antes de mergear).

## Paso 6 · Instalar la dependencia + activar el código real

En terminal:

```bash
pnpm add googleapis
```

Después, en `src/lib/googleCalendar.ts` (ya creado como esqueleto con TODOs), reemplaza las tres funciones con la implementación real. Yo te lo dejo listo cuando confirmes que tienes las credenciales.

## Paso 7 · Verificar

1. `pnpm dev`.
2. Entra a `/pedir-cita`.
3. Elige un día y una hora → confirma la cita.
4. Abre [calendar.google.com](https://calendar.google.com) → debería aparecer el evento con nombre `Cita Cumpleaños — <nombre del cliente>`.
5. Vuelve a `/pedir-cita`, elige el **mismo día** y **misma hora** → ese slot debe estar marcado como "ocupado".

## Fallback (por si un día falla la API)

El código **no rompe la reserva** si Google Calendar falla — la cita se guarda igual en Supabase con estado `pending` y llega el email a Betaña. Simplemente el evento no aparece en el Calendar hasta que se sincronice manualmente.

---

## ¿Qué hago yo (Tiago) y qué haces tú (Andreia)?

- **Tú (Andreia)** — pasos 1 a 4: crear el proyecto en Google Cloud, habilitar la API, generar el service account, compartir tu Calendar con él. Me pasas el JSON y el ID del Calendar.
- **Yo (Tiago)** — pasos 5, 6 y 7: meter las variables de entorno en Vercel, escribir el código real de `googleCalendar.ts`, y verificar que todo va.
