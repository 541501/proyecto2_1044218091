# 📐 Plan de Arquitectura — ClassSport
## Sistema de Gestión y Reserva de Salones Universitarios

> **Versión:** 1.0  
> **Fecha:** Abril 2026  
> **Rol:** Arquitecto de Software Senior  
> **Proyecto:** ClassSport — Organizador de salones universitarios con bloqueo de horarios en tiempo real

---

## 1. Resumen Ejecutivo

ClassSport es una aplicación web fullstack SaaS universitaria que permite a profesores reservar salones de clase por franja horaria, garantizando que ningún salón pueda ser reservado dos veces en el mismo horario. El sistema maneja dos sedes universitarias, cada una con sus bloques de edificios y salones específicos.

El principio central de la arquitectura es la **integridad de reservas**: ninguna condición de carrera (race condition) puede resultar en un conflicto de horario. Esto determina las decisiones tecnológicas más importantes del sistema.

---

## 2. Tipo de Arquitectura

**Arquitectura seleccionada: Monolito Modular Serverless**

ClassSport usa una arquitectura de **monolito modular** desplegada sobre infraestructura serverless (Vercel). No es un monolito tradicional acoplado ni una arquitectura de microservicios — es un punto medio deliberado para un sistema de esta escala.

### Justificación de la elección

Un sistema de reservas universitario tiene las siguientes características que guían la decisión:

- **Dominio acotado y bien definido:** Sedes → Bloques → Salones → Reservas. No requiere la complejidad operacional de microservicios.
- **Equipo pequeño a mediano:** Los microservicios requieren madurez operacional y equipos grandes para justificarse.
- **Consistencia de datos crítica:** Las reservas deben ser atómicas. Una base de datos PostgreSQL con transacciones es superior a múltiples servicios coordinándose.
- **Serverless en Vercel:** Las API Routes de Next.js funcionan como funciones serverless individuales, dando las ventajas de escala sin la complejidad de microservicios.
- **Tiempo de desarrollo:** Un monolito modular bien estructurado se desarrolla significativamente más rápido.

### Diagrama conceptual de la arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│                    Next.js App Router (React)                   │
│          Server Components + Client Components + Hooks          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       VERCEL EDGE NETWORK                       │
│                    (CDN + Middleware Auth)                       │
└──────────┬────────────────────────────────────────┬────────────┘
           │                                        │
           ▼                                        ▼
┌──────────────────────┐                ┌───────────────────────┐
│   NEXT.JS APP ROUTER │                │   VERCEL SERVERLESS   │
│   (Server Components)│                │   FUNCTIONS           │
│   - Páginas SSR      │                │   /api/reservas       │
│   - Layouts          │                │   /api/salones        │
│   - Metadata         │                │   /api/sedes          │
└──────────────────────┘                │   /api/auth           │
                                        └──────────┬────────────┘
                                                   │
                                                   ▼
                                        ┌───────────────────────┐
                                        │    PRISMA ORM         │
                                        │  (Query Builder con   │
                                        │   tipado TypeScript)  │
                                        └──────────┬────────────┘
                                                   │
                                                   ▼
                                        ┌───────────────────────┐
                                        │    POSTGRESQL         │
                                        │    (Neon.tech)        │
                                        │  - Transacciones ACID │
                                        │  - Índices únicos     │
                                        │  - Row-level security │
                                        └───────────────────────┘
```

---

## 3. Stack Tecnológico

### 3.1 Frontend

| Tecnología | Versión | Propósito | Justificación |
|---|---|---|---|
| Next.js | 14.x | Framework React fullstack | App Router, SSR, API Routes, tipado de rutas |
| React | 18.x | UI library | Concurrent features, Server Components |
| TypeScript | 5.x strict | Lenguaje | Tipado estricto end-to-end, autocomplete en IDE |
| Tailwind CSS | 3.x | Estilos | Utility-first, consistencia de diseño, performance |
| shadcn/ui | latest | Componentes UI | Accesible, personalizable, basado en Radix UI |
| React Query (TanStack) | 5.x | Estado del servidor | Cache inteligente, revalidación, optimistic updates |
| React Hook Form | 7.x | Formularios | Performance, validación integrada con Zod |
| Zod | 3.x | Validación schemas | Single source of truth para tipos y validación |
| date-fns | 3.x | Manejo de fechas | Ligero, tree-shakable, soporte para horarios |
| Lucide React | latest | Iconos | Consistente, TypeScript nativo |

### 3.2 Backend

| Tecnología | Versión | Propósito | Justificación |
|---|---|---|---|
| Next.js API Routes | 14.x | Endpoints REST | Serverless, colocados con el frontend, tipados |
| Prisma ORM | 5.x | Acceso a BD | Type-safe queries, migrations, introspection |
| NextAuth.js | 5.x (v5 beta) | Autenticación | Providers múltiples, sesiones, JWT/DB sessions |
| bcryptjs | 2.x | Hashing passwords | Estándar seguro para contraseñas |
| zod | 3.x | Validación server | Validar body de requests en API Routes |

### 3.3 Base de Datos

| Tecnología | Propósito | Justificación |
|---|---|---|
| PostgreSQL 15 | Base de datos principal | ACID transactions, UNIQUE constraints, índices compuestos para garantizar integridad de reservas |
| Neon.tech | Hosting PostgreSQL serverless | Compatible con Vercel, branching de BD, conexiones pooled, tier gratuito generoso |
| Prisma Migrate | Control de versiones de schema | Migrations reproducibles, tipo-seguras |

### 3.4 DevOps e Infraestructura

| Tecnología | Propósito |
|---|---|
| Vercel | Deploy, CDN, serverless functions, preview environments |
| GitHub | Repositorio, CI/CD via GitHub Actions |
| GitHub Actions | Typecheck, lint, tests en cada PR |
| Neon.tech | PostgreSQL cloud con branching (una BD por entorno) |

### 3.5 Herramientas de Desarrollo

| Herramienta | Propósito |
|---|---|
| pnpm 9.x | Package manager (más rápido que npm, workspaces) |
| ESLint + @typescript-eslint | Análisis estático de código |
| Prettier | Formateo automático |
| Husky + lint-staged | Git hooks para validar antes de commit |
| Vitest | Unit testing |
| Playwright | E2E testing (flujo crítico de reservas) |

---

## 4. Modelo de Datos

### 4.1 Diagrama Entidad-Relación

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│    USUARIO   │        │    SEDE      │        │    BLOQUE    │
│──────────────│        │──────────────│        │──────────────│
│ id (PK)      │        │ id (PK)      │        │ id (PK)      │
│ nombre       │        │ nombre       │        │ nombre       │
│ email        │        │ descripcion  │        │ descripcion  │
│ password     │        │ direccion    │        │ sede_id (FK) │
│ rol          │        │ created_at   │        │ created_at   │
│ created_at   │        └──────┬───────┘        └──────┬───────┘
└──────┬───────┘               │ 1:N                   │ 1:N
       │                       ▼                       ▼
       │               ┌──────────────┐        ┌──────────────┐
       │               │   (Bloques)  │        │    SALÓN     │
       │               └──────────────┘        │──────────────│
       │                                       │ id (PK)      │
       │                                       │ nombre       │
       │                                       │ capacidad    │
       │                                       │ bloque_id(FK)│
       │                                       │ created_at   │
       │                                       └──────┬───────┘
       │                                              │
       │                    RESERVA                   │
       │            ┌───────────────────────┐         │
       └───────────▶│ id (PK)               │◀────────┘
       1:N          │ usuario_id (FK)        │ 1:N
                    │ salon_id (FK)          │
                    │ fecha (DATE)           │
                    │ hora_inicio (TIME)     │
                    │ hora_fin (TIME)        │
                    │ nombre_clase           │
                    │ descripcion            │
                    │ estado                 │
                    │ created_at             │
                    │                        │
                    │ UNIQUE(salon_id,        │
                    │   fecha, hora_inicio,  │
                    │   hora_fin) — CRÍTICO  │
                    └───────────────────────┘
```

### 4.2 Schema Prisma completo

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Rol {
  ADMIN
  PROFESOR
}

enum EstadoReserva {
  ACTIVA
  CANCELADA
}

model Usuario {
  id         String    @id @default(cuid())
  nombre     String
  email      String    @unique
  password   String
  rol        Rol       @default(PROFESOR)
  reservas   Reserva[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@map("usuarios")
}

model Sede {
  id          String   @id @default(cuid())
  nombre      String   @unique
  descripcion String?
  direccion   String
  bloques     Bloque[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("sedes")
}

model Bloque {
  id          String   @id @default(cuid())
  nombre      String
  descripcion String?
  sedeId      String
  sede        Sede     @relation(fields: [sedeId], references: [id])
  salones     Salon[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([sedeId, nombre])
  @@map("bloques")
}

model Salon {
  id         String    @id @default(cuid())
  nombre     String
  capacidad  Int       @default(30)
  bloqueId   String
  bloque     Bloque    @relation(fields: [bloqueId], references: [id])
  reservas   Reserva[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@unique([bloqueId, nombre])
  @@map("salones")
}

model Reserva {
  id           String        @id @default(cuid())
  usuarioId    String
  salonId      String
  fecha        DateTime      @db.Date
  horaInicio   DateTime      @db.Time
  horaFin      DateTime      @db.Time
  nombreClase  String
  descripcion  String?
  estado       EstadoReserva @default(ACTIVA)
  usuario      Usuario       @relation(fields: [usuarioId], references: [id])
  salon        Salon         @relation(fields: [salonId], references: [id])
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  // CONSTRAINT CRÍTICO: garantiza que ningún salón tenga
  // dos reservas activas que se solapen en fecha y horario
  @@unique([salonId, fecha, horaInicio, horaFin])
  @@index([salonId, fecha])
  @@index([usuarioId])
  @@map("reservas")
}
```

---

## 5. Estructura de Carpetas del Proyecto

```
classsport/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # TypeScript check + lint + test en PRs
│       └── e2e.yml                     # Playwright en rama main
│
├── app/                                # Next.js App Router
│   ├── (auth)/                         # Route group sin layout principal
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── registro/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                    # Route group con layout de app
│   │   ├── layout.tsx                  # Sidebar + Header
│   │   ├── page.tsx                    # Dashboard: vista general de hoy
│   │   ├── sedes/
│   │   │   ├── page.tsx                # Lista de sedes
│   │   │   └── [sedeId]/
│   │   │       ├── page.tsx            # Detalle de sede con bloques
│   │   │       └── [bloqueId]/
│   │   │           └── page.tsx        # Detalle bloque con salones
│   │   ├── salones/
│   │   │   ├── page.tsx                # Vista de todos los salones + calendario
│   │   │   └── [salonId]/
│   │   │       └── page.tsx            # Salón individual con horarios
│   │   ├── reservas/
│   │   │   ├── page.tsx                # Mis reservas (profesor)
│   │   │   ├── nueva/
│   │   │   │   └── page.tsx            # Formulario nueva reserva
│   │   │   └── [reservaId]/
│   │   │       └── page.tsx            # Detalle de reserva
│   │   └── admin/                      # Solo rol ADMIN
│   │       ├── page.tsx
│   │       ├── sedes/
│   │       ├── bloques/
│   │       ├── salones/
│   │       └── usuarios/
│   │
│   ├── api/                            # API Routes (serverless functions)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts            # NextAuth handler
│   │   ├── sedes/
│   │   │   ├── route.ts                # GET /api/sedes, POST /api/sedes
│   │   │   └── [sedeId]/
│   │   │       ├── route.ts            # GET, PUT, DELETE
│   │   │       └── bloques/
│   │   │           └── route.ts
│   │   ├── salones/
│   │   │   ├── route.ts
│   │   │   └── [salonId]/
│   │   │       ├── route.ts
│   │   │       └── disponibilidad/
│   │   │           └── route.ts        # GET disponibilidad por fecha
│   │   └── reservas/
│   │       ├── route.ts                # GET, POST (con lógica de bloqueo)
│   │       └── [reservaId]/
│   │           └── route.ts            # GET, PUT (cancelar), DELETE
│   │
│   ├── globals.css
│   └── layout.tsx                      # Root layout + providers
│
├── components/
│   ├── ui/                             # shadcn/ui base components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── reservas/
│   │   ├── FormularioReserva.tsx       # Formulario con validación
│   │   ├── CalendarioSalon.tsx         # Vista de horarios por día
│   │   ├── TarjetaReserva.tsx
│   │   └── SelectorHorario.tsx        # Picker de hora con slots bloqueados
│   ├── salones/
│   │   ├── GridSalones.tsx
│   │   ├── TarjetaSalon.tsx
│   │   └── MapaSede.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── prisma.ts                       # Singleton de PrismaClient
│   ├── auth.ts                         # Configuración NextAuth
│   ├── validations/
│   │   ├── reserva.schema.ts           # Zod schemas para reservas
│   │   ├── sede.schema.ts
│   │   └── usuario.schema.ts
│   ├── services/
│   │   ├── reservas.service.ts         # Lógica de negocio de reservas
│   │   ├── salones.service.ts
│   │   └── sedes.service.ts
│   ├── utils/
│   │   ├── horarios.ts                 # Utilidades de cálculo de horarios
│   │   ├── formato.ts
│   │   └── errores.ts
│   └── types/
│       └── index.ts                    # Tipos globales derivados de Prisma
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                         # Datos iniciales (sedes, bloques, salones)
│
├── tests/
│   ├── unit/
│   │   └── reservas.service.test.ts
│   └── e2e/
│       └── flujo-reserva.spec.ts
│
├── public/
│   └── logo.svg
│
├── .env.example
├── .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Flujo de Datos — Reserva de Salón

El flujo más crítico del sistema es el proceso de crear una reserva. Aquí se concentra la mayor complejidad técnica:

```
PROFESOR (Browser)
       │
       │ 1. Selecciona sede → bloque → salón → fecha
       │
       ▼
COMPONENTE CalendarioSalon.tsx (Client Component)
       │
       │ 2. React Query: GET /api/salones/:id/disponibilidad?fecha=YYYY-MM-DD
       │    → Carga horarios ocupados del día
       │
       ▼
API ROUTE /api/salones/[salonId]/disponibilidad
       │
       │ 3. Prisma: SELECT reservas WHERE salonId=X AND fecha=Y AND estado=ACTIVA
       │    → Retorna array de { horaInicio, horaFin } ocupados
       │
       ▼
COMPONENTE SelectorHorario.tsx
       │
       │ 4. Muestra slots de 1 hora (7:00–22:00)
       │    Slots ocupados → bloqueados visualmente (gris, no clickeable)
       │    Slots libres → disponibles (verde, clickeable)
       │
       ▼
COMPONENTE FormularioReserva.tsx
       │
       │ 5. Profesor completa: nombreClase, descripción, hora seleccionada
       │    Zod valida el formulario en el cliente antes de enviar
       │
       ▼
API ROUTE POST /api/reservas
       │
       │ 6. Validación server-side con Zod (nunca confiar solo en cliente)
       │
       │ 7. TRANSACCIÓN POSTGRESQL (punto crítico):
       │    BEGIN TRANSACTION
       │      SELECT COUNT(*) FROM reservas
       │        WHERE salonId = :salonId
       │          AND fecha = :fecha
       │          AND estado = 'ACTIVA'
       │          AND NOT (horaFin <= :horaInicio OR horaInicio >= :horaFin)
       │        FOR UPDATE  ← bloqueo pesimista de las filas afectadas
       │      
       │      SI count > 0:
       │        ROLLBACK → Error 409 Conflict
       │      
       │      SI count = 0:
       │        INSERT INTO reservas (...) VALUES (...)
       │        COMMIT → Éxito 201 Created
       │
       ▼
RESPONSE al cliente
       │
       │ 8a. 201 Created → React Query invalida caché del calendario
       │     → UI actualiza automáticamente mostrando el slot bloqueado
       │
       │ 8b. 409 Conflict → Toast de error: "Este horario ya fue reservado"
       │     → UI refresca la disponibilidad
       │
       ▼
FIN DEL FLUJO
```

---

## 7. Estrategia Anti-Conflictos de Reserva

Esta es la decisión arquitectónica más importante del sistema. Se implementan tres capas de defensa:

### Capa 1 — UX preventiva (cliente)
El calendario muestra en tiempo real los slots ocupados. El usuario nunca debería poder seleccionar un horario ocupado porque la UI lo bloquea visualmente. Revalidación con React Query cada 30 segundos.

### Capa 2 — Transacción con bloqueo pesimista (servidor)
Toda creación de reserva ocurre dentro de una transacción PostgreSQL con `SELECT ... FOR UPDATE`, que bloquea las filas involucradas durante la transacción. Esto previene condiciones de carrera cuando dos profesores intentan reservar el mismo salón simultáneamente.

### Capa 3 — Constraint de base de datos (persistencia)
El constraint `@@unique([salonId, fecha, horaInicio, horaFin])` en el schema de Prisma es la última línea de defensa. Incluso si las capas 1 y 2 fallan, PostgreSQL rechazará a nivel de motor cualquier reserva duplicada. Esta violación retorna un error `P2002` de Prisma que se mapea a una respuesta `409 Conflict`.

---

## 8. Autenticación y Autorización

### Flujo de autenticación

```
Usuario                  NextAuth                  PostgreSQL
   │                        │                          │
   │── POST /api/auth ──────▶│                          │
   │   (email+password)      │── SELECT usuario ───────▶│
   │                         │◀── { hash, rol } ────────│
   │                         │ bcrypt.compare()         │
   │                         │                          │
   │◀── JWT session ─────────│                          │
   │    { id, email, rol }   │                          │
```

### Roles y permisos

| Acción | PROFESOR | ADMIN |
|---|:---:|:---:|
| Ver sedes, bloques, salones | ✅ | ✅ |
| Ver disponibilidad de salones | ✅ | ✅ |
| Crear reserva propia | ✅ | ✅ |
| Cancelar reserva propia | ✅ | ✅ |
| Ver reservas de otros profesores | ❌ | ✅ |
| Cancelar reservas de otros | ❌ | ✅ |
| Crear/editar sedes, bloques, salones | ❌ | ✅ |
| Gestionar usuarios | ❌ | ✅ |

### Protección de rutas

- **Middleware de Next.js** (`middleware.ts`): redirige a `/login` si no hay sesión activa en rutas protegidas.
- **API Routes**: verifican sesión con `getServerSession()` antes de procesar cualquier request.
- **Rutas `/admin/*`**: verifican adicionalmente que `session.user.rol === 'ADMIN'`.

---

## 9. Consideraciones de Escalabilidad

### Conexiones a base de datos
Vercel serverless functions crean una nueva instancia por invocación. Sin un pool de conexiones, esto agotaría los límites de PostgreSQL. Solución: **Neon.tech connection pooling** (PgBouncer integrado) + singleton de PrismaClient con instancia reutilizada via `global`.

```typescript
// lib/prisma.ts — patrón singleton para serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Caché de disponibilidad
La disponibilidad de salones es consultada frecuentemente. React Query con `staleTime: 30_000` evita consultas redundantes al servidor desde el mismo cliente.

### Índices de base de datos
Los índices `@@index([salonId, fecha])` y `@@index([usuarioId])` garantizan que las consultas de disponibilidad y listado de reservas sean O(log n) incluso con miles de reservas históricas.

---

## 10. Consideraciones de Seguridad

| Amenaza | Mitigación implementada |
|---|---|
| Acceso sin autenticación | Middleware Next.js protege todas las rutas de la app |
| Manipulación de IDs en API | Cada endpoint verifica que el recurso pertenece al usuario autenticado |
| Inyección SQL | Prisma ORM usa prepared statements por defecto |
| Passwords en texto plano | bcryptjs con salt rounds = 12 |
| CSRF | NextAuth maneja tokens CSRF automáticamente |
| Race conditions en reservas | Transacciones + FOR UPDATE + UNIQUE constraint (triple capa) |
| Variables de entorno expuestas | `.env.local` en `.gitignore`; solo `NEXT_PUBLIC_*` van al cliente |
| Validación solo en cliente | Zod valida siempre en el servidor, nunca se confía solo en el cliente |

---

## 11. Consideraciones de Rendimiento

- **Server Components por defecto**: Los componentes de solo lectura (listas de sedes, salones) son Server Components que renderizan en el servidor sin JavaScript en el cliente.
- **Streaming con Suspense**: Las páginas usan `loading.tsx` y `Suspense` para mostrar skeletons mientras cargan datos.
- **Optimistic Updates**: Al crear una reserva, React Query actualiza la UI optimistamente antes de confirmar con el servidor.
- **ISR limitado**: Las páginas de sedes y bloques tienen poca variación — pueden usar `revalidate: 3600` (1 hora).
- **Imágenes**: `next/image` para logos e imágenes de sedes con optimización automática.

---

## 12. Entornos

| Entorno | Rama Git | Base de datos | URL |
|---|---|---|---|
| Desarrollo local | cualquiera | Neon branch `dev` | localhost:3000 |
| Preview (por PR) | feature/* | Neon branch `preview` | *.vercel.app |
| Staging | develop | Neon branch `staging` | staging.classsport.app |
| Producción | main | Neon branch `main` | classsport.app |

---

## 13. Variables de Entorno

```bash
# Base de datos (Neon.tech)
DATABASE_URL="postgresql://...?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://...?sslmode=require"  # Para migrations

# NextAuth
NEXTAUTH_URL="https://classsport.app"
NEXTAUTH_SECRET="[generado con: openssl rand -base64 32]"

# App
NEXT_PUBLIC_APP_NAME="ClassSport"
NEXT_PUBLIC_APP_URL="https://classsport.app"
NODE_ENV="production"
```

---

*Este documento de arquitectura es la fuente de verdad técnica del proyecto ClassSport. Toda decisión de implementación debe ser coherente con las decisiones aquí documentadas.*
