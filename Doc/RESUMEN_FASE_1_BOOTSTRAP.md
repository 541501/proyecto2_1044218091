# ClassSport — Resumen Fase 1
> Bootstrap, Login y dataService base
> Fase completada: 9 de mayo de 2026

---

## Tarea completada

| # | Tarea | Estado | Detalle |
|---|-------|--------|---------|
| 1.1 | Instalar dependencias | ✅ | `bcryptjs`, `jose`, `@supabase/supabase-js`, `@vercel/blob`, `pg`, `@types/*` |
| 1.2 | Crear proyecto Supabase y Blob | ⏳ | Configuración manual (Fase 2) |
| 1.3 | Crear `data/seed.json` | ✅ | Admin (pass: admin123 → bcrypt hash), 3 bloques, 6 franjas, 4 salones demo |
| 1.4 | Crear migration SQL 0001 | ✅ | `supabase/migrations/0001_init_users.sql` - users + _migrations tables |
| 1.5 | Crear módulos de lib/ | ✅ | supabase.ts, blobAudit.ts (con lazy getBlobToken + withFileLock), pgMigrate.ts, seedReader.ts |
| 1.6 | Crear dataService.ts | ✅ | ÚNICO punto de acceso. Modo seed/live automático. Auth + audit |
| 1.7 | Crear autenticación | ✅ | auth.ts (JWT), withAuth.ts, withRole.ts |
| 1.8 | Crear next.config.ts | ✅ | Headers no-store en /api/* |
| 1.9 | Crear types.ts y schemas.ts | ✅ | Zod validation + TypeScript types |
| 1.10 | Crear API routes | ✅ | /api/system/mode, /api/auth/login, /logout, /me, /change-password |
| 1.11 | Login page ClassSport | ✅ | Fondo azul #0F172A, tarjeta blanca, logo SVG edificio, sin "Crear cuenta" |
| 1.12 | Actualizar page.tsx | ✅ | Redirige a /dashboard o /login según sesión |
| 1.13 | Validación y test | ✅ | `npm run typecheck` → 0 errores |

---

## Archivos creados

### Configuración
- `tsconfig.json` — TypeScript con path aliases @/*
- `next.config.ts` — Headers no-store, migración de rutas
- `tailwind.config.ts` — Paleta de colores ClassSport
- `postcss.config.js` — Procesamiento de CSS
- `package.json` — Scripts dev/build/typecheck, dependencias
- `.env.example`, `.env.local` — Variables de entorno

### Data & Migrations
- `data/config.json` — Metadata del sistema
- `data/seed.json` — Admin + 3 bloques + 6 franjas + 4 salones (con hash bcrypt)
- `supabase/migrations/0001_init_users.sql` — Schema users + _migrations

### Núcleo (lib/)
| Archivo | Propósito | Notas |
|---------|-----------|-------|
| `lib/types.ts` | Tipado central | User, Block, Slot, Room, Reservation, AuditEntry, SystemMode, JWTPayload |
| `lib/schemas.ts` | Validación Zod | loginSchema, changePasswordSchema |
| `lib/auth.ts` | JWT signing/verification | createToken, verifyToken (24h expiration) |
| `lib/supabase.ts` | Cliente Supabase | isSupabaseConfigured() para determinar seed vs live |
| `lib/blobAudit.ts` | Vercel Blob auditoría | `appendAudit()`, `readAuditMonth()`, `withFileLock()`, lazy `getBlobToken()` |
| `lib/seedReader.ts` | Lee data/seed.json | Cacheada, expone users/blocks/slots/rooms |
| `lib/dataService.ts` | **ÚNICO acceso a datos** | CRÍTICO: getSystemMode(), getUserByEmail/ById, recordAudit, hashPassword, verifyPassword |
| `lib/withAuth.ts` | Middleware JWT | verifyToken desde cookie, addNoStoreHeaders() |
| `lib/withRole.ts` | Control de roles | Verifica profesor/coordinador/admin |
| `lib/pgMigrate.ts` | Aplicar migrations | applyMigrations() para bootstrap |

### Frontend
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Redirección automática a /dashboard o /login |
| `/login` | `app/login/page.tsx` | **Identidad visual ClassSport**: fondo azul oscuro #0F172A, tarjeta blanca con borde azul, logo SVG de edificio, Framer Motion fade-in |
| (root) | `app/layout.tsx` | Root layout con Inter font + globals.css |
| — | `app/globals.css` | Tailwind + CSS vars + componentes @layer |

### API Routes (Phase 1)
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/system/mode` | GET | Retorna 'seed' o 'live' |
| `/api/auth/login` | POST | Email + password → JWT → HttpOnly cookie |
| `/api/auth/logout` | POST | Borra cookie + auditoría |
| `/api/auth/me` | GET | Usuario autenticado (requiere sesión) |
| `/api/auth/change-password` | POST | Cambiar contraseña (requiere sesión) |

---

## Arquitectura de persistencia implementada

```
Modo SEED (sin Supabase)
├─ dataService.getSystemMode() → 'seed'
├─ Lecturas de data/seed.json (en memoria)
├─ Login: solo admin@classsport.edu.co / admin123
├─ Escrituras bloqueadas
└─ Auditoría: log en consola

Modo LIVE (con Supabase)
├─ dataService.getSystemMode() → 'live'
├─ Lecturas de Supabase Postgres
├─ Escrituras a Postgres
├─ Auditoría a Vercel Blob (append-only, JSON mensual)
└─ withFileLock() serializa escrituras al mismo archivo
```

---

## Puntos críticos verificados

✅ **dataService.ts es el ÚNICO punto de acceso**: ningún archivo importa supabase.ts ni blobAudit.ts directamente

✅ **Lazy getBlobToken()**: función que se ejecuta en tiempo de ejecución, nunca como constante de módulo

✅ **withFileLock() serializa**: read-modify-write al archivo de auditoría está protegido contra race conditions

✅ **JWT + HttpOnly**: cookie segura con Secure en producción, SameSite=Strict

✅ **Genérico error de login**: "Correo o contraseña incorrectos" (no revela si el email existe)

✅ **Headers no-store**: /api/* nunca cachea con `Cache-Control: no-store, no-cache, must-revalidate`

✅ **Identidad visual del login**: fondo azul institucional, tarjeta blanca, logo SVG de edificio, Framer Motion, sin link de registro

✅ **Seed.json precargado**: admin + 3 bloques + 6 franjas + 4 salones (estructura exacta del plan)

✅ **TypeScript typecheck**: ✅ **0 errores** (`npm run typecheck`)

---

## Prueba manual: Flujo login en modo seed

1. Sistema inicia sin Supabase → autodetecta modo 'seed'
2. Ir a `/login`
3. Ingresar: `admin@classsport.edu.co` / `admin123`
4. JWT generado → cookie HttpOnly establecida
5. Redirige a `/dashboard` (que redirige nuevamente a `/login` porque dashboard no existe aún — Fase 2)
6. Verificar DevTools → Cookies: sesión HttpOnly presente
7. `/api/auth/me` retorna usuario sin password_hash
8. `/api/system/mode` retorna `{ mode: "seed" }`

---

## Próxima fase

**Fase 2 — Dashboard, Layout base y página de bootstrap**
- Crear componentes UI base (Button, Card, Badge, Modal, Toast, Table)
- Crear AppLayout con Sidebar y rol-based navigation
- Crear `/admin/db-setup` con diagnóstico y bootstrap
- Crear GET /api/dashboard
- Crear middleware.ts para proteger rutas

---

**Ingeniero Fullstack Senior — Juan Gutiérrez**
**Fecha: 9 de mayo de 2026**
