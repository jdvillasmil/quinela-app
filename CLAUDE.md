# CLAUDE.md — Quiniela Proyelec Internacional · Mundial 2026

## Estado del proyecto

> Última actualización: 20 mayo 2026 · Faltan **22 días** para el inicio del torneo (11 jun)  
> Auditoría de producción completada — todas las rutas cargan sin errores de consola ni requests fallidos a Supabase

### Completado

| Sprint | Entregable | Fecha |
|---|---|---|
| Sprint 1 | Scaffold Next.js 14 + Tailwind + Poppins | 19 may 2026 |
| Sprint 1 | Tailwind configurado con colores Proyelec (`navy`, `skyblue`) | 19 may 2026 |
| Sprint 1 | Clientes Supabase SSR (`lib/supabase/server.ts` + `client.ts`) | 19 may 2026 |
| Sprint 1 | Middleware de sesión + protección de rutas | 19 may 2026 |
| Sprint 1 | Tipos TypeScript para todos los modelos de BD (`types/index.ts`) | 19 may 2026 |
| Sprint 1 | `.env.local` corregido (URL Supabase sin `/rest/v1/`) | 19 may 2026 |
| Sprint 2 | Pantalla de login completa con identidad Proyelec | 19 may 2026 |
| Sprint 2 | Pantalla de registro completa — validación @proyelec.com en cliente | 19 may 2026 |
| Sprint 2 | Estado de éxito post-registro con instrucciones de verificación | 19 may 2026 |
| Sprint 2 | Ruta `/auth/callback` — intercambio de código + creación de perfil | 19 may 2026 |
| Sprint 2 | Manejo de errores de Supabase Auth (link expirado, email duplicado, etc.) | 19 may 2026 |
| Sprint 2 | Migraciones SQL: 8 archivos en `supabase/migrations/` | 19 may 2026 |
| Sprint 2 | Tablas: `profiles`, `matches`, `predictions`, `group_predictions`, `special_predictions`, `bracket_predictions` | 19 may 2026 |
| Sprint 2 | Trigger `on_auth_user_created` → crea fila en `profiles` automáticamente | 19 may 2026 |
| Sprint 2 | Función `is_admin()` como `security definer` (evita recursión RLS) | 19 may 2026 |
| Sprint 2 | RLS activado en todas las tablas con políticas por rol + lock automático por `status` del partido | 19 may 2026 |
| Sprint 2 | Vista `leaderboard` + función `get_leaderboard()` como `security definer` | 19 may 2026 |
| Sprint 2 | Función `calculate_match_points(match_id)` + `calculate_group_standing_points(group)` (Con el fix de las escalas de puntuaciones de la fase eliminatoria) | 20 may 2026 |
| Sprint 2 | Seed del fixture completo: 104 partidos del fixture mundialista (fase de grupos + eliminatorias unificadas) | 20 may 2026 |
| Sprint 5 | Cliente API-Football (`lib/api-football/client.ts`) + Endpoint CRON job (`app/api/cron/update-matches/route.ts`) | 20 may 2026 |
| Sprint 6 | Deploy en Vercel (https://quinela-app.vercel.app) + Variables de entorno de producción | 20 may 2026 |
| Sprint 6 | Archivo `vercel.json` con la orquestación del background cron job para ejecutarse cada 5 minutos | 20 may 2026 |
| Sprint 3 | Layout dashboard (navbar + bottom nav) | 20 may 2026 |
| Sprint 3 | Pantalla de predicciones de grupos (48 partidos + 1°/2° por grupo) | 20 may 2026 |
| Sprint 3 | Pantalla de predicciones especiales (7 campos) | 20 may 2026 |
| Sprint 4 | Bracket eliminatorio con tabs por ronda (1/16, 1/8, 1/4, Semis/Final) | 20 may 2026 |
| Sprint 5 | Panel de admin (`/admin`) — métricas, gestión de partidos, usuarios, export CSV | 20 may 2026 |
| Sprint 6 | Auditoría producción: 0 errores consola, datos cargando via RSC, TypeScript limpio | 20 may 2026 |
| Sprint 6 | Ruta `/profile` — muestra username, email, nombre, apellido, rol, fecha de registro | 20 may 2026 |
| Sprint 6 | Fix `total_goals` input: atributos `min=0 max=500` en Premios Especiales | 20 may 2026 |
| Sprint 6 | Favicon SVG isotipo Proyelec (`public/favicon.svg`) registrado en metadata | 20 may 2026 |
| Sprint 6 | Excluir admins del leaderboard — `where pr.role = 'user'` en `get_leaderboard()` (`migrations/20260521000001`) | 21 may 2026 |
| Sprint 6 | Nombres de países en español — `lib/i18n/teams.ts` (48 equipos EN→ES); aplicado en predicciones, bracket y admin matches | 21 may 2026 |
| Sprint 6 | Pantalla de normas obligatoria — modal con reglas + checkbox; `rules_accepted_at` en `profiles` (`migrations/20260521000002`) | 21 may 2026 |

### Pendiente (orden de prioridad)

| # | Entregable | Notas |
|---|---|---|
| 1 | **Verificar emojis de banderas** — comprobar que los 48 equipos tienen emoji correcto en `matches.home_flag / away_flag`; reemplazar faltantes con código ISO | Auditar seed SQL; corregir en migración si hace falta |
| 2 | **Tabla de posiciones por grupo en `/predictions`** — se actualiza en tiempo real conforme el usuario llena los marcadores, mostrando clasificados simulados y posibles enfrentamientos de eliminatoria | Lógica client-side pura, sin llamadas extra a Supabase; derivada del estado del formulario |

---

## Contexto del proyecto
App web interna para la quiniela del Mundial USA/MEX/CAN 2026 de Proyelec International.
Solo empleados con correo @proyelec.com pueden registrarse.
Construida con Next.js 14, Supabase y Tailwind CSS. Deploy en Vercel.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend + API routes | Next.js 14 (App Router) |
| Base de datos + Auth + Realtime | Supabase (PostgreSQL) |
| Estilos | Tailwind CSS |
| Deploy | Vercel |
| Resultados en vivo | API-Football (RapidAPI) |
| Fuente | Poppins (Google Fonts) |

---

## Identidad visual — Proyelec

```
Azul principal:    #00205E  → fondo header, CTAs, botones primarios
Azul secundario:   #64AFE6  → acentos, badges, links, textos sobre navy
Blanco:            #FFFFFF  → fondos, texto sobre azul
Gris apoyo:        #444444  → texto secundario
Gris suave:        #CCCCCC  → bordes, fondos sutiles
Fuente:            Poppins (400 regular, 500 medium, 600 semibold)
Border radius:     8px elementos, 12px cards, 24px pills
```

Tailwind config custom colors:
```js
navy: '#00205E'
skyblue: '#64AFE6'
```

---

## Dominio y acceso
- Solo correos @proyelec.com pueden registrarse
- Supabase Auth con email + password
- Verificación de email obligatoria antes de poder entrar
- Validación del dominio tanto en frontend como en Supabase Auth hook

---

## Roles
- `user` — participante normal
- `admin` — acceso al panel de administración

El rol se guarda en la tabla `profiles.role`. El admin inicial se asigna manualmente en Supabase.

---

## Esquema de base de datos

### `profiles`
```sql
id          uuid references auth.users primary key
email       text not null
username    text unique not null
first_name  text not null
last_name   text not null
role        text default 'user' check (role in ('user', 'admin'))
avatar_url  text
created_at  timestamptz default now()
```

### `matches`
```sql
id              serial primary key
match_number    int unique not null        -- 1 a 104
phase           text not null              -- 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
group_name      text                       -- 'A'..'L', null en eliminatoria
home_team       text not null
away_team       text not null
home_flag       text                       -- emoji bandera
away_flag       text
match_date      timestamptz not null
venue           text
home_score      int                        -- null hasta que termine
away_score      int                        -- null hasta que termine
status          text default 'scheduled'   -- 'scheduled' | 'live' | 'finished'
api_match_id    text                       -- ID en API-Football
```

### `predictions`
```sql
id              serial primary key
user_id         uuid references profiles(id)
match_id        int references matches(id)
predicted_home  int not null
predicted_away  int not null
points_earned   int default 0
created_at      timestamptz default now()
unique(user_id, match_id)
```

### `group_predictions`
```sql
id          serial primary key
user_id     uuid references profiles(id)
group_name  text not null              -- 'A'..'L'
first_place text not null              -- nombre del equipo
second_place text not null
points_earned int default 0
unique(user_id, group_name)
```

### `special_predictions`
```sql
id              serial primary key
user_id         uuid references profiles(id)
top_scorer      text                   -- Bota de Oro
best_player     text                   -- Balón de Oro
best_keeper     text                   -- Guante de Oro
total_goals     int                    -- total goles del torneo
most_red_cards  text                   -- jugador con más rojas
most_goals_match text                  -- ej: "Argentina 4-1 Francia"
fastest_goal_team text                 -- equipo que mete el gol más rápido
points_earned   int default 0
created_at      timestamptz default now()
unique(user_id)
```

### `leaderboard` (vista materializada o calculada)
```sql
-- Vista que agrupa puntos por usuario
user_id         uuid
username        text
total_points    int
group_points    int
knockout_points int
special_points  int
rank            int
```

### `bracket_predictions`
```sql
id          serial primary key
user_id     uuid references profiles(id)
match_id    int references matches(id)   -- solo partidos fase eliminatoria
predicted_winner text not null
points_earned    int default 0
unique(user_id, match_id)
```

---

## Sistema de puntuación

### Fase de grupos (por partido)
| Criterio | Puntos |
|---|---|
| Signo 1X2 correcto (local / empate / visitante) | +1 pt |
| Diferencia de goles correcta (con 1X2 acertado) | +1 pt |
| Resultado exacto | +3 pts |
| 1er lugar del grupo correcto | +2 pts |
| 2do lugar del grupo correcto | +1 pt |

**Diferencia de goles:** se compara la diferencia (home - away) de la predicción con la real. Tiene que ser exacta.

### Fase eliminatoria (por partido, escala por ronda)
| Ronda | Ganador correcto | Resultado exacto |
|---|---|---|
| 1/16 | +2 pts | +4 pts |
| Octavos | +3 pts | +6 pts |
| Cuartos | +4 pts | +8 pts |
| Semifinales | +5 pts | +10 pts |
| Final — Campeón | +15 pts | — |
| Final — Subcampeón | +8 pts | — |
| 3er puesto | +5 pts | — |

### Predicciones especiales (se resuelven al final del torneo)
| Predicción | Puntos |
|---|---|
| Bota de Oro (máximo goleador) | +10 pts |
| Balón de Oro (mejor jugador) | +8 pts |
| Guante de Oro (mejor portero) | +6 pts |
| Total de goles del torneo (±5 goles) | +5 pts |
| Jugador con más tarjetas rojas | +4 pts |
| Partido con más goles (equipo local + resultado) | +6 pts |
| Equipo que mete el gol más rápido | +5 pts |

---

## Flujo de usuario

### Registro
1. Usuario entra a la app → pantalla de registro
2. Ingresa: correo @proyelec.com, nombre, apellido, username, contraseña
3. Sistema valida que el dominio sea @proyelec.com (rechazo inmediato si no)
4. Se envía email de verificación
5. Usuario verifica → puede entrar

### Fase 1 — Predicciones de grupos (hasta el 11 de junio)
- Pantalla "Mis predicciones" → pestaña "Grupos"
- 48 partidos organizados por grupo (A al L)
- Usuario ingresa marcador predicho para cada partido
- Usuario elige 1° y 2° de cada grupo
- **Se bloquean automáticamente al inicio del primer partido (11 jun)**
- Partidos sin predecir = 0 puntos, sin penalización

### Fase 1b — Predicciones especiales (hasta el 11 de junio)
- Pestaña separada "Especiales"
- 7 campos de texto/número
- Se bloquean el 11 de junio junto con los grupos
- Opcionales — no penalizan si se dejan en blanco

### Fase 2 — Bracket eliminatorio (ventana ~8-10 julio)
- Se activa automáticamente al terminar la fase de grupos
- Muestra los 32 clasificados reales
- Usuario llena bracket completo de una sola vez
- Se bloquea antes del primer partido de 1/16
- Si no se llena en la ventana → 0 puntos en eliminatoria

### Puntuación automática
- CRON job consulta API-Football cada 5 min durante partidos activos
- Al detectar `status: finished` → guarda resultado en `matches`
- Dispara función `calculate_points(match_id)` → actualiza `predictions.points_earned`
- Leaderboard se recalcula via Supabase Realtime

### Panel de admin
- Ruta protegida `/admin` (solo role = 'admin')
- Ver todos los usuarios y sus predicciones
- Editar resultado de un partido manualmente (fallback si API falla)
- Resolver predicciones especiales al final del torneo
- Exportar ranking final a CSV

---

## Estructura de carpetas (Next.js App Router)

```
/app
  /page.tsx                  → landing / redirect a /dashboard o /login
  /login/page.tsx
  /register/page.tsx
  /(dashboard)
    /layout.tsx              → navbar + bottom nav
    /dashboard/page.tsx      → pantalla inicio
    /predictions/page.tsx    → mis predicciones (grupos + especiales)
    /bracket/page.tsx        → bracket eliminatorio
    /leaderboard/page.tsx    → ranking
    /profile/page.tsx        → perfil de usuario
  /admin
    /layout.tsx              → layout admin protegido
    /page.tsx                → dashboard admin
    /matches/page.tsx        → gestión de resultados
    /users/page.tsx          → gestión de usuarios
    /specials/page.tsx       → resolver predicciones especiales
/components
  /ui/                       → componentes reutilizables
  /predictions/              → componentes de predicciones
  /leaderboard/              → componentes de ranking
  /bracket/                  → componentes del bracket
/lib
  /supabase/                 → cliente supabase (server + client)
  /scoring/                  → lógica de puntuación
  /api-football/             → integración API resultados
/types
  /index.ts                  → tipos TypeScript globales
```

---

## Variables de entorno (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
API_FOOTBALL_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Convenciones de código
- TypeScript estricto en todo el proyecto
- Componentes de servidor por defecto, `'use client'` solo cuando necesario
- Supabase SSR: usar `createServerClient` en server components, `createBrowserClient` en client
- Tailwind para estilos — sin CSS modules ni styled-components
- Colores en tailwind.config: `navy: '#00205E'`, `skyblue: '#64AFE6'`
- Nombres en español para variables de negocio, inglés para código
- Siempre usar RLS en Supabase — nunca exponer service role key al cliente

---

## Fechas clave
- 11 de junio 2026 → inicio del torneo / cierre de predicciones de grupos y especiales
- ~8 de julio 2026 → fin de fase de grupos / apertura de ventana de bracket
- ~10 de julio 2026 → cierre de bracket / inicio de 1/16
- 19 de julio 2026 → Final del Mundial / cierre del torneo

---

## Notas importantes para Claude Code
- Prioridad absoluta: que funcione antes del 11 de junio
- Si la API de resultados falla, el admin puede ingresar resultados manualmente — nunca bloquear el flujo
- El leaderboard NUNCA se resetea — los puntos de grupos se acumulan con eliminatoria
- RLS activo desde el día 1 — cada usuario solo lee/escribe sus propias predicciones
- El fixture completo (104 partidos) debe estar en DB antes de abrir el registro
