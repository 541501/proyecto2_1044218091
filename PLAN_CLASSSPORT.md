# ClassSport — Plan Maestro del Sistema
> Plataforma Digital de Gestión de Salones Universitarios | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Juan Gutiérrez | Doc: 1044218091

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Estrategia de seguridad](#19-estrategia-de-seguridad)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

**ClassSport** es una plataforma web que digitaliza y centraliza la asignación de salones en instituciones universitarias. Reemplaza los procesos manuales de reserva por un sistema organizado con verificación automática de disponibilidad en tiempo real.

El sistema permite a los profesores seleccionar un bloque académico, un salón y una franja horaria para hacer su reserva, mientras que coordinadores y administradores gestionan la disponibilidad global, los usuarios y los reportes de ocupación.

Opera completamente desde el navegador con Next.js App Router en Vercel. Persiste todos los datos estructurados en Supabase Postgres y registra la auditoría de operaciones (RN-08) en Vercel Blob.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve ClassSport |
|---|---|
| Desorganización en la asignación de salones por ausencia de sistema centralizado. | Inventario digital de salones por bloque, consultable en tiempo real desde cualquier dispositivo. |
| Conflictos de horario cuando dos profesores reservan el mismo salón a la misma hora. | UNIQUE en base de datos que impide físicamente el doble registro. El servidor verifica antes de insertar. |
| Imposibilidad de conocer en tiempo real qué salones están disponibles. | Calendario semanal por salón con estado actualizado al cargar la página. |
| Pérdida de tiempo en coordinación manual entre profesores y personal administrativo. | Flujo de reserva autoservicio: el profesor reserva directamente sin intermediarios. |
| Falta de reportes de ocupación para decisiones sobre uso de espacios. | Reporte exportable en CSV con filtros por período y bloque. |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Profesor** | Interno | Hace y cancela sus propias reservas. Consulta disponibilidad. |
| **Coordinador** | Interno | Consulta disponibilidad y reportes de su bloque o de todos. Puede cancelar reservas con motivo. |
| **Administrador** | Interno | Acceso total. Gestiona salones, usuarios y reportes globales. |
| **Sistema** | No humano | Verifica conflictos, valida reglas de negocio, registra auditoría automáticamente. |

> Los usuarios no se registran solos — el administrador crea las cuentas y asigna los roles. No hay registro público en ClassSport.

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Profesor | Coordinador | Administrador |
|---|:-:|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ❌ | ✅ |
| **BLOQUES Y SALONES** | | | |
| Ver bloques y salones | ✅ | ✅ | ✅ |
| Ver disponibilidad (calendario semanal) | ✅ | ✅ | ✅ |
| Crear / editar salón | ❌ | ❌ | ✅ |
| Desactivar salón | ❌ | ❌ | ✅ |
| **RESERVAS** | | | |
| Crear reserva propia | ✅ | ❌ | ✅ |
| Ver mis reservas | ✅ | ❌ | ✅ |
| Cancelar reserva propia (solo futuras) | ✅ | ❌ | ✅ |
| Ver todas las reservas | ❌ | ✅ | ✅ |
| Cancelar cualquier reserva con motivo | ❌ | ✅ | ✅ |
| **REPORTES** | | | |
| Generar y exportar reporte de ocupación | ❌ | ✅ | ✅ |
| **USUARIOS** | | | |
| Crear / editar / desactivar usuarios | ❌ | ❌ | ✅ |
| **AUDITORÍA** | | | |
| Ver bitácora de operaciones | ❌ | ❌ | ✅ |

### Comportamiento por rol

**Profesor**: su experiencia central es el flujo de reserva. Ve los bloques, elige salón y franja, confirma. Solo puede ver y cancelar sus propias reservas futuras. La cancelación de reservas pasadas o del día en curso está bloqueada (RN-04).

**Coordinador**: rol de supervisión. Consulta la disponibilidad de cualquier salón, ve todas las reservas y puede cancelarlas con indicación de motivo. Puede generar reportes. No hace reservas propias en el sistema (su función es gestión, no docencia).

**Administrador**: acceso total. Crea y gestiona usuarios, salones y bloques. Es el único que puede ejecutar el bootstrap inicial y ver la auditoría completa.

---

## 5. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Ingresa correo y contraseña. El sistema valida, crea JWT y redirige al panel correspondiente al rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión y redirige al login. |
| CU-A3 | Cambiar contraseña | Todos | Actualiza contraseña verificando la actual. |

### Módulo de Disponibilidad

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Consultar disponibilidad | Todos | El usuario selecciona una fecha y ve los tres bloques con el conteo de salones disponibles. Selecciona un bloque, luego un salón, y ve el calendario semanal con franjas libres (verde) y ocupadas (rojo + nombre del profesor y materia). |
| CU-02 | Navegar entre semanas | Todos | El usuario puede avanzar o retroceder semanas en el calendario del salón. |

### Módulo de Reservas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-03 | Crear reserva | Profesor / Admin | El profesor selecciona fecha, bloque, salón y franja. Ingresa materia y grupo. El sistema valida reglas y verifica que no haya conflicto. Si todo pasa, registra la reserva. |
| CU-04 | Ver mis reservas | Profesor / Admin | Listado de todas las reservas propias con filtros por estado (confirmada/cancelada) y por fecha. |
| CU-05 | Cancelar reserva propia | Profesor / Admin | El profesor cancela una reserva futura propia. El sistema pide confirmación y libera la franja. |
| CU-06 | Ver todas las reservas | Coordinador / Admin | Vista global de todas las reservas con filtros por bloque, fecha y estado. |
| CU-07 | Cancelar cualquier reserva | Coordinador / Admin | Cancela una reserva activa de cualquier profesor con indicación obligatoria de motivo. |

### Módulo de Salones

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-08 | Ver salones | Todos | Lista de todos los salones activos con su bloque, código, tipo, capacidad y equipamiento. |
| CU-09 | Crear salón | Admin | Registra un nuevo salón con código único dentro del bloque, tipo, capacidad y equipamiento. |
| CU-10 | Editar salón | Admin | Modifica los datos de un salón existente. |
| CU-11 | Desactivar salón | Admin | Desactiva un salón. Si tiene reservas futuras activas, muestra advertencia con el conteo antes de proceder. |

### Módulo de Reportes y Administración

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-12 | Generar reporte de ocupación | Coordinador / Admin | Selecciona rango de fechas y bloque opcional. El sistema genera la tabla y permite exportarla en CSV. |
| CU-13 | Crear usuario | Admin | Crea un usuario con nombre, correo, rol y contraseña temporal. |
| CU-14 | Gestionar usuarios | Admin | Edita datos, activa o desactiva cuentas de usuario. |
| CU-15 | Ver auditoría | Admin | Consulta la bitácora mensual de operaciones desde Vercel Blob. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema debe permitir iniciar y cerrar sesión con correo y contraseña. |
| RF-02 | El sistema debe diferenciar tres roles (Profesor, Coordinador, Administrador) con permisos distintos. |
| RF-03 | El sistema debe mostrar los bloques A, B y C con sus salones y la disponibilidad en tiempo real para una fecha seleccionada. |
| RF-04 | El sistema debe mostrar un calendario semanal por salón donde cada franja indica su estado (libre u ocupada) con el nombre del profesor y materia si está ocupada. |
| RF-05 | El sistema debe permitir al profesor crear una reserva seleccionando bloque, salón, franja horaria, materia y grupo. |
| RF-06 | El sistema debe detectar y rechazar automáticamente cualquier intento de reservar una franja ya ocupada, mostrando el detalle del conflicto. |
| RF-07 | El sistema debe permitir al profesor cancelar sus reservas futuras, y al coordinador/admin cancelar cualquier reserva con motivo. |
| RF-08 | El sistema debe mostrar al profesor el historial de sus reservas con filtros por estado y fecha. |
| RF-09 | El sistema debe proporcionar al admin/coordinador una vista global del estado de todos los salones para una fecha seleccionada. |
| RF-10 | El sistema debe permitir al admin crear, editar y desactivar salones con sus atributos completos. |
| RF-11 | El sistema debe permitir al admin crear usuarios, asignar roles y activar o desactivar cuentas. |
| RF-12 | El sistema debe generar un reporte de ocupación por período exportable en CSV. |
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | No puede existir más de una reserva activa para el mismo salón, la misma franja y la misma fecha. | UNIQUE compuesto en `reservations(room_id, slot_id, reservation_date)` con `status = 'confirmada'`. El servidor verifica antes de insertar y Postgres rechaza el duplicado como segunda capa. |
| RN-02 | Las reservas solo pueden realizarse de lunes a viernes. | Validación Zod: `reservation_date` debe ser `getDay() >= 1 && getDay() <= 5` en zona horaria `America/Bogota`. |
| RN-03 | Un profesor no puede crear una reserva con más de 60 días de anticipación. | Validación en el servidor: `reservation_date - today <= 60 días`. |
| RN-04 | Un profesor solo puede cancelar reservas cuya fecha de uso sea posterior a la fecha actual. No se pueden cancelar reservas del día en curso ni pasadas. | Verificar `reservation_date > today` (fecha completa, no hora) antes de permitir la cancelación del profesor. El coordinador y el admin no tienen esta restricción. |
| RN-05 | Un profesor solo puede ver, modificar o cancelar sus propias reservas. Coordinador y admin pueden gestionar las de cualquier usuario. | Verificar `reservation.professor_id === userId` en el servidor para operaciones del profesor. |
| RN-06 | Un salón desactivado no aparece disponible para nuevas reservas. Sus reservas históricas permanecen. | Filtrar `rooms WHERE is_active = true` en la consulta de disponibilidad. |
| RN-07 | Un usuario desactivado no puede iniciar sesión ni crear reservas. | Verificar `users.is_active = true` en `withAuth`. |
| RN-08 | Toda creación, cancelación o modificación de una reserva queda registrada con fecha, hora y usuario. | `dataService.recordAudit()` llamado automáticamente en cada operación sobre reservas. Persiste en Vercel Blob. |
| RN-09 | El código de un salón debe ser único dentro de su bloque. | UNIQUE compuesto en `rooms(block_id, code)`. |
| RN-10 | Si se desactiva un salón con reservas futuras activas, el sistema muestra advertencia con el conteo antes de proceder. La desactivación no cancela automáticamente esas reservas — queda en manos del admin. | El endpoint de desactivación retorna `{ warningCount: N }` si hay reservas futuras. El admin debe hacer una segunda petición confirmando. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes serverless |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Todos los datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde la API de bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs append-only de operaciones de reservas |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, bloques, salones, franjas horarias, reservas. | Todo el dominio requiere SQL: verificación de unicidad, joins para el calendario, queries de disponibilidad por fecha y franja. |
| **Vercel Blob** | Auditoría de operaciones sobre reservas (`audit/<YYYYMM>.json`). | RN-08 obligatorio. Append-only, no requiere SQL. No satura Postgres. |
| **`data/` en el repo** | Seed inicial: admin + 3 bloques + franjas horarias predefinidas + salones de demo. | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.** Nadie importa `supabase.ts` ni `blobAudit.ts` directamente.
2. **CERO caché en memoria** para datos transaccionales (el calendario de disponibilidad cambia con cada reserva).
3. **CERO CDN cache** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
4. **`get()` del SDK de Blob, nunca `fetch(url)`** — blobs privados fallan silenciosamente con `fetch`.
5. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.
6. **Read-modify-write sobre auditoría** serializado con `withFileLock()`.
7. **La unicidad de reserva se valida a dos niveles**: el `dataService.createReservation()` verifica primero con una query, y Postgres tiene el UNIQUE como segunda capa de defensa. Si dos requests llegan simultáneamente, el UNIQUE de Postgres garantiza que solo uno pase.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json       ← { "version": "1.0", "system_name": "ClassSport" }
  seed.json         ← {
                        "users": [{ email: "admin@classsport.edu.co", password_hash, role: "admin", name: "Administrador" }],
                        "blocks": [
                          { name: "Bloque A", code: "A" },
                          { name: "Bloque B", code: "B" },
                          { name: "Bloque C", code: "C" }
                        ],
                        "slots": [
                          { name: "07:00–09:00", start_time: "07:00", end_time: "09:00", order: 1 },
                          { name: "09:00–11:00", start_time: "09:00", end_time: "11:00", order: 2 },
                          { name: "11:00–13:00", start_time: "11:00", end_time: "13:00", order: 3 },
                          { name: "14:00–16:00", start_time: "14:00", end_time: "16:00", order: 4 },
                          { name: "16:00–18:00", start_time: "16:00", end_time: "18:00", order: 5 },
                          { name: "18:00–20:00", start_time: "18:00", end_time: "20:00", order: 6 }
                        ],
                        "rooms": [
                          { code: "A-101", block_code: "A", type: "salon", capacity: 40, equipment: "Videobeam, tablero" },
                          { code: "A-102", block_code: "A", type: "salon", capacity: 35, equipment: "Tablero" },
                          { code: "B-201", block_code: "B", type: "laboratorio", capacity: 25, equipment: "Computadores, videobeam" },
                          { code: "C-301", block_code: "C", type: "auditorio", capacity: 120, equipment: "Videobeam, sonido, aire" }
                        ]
                      }
  README.md
```

> Las **franjas horarias** (slots) son fijas y definidas en el seed. El sistema no permite crear franjas personalizadas — las 6 franjas académicas son el estándar de la institución.

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql          ← Fase 1: users + _migrations
  0002_init_spaces.sql         ← Fase 3: blocks, slots, rooms
  0003_init_reservations.sql   ← Fase 4: reservations (con UNIQUE compuesto)
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### 10.4 Página `/admin/db-setup`

Tab **Diagnóstico**: estado de Supabase, Blob, migrations aplicadas vs pendientes, conteos por tabla (usuarios, bloques, salones, franjas, reservas).
Tab **Bootstrap**: lista migrations pendientes + botón ejecutar con confirmación. El bootstrap también inserta los 3 bloques, las 6 franjas y los salones de demo del seed.

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts         ← ÚNICO punto de acceso
  supabase.ts            ← Solo lo importa dataService
  blobAudit.ts           ← Solo lo importa dataService
  pgMigrate.ts           ← Solo lo importa /api/system/bootstrap
  seedReader.ts          ← Solo lo importa dataService en modo seed
  reservationService.ts  ← checkConflict, validateReservationRules
  availabilityService.ts ← buildWeeklyCalendar, getBlockAvailability
  reportService.ts       ← generateCSV del reporte de ocupación
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts           ← Fechas y días hábiles en America/Bogota
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Bloques, salones y franjas
export async function getBlocks(): Promise<Block[]>
export async function getSlots(): Promise<Slot[]>
export async function getRooms(filters?: RoomFilters): Promise<Room[]>
export async function getRoomById(id: string): Promise<Room | null>
export async function createRoom(userId: string, data: CreateRoomRequest): Promise<Room>
export async function updateRoom(id: string, userId: string, data: UpdateRoomRequest): Promise<Room>
export async function deactivateRoom(id: string, userId: string): Promise<{ warningCount: number }>
export async function confirmDeactivateRoom(id: string, userId: string): Promise<Room>

// Disponibilidad
export async function getBlockAvailability(blockId: string, date: string): Promise<BlockAvailability>
export async function getRoomWeeklyCalendar(roomId: string, weekStart: string): Promise<WeeklyCalendar>

// Reservas
export async function getReservations(filters?: ReservationFilters): Promise<ReservationWithDetails[]>
export async function getMyReservations(userId: string, filters?: ReservationFilters): Promise<ReservationWithDetails[]>
export async function createReservation(userId: string, data: CreateReservationRequest): Promise<Reservation>
export async function cancelReservation(id: string, userId: string, role: string, reason?: string): Promise<Reservation>

// Reportes
export async function getOccupancyReport(from: string, to: string, blockId?: string): Promise<OccupancyReportRow[]>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica en servicios de dominio

**`lib/reservationService.ts`**

```typescript
// Verifica si existe una reserva activa para la combinación (room, slot, date).
// Retorna la reserva conflictiva si existe, o null si la franja está libre.
// Esta función se llama ANTES de intentar el INSERT.
export async function checkConflict(roomId: string, slotId: string, date: string): Promise<ReservationConflict | null>

// Valida las reglas de negocio sobre la fecha de la reserva:
// - RN-02: debe ser día hábil (lunes a viernes)
// - RN-03: no más de 60 días de anticipación
// Retorna un array de errores o array vacío si todo pasa.
export function validateReservationRules(date: string): string[]
```

**`lib/availabilityService.ts`**

```typescript
// Construye el calendario semanal de un salón.
// Para cada día de la semana (lunes a viernes) y cada franja,
// devuelve: libre, ocupada (con datos del profesor y materia), o pasada.
export async function buildWeeklyCalendar(roomId: string, weekStart: string): Promise<WeeklyCalendar>

// Para un bloque y fecha, devuelve el conteo de salones libres y ocupados.
export async function getBlockAvailability(blockId: string, date: string): Promise<BlockAvailability>
```

**`lib/reportService.ts`**

```typescript
// Genera el CSV del reporte de ocupación como string.
// Columnas: Fecha, Bloque, Salón, Código, Franja, Profesor, Materia, Grupo, Estado.
export function generateOccupancyCSV(rows: OccupancyReportRow[]): string
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users ──────────────────────────────< reservations (professor_id, cancelled_by)
blocks ──< rooms ──< reservations (room_id)
slots ────────────< reservations (slot_id)

UNIQUE: reservations(room_id, slot_id, reservation_date) WHERE status='confirmada'
UNIQUE: rooms(block_id, code)
```

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL
                       CHECK (role IN ('profesor', 'coordinador', 'admin')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_spaces.sql`

```sql
-- Bloques académicos (A, B, C)
CREATE TABLE IF NOT EXISTS blocks (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  code       VARCHAR(5)   UNIQUE NOT NULL,  -- A, B, C
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Franjas horarias fijas de la institución
CREATE TABLE IF NOT EXISTS slots (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(20) NOT NULL,         -- "07:00–09:00"
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  order_index INTEGER     NOT NULL,         -- para ordenar en el calendario
  is_active   BOOLEAN     DEFAULT true,
  UNIQUE (start_time, end_time)
);

-- Salones: tipo puede ser 'salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro'
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id    UUID         NOT NULL REFERENCES blocks(id),
  code        VARCHAR(20)  NOT NULL,        -- "A-101"
  type        VARCHAR(20)  NOT NULL DEFAULT 'salon'
              CHECK (type IN ('salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro')),
  capacity    INTEGER      NOT NULL CHECK (capacity > 0),
  equipment   TEXT,                         -- descripción libre: "Videobeam, tablero, AC"
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (block_id, code)                   -- RN-09: código único dentro del bloque
);

CREATE INDEX IF NOT EXISTS idx_rooms_block  ON rooms(block_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
```

### Migration `0003_init_reservations.sql`

```sql
CREATE TABLE IF NOT EXISTS reservations (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id          UUID         NOT NULL REFERENCES rooms(id),
  slot_id          UUID         NOT NULL REFERENCES slots(id),
  professor_id     UUID         NOT NULL REFERENCES users(id),
  reservation_date DATE         NOT NULL,  -- solo días hábiles
  subject          VARCHAR(150) NOT NULL,  -- materia
  group_name       VARCHAR(50)  NOT NULL,  -- grupo (ej: "2024-1 Grupo A")
  status           VARCHAR(15)  NOT NULL DEFAULT 'confirmada'
                   CHECK (status IN ('confirmada', 'cancelada')),
  cancellation_reason TEXT,                -- solo cuando status='cancelada'
  cancelled_by     UUID         REFERENCES users(id),  -- puede ser distinto del profesor
  cancelled_at     TIMESTAMPTZ,
  created_by       UUID         REFERENCES users(id),  -- siempre igual a professor_id
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- RN-01: La unicidad de reservas activas se hace con índice parcial.
-- Solo una reserva 'confirmada' por combinación (salón, franja, fecha).
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
  ON reservations(room_id, slot_id, reservation_date)
  WHERE status = 'confirmada';

CREATE INDEX IF NOT EXISTS idx_reservations_professor  ON reservations(professor_id, reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_room_date  ON reservations(room_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);
```

> **Nota sobre el índice parcial (RN-01):** El índice UNIQUE parcial `WHERE status = 'confirmada'` es la clave del diseño. Permite que existan múltiples reservas canceladas para la misma combinación (una reserva cancelada + una nueva confirmada en el mismo salón/franja/fecha), que es el comportamiento correcto. Si se usara un UNIQUE normal, una cancelación bloquearía permanentemente esa franja.

---

## 13. Auditoría en Vercel Blob

### 13.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;            // ISO 8601, zona America/Bogota
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  action: 'create_reservation' | 'cancel_reservation' | 'deactivate_room'
        | 'create_room' | 'update_room' | 'create_user' | 'toggle_user'
        | 'login' | 'logout' | 'bootstrap';
  entity: 'reservation' | 'room' | 'user' | 'system';
  entity_id?: string;
  summary: string;    // "Prof. García reservó A-101 el 15/06 (09:00–11:00) para Matemáticas I"
  metadata?: Record<string, unknown>;
};
```

### 13.2 Implementación de `lib/blobAudit.ts`

Idéntica al patrón de los demás proyectos del curso:
- `getBlobToken()` lazy — nunca constante de módulo.
- `get()` del SDK de Blob — nunca `fetch(url)` para blobs privados.
- `withFileLock()` para serializar read-modify-write al mismo archivo mensual.
- `appendAudit(entry)` y `readAuditMonth(yyyymm)` como funciones exportadas.

### 13.3 Cuándo registrar auditoría (RN-08)

| Evento | action en la auditoría |
|---|---|
| Profesor crea reserva | `create_reservation` |
| Cualquier actor cancela reserva | `cancel_reservation` |
| Admin desactiva salón | `deactivate_room` |
| Admin crea o edita salón | `create_room` / `update_room` |
| Admin crea o modifica usuario | `create_user` / `toggle_user` |
| Cualquier actor hace login | `login` |
| Bootstrap ejecutado | `bootstrap` |

---

## 14. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                        ← Redirige a /dashboard o /login
  login/page.tsx                  ← Login (no hay registro público)
  dashboard/page.tsx              ← Panel del día según rol
  blocks/
    page.tsx                      ← Vista de bloques con disponibilidad por fecha
    [blockId]/
      page.tsx                    ← Salones del bloque con disponibilidad
      [roomId]/page.tsx           ← Calendario semanal del salón
  reservations/
    page.tsx                      ← Mis reservas (profesor) | Todas las reservas (coord/admin)
    new/page.tsx                  ← Formulario de nueva reserva
  admin/
    db-setup/page.tsx             ← Bootstrap (solo admin)
    rooms/page.tsx                ← Gestión de salones (solo admin)
    rooms/new/page.tsx
    rooms/[id]/edit/page.tsx
    users/page.tsx                ← Gestión de usuarios (solo admin)
    audit/page.tsx                ← Bitácora de Blob (solo admin)
  reports/page.tsx                ← Reporte de ocupación (coord/admin)
  profile/page.tsx                ← Cambiar contraseña

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    blocks/route.ts               ← GET lista de bloques
    blocks/[id]/availability/route.ts  ← GET disponibilidad del bloque para una fecha
    slots/route.ts                ← GET lista de franjas horarias
    rooms/
      route.ts                    ← GET | POST
      [id]/route.ts               ← GET | PUT
      [id]/deactivate/route.ts    ← POST (con warning) | POST ?confirm=true
      [id]/calendar/route.ts      ← GET calendario semanal
    reservations/
      route.ts                    ← GET todas (coord/admin) | POST crear
      my/route.ts                 ← GET mis reservas (profesor)
      [id]/route.ts               ← GET detalle
      [id]/cancel/route.ts        ← POST cancelar
    reports/occupancy/route.ts    ← GET datos | GET ?format=csv descarga
    users/route.ts | [id]/route.ts
    audit/route.ts
    dashboard/route.ts

components/
  ui/
  layout/                         ← AppLayout, Sidebar, SeedModeBanner
  calendar/                       ← WeeklyCalendar, SlotCell, WeekNavigator
  blocks/                         ← BlockCard, RoomCard, AvailabilityBadge
  reservations/                   ← ReservationCard, NewReservationForm, CancelModal
  admin/                          ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  reservationService.ts | availabilityService.ts | reportService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El calendario semanal de un salón debe cargar en menos de 2 segundos. |
| RNF-02 | La verificación de conflicto y creación de reserva debe completarse en menos de 1 segundo. |
| RNF-03 | Si dos profesores intentan reservar la misma franja simultáneamente, exactamente uno debe tener éxito — el otro debe recibir el error de conflicto. |
| RNF-04 | La interfaz debe ser completamente funcional en celulares y tabletas (profesores acceden desde dispositivos móviles en pasillos). |
| RNF-05 | Las contraseñas deben hashearse con bcrypt antes de guardarse. |
| RNF-06 | Las sesiones deben gestionarse con JWT en cookie HttpOnly, nunca localStorage. |
| RNF-07 | Toda operación sobre reservas debe registrarse en auditoría (RN-08). |
| RNF-08 | Las fechas y horas deben manejarse en zona horaria `America/Bogota` en toda la cadena (servidor y cliente). |

---

## 16. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

Igual que todos los proyectos del curso: login con admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live activo. El bootstrap inserta los 3 bloques, las 6 franjas y los 4 salones de demo.

### Flujo de reserva (profesor)

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Dashboard | El profesor ve sus reservas del día y el acceso rápido a "Nueva Reserva". |
| 2 | Bloques | Selecciona la fecha. El sistema muestra los 3 bloques con el conteo de salones disponibles para ese día. |
| 3 | Bloque | Selecciona el Bloque A. Ve los salones con su disponibilidad del día. |
| 4 | Salón | Selecciona A-101. Ve el calendario semanal con franjas verdes (libres) y rojas (ocupadas con datos). |
| 5 | Franja | Hace clic en la franja 09:00–11:00 del miércoles. |
| 6 | Formulario | Ingresa la materia ("Cálculo I") y el grupo ("2024-1 A"). Revisa el resumen. |
| 7 | Confirmación | Presiona "Confirmar reserva". El sistema verifica conflicto y registra. |
| 8 | Resultado | La franja aparece en rojo en el calendario. El profesor ve la reserva en "Mis reservas". |

### Flujo de conflicto simultáneo (RNF-03)

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Profesor A | Selecciona A-101, franja 09:00–11:00, miércoles. Ve la franja libre. |
| 2 | Profesor B | Selecciona la misma combinación al mismo tiempo. También ve la franja libre. |
| 3 | Servidor (A) | Recibe el POST de A. `checkConflict` encuentra la franja libre. Ejecuta INSERT. |
| 4 | Postgres | El UNIQUE parcial acepta el INSERT de A. Reserva confirmada para A. |
| 5 | Servidor (B) | Recibe el POST de B milisegundos después. `checkConflict` ya encuentra la reserva de A. |
| 6 | Servidor (B) | Retorna 409 con el detalle: "El salón A-101 ya está reservado en esa franja por Prof. García – Cálculo I". |
| 7 | Frontend (B) | Muestra el mensaje de conflicto y refresca el calendario mostrando la franja de A en rojo. |

---

## 17. Diseño de interfaz

### Identidad visual del Login

ClassSport es una herramienta institucional universitaria. El login transmite formalidad académica, orden y confianza institucional.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado vertical y horizontalmente. |
| **Fondo** | Azul institucional muy oscuro (`#0F172A`) con un patrón geométrico sutil (cuadrícula o puntos) en azul ligeramente más claro. Sugiere estructura y orden. |
| **Tarjeta del formulario** | Fondo blanco `#FFFFFF`, `border-radius: 12px`, sombra azul suave (`0 8px 40px rgba(15, 23, 42, 0.25)`), borde superior de 4px en azul institucional (`#1D4ED8`), padding generoso, max-w-sm. |
| **Logo** | SVG inline de un edificio académico estilizado (líneas geométricas simples, vista de frente) en azul institucional (`#1D4ED8`), 52×52px, centrado. |
| **Nombre** | "ClassSport" en Inter Bold 28px, azul oscuro (`#0F172A`). |
| **Tagline** | "Gestión de salones universitarios." Inter Regular 13px, slate medio (`#64748B`). |
| **Campos** | Borde gris frío (`#CBD5E1`), focus en azul institucional (`#1D4ED8`). |
| **Botón principal** | "Ingresar" — azul institucional `#1D4ED8`, texto blanco, `border-radius: 8px`, hover `#1E40AF`. |
| **Pie** | Texto pequeño en gris: "Institución Universitaria". Sin link de "Crear cuenta" — los usuarios los crea el admin. |
| **Animación** | Framer Motion: tarjeta con `opacity: 0→1` y `y: 12→0`, duración 0.4s, ease `easeOut`. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Fondo principal | `#F8FAFC` (slate 50) |
| Fondo de tarjetas | `#FFFFFF` |
| Fondo alterno | `#F1F5F9` (slate 100) |
| Primario (azul institucional) | `#1D4ED8` |
| Primario oscuro | `#1E40AF` |
| Primario claro | `#3B82F6` |
| Texto principal | `#0F172A` (slate 900) |
| Texto secundario | `#64748B` (slate 500) |
| **Franja libre** | `#16A34A` + fondo `#F0FDF4` |
| **Franja ocupada** | `#DC2626` + fondo `#FEF2F2` |
| **Franja pasada** | `#94A3B8` + fondo `#F8FAFC` (readonly) |
| Reserva confirmada | `#16A34A` |
| Reserva cancelada | `#DC2626` |
| Error | `#EF4444` |
| Advertencia | `#D97706` |
| Bordes | `#E2E8F0` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Tipografía

Inter para todo el sistema. Títulos: 24px Bold. Secciones: 18px SemiBold. Cuerpo: 14px Regular. Datos de franja: 12px SemiBold.

### Componentes clave

| Componente | Descripción |
|---|---|
| `BlockCard` | Tarjeta de bloque con letra grande (A, B, C), nombre y conteo de salones disponibles / total para la fecha seleccionada. Borde de color según disponibilidad: verde (hay libres), naranja (pocos libres), rojo (todo ocupado). |
| `RoomCard` | Tarjeta de salón con código en negrita, tipo, capacidad, equipamiento y badge de estado. |
| `WeeklyCalendar` | Grilla de lunes a viernes (columnas) × franjas horarias (filas). Cada celda es un `SlotCell`. Incluye navegación de semana (← semana anterior / semana siguiente →). |
| `SlotCell` | Celda del calendario. Verde = libre (clicable para reservar). Rojo = ocupada (muestra nombre del profesor y materia en tooltip). Gris = pasada o fin de semana (no interactiva). |
| `ReservationCard` | Card en "Mis reservas": salón, bloque, fecha, franja, materia, grupo, estado (badge verde/rojo). Botón cancelar visible solo si la fecha es futura. |
| `CancelModal` | Modal de confirmación de cancelación. Para coordinador/admin: textarea de motivo obligatorio. Para profesor: confirmación simple. |
| `SeedModeBanner` | Banner amarillo cuando el sistema está en modo seed. Solo admin. |
| `AuditViewer` | Tabla con selector de mes y campo summary legible. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo. WeeklyCalendar con 5 columnas y 6 filas visible completo. |
| Tablet (768–1023px) | Sidebar colapsable. WeeklyCalendar con scroll horizontal si es necesario. |
| Celular (<768px) | Bottom navigation. WeeklyCalendar mostrado como lista de días acordeonada (un día a la vez) para facilitar la selección táctil. |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad
> Reemplaza el "Hola Mundo". Establece la arquitectura completa.

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado en Vercel. Configurar variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin inicial (password `admin123` hasheado con bcrypt 10 rounds), los 3 bloques, las 6 franjas horarias y los 4 salones de demo. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. En modo seed solo permite login admin. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. `withAuth` agrega `Cache-Control: no-store`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | Crear `lib/types.ts` y `lib/schemas.ts` con tipos y schemas de auth. |
| 1.10 | Crear API Routes: `POST /api/system/bootstrap`, `GET /api/system/diagnose`, `GET /api/system/mode`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`. |
| 1.11 | Crear `app/login/page.tsx` con identidad visual de ClassSport: fondo azul oscuro, tarjeta blanca, logo de edificio académico, sin link de registro. |
| 1.12 | Actualizar `app/page.tsx`: redirige a `/dashboard` o `/login` según sesión. |
| 1.13 | `npm run typecheck` sin errores. Probar: login admin del seed → `/api/system/mode` retorna `seed` → cookie HttpOnly verificada. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar (desktop), bottom nav (mobile). El sidebar muestra Bloques, Mis Reservas y Perfil para el profesor. Coordinador ve además Todas las Reservas y Reportes. Admin ve todo incluyendo Administración. |
| 2.4 | Crear `/admin/db-setup/page.tsx`: diagnóstico (Supabase, Blob, migrations, conteos) + bootstrap. |
| 2.5 | Crear `SeedModeBanner.tsx`: banner amarillo hasta completar el bootstrap. Solo admin. |
| 2.6 | Crear `GET /api/dashboard`: según rol. Profesor: sus reservas del día y de los próximos 7 días. Coordinador: conteo de reservas activas del día por bloque. Admin: lo mismo que coordinador. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx` con panel según rol y banner de modo seed. |
| 2.8 | Crear `middleware.ts`: protege rutas privadas, verifica rol para `/admin/*` y `/reports`. |
| 2.9 | Probar: login admin → banner → `/admin/db-setup` → bootstrap (3 bloques, 6 franjas, 4 salones de demo) → verificar modo live. |

---

### Fase 3 — Bloques, Salones y Disponibilidad
> Rol: Ingeniero Fullstack Senior — Consulta de disponibilidad en tiempo real

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_spaces.sql`. Aplicar desde `/admin/db-setup`. |
| 3.2 | El bootstrap ya insertó los 3 bloques, las 6 franjas y los 4 salones de demo. Verificar que están en Supabase. |
| 3.3 | Crear `lib/availabilityService.ts`: `buildWeeklyCalendar` y `getBlockAvailability`. |
| 3.4 | Agregar tipos `Block`, `Slot`, `Room`, `RoomWithBlock`, `BlockAvailability`, `WeeklyCalendar`, `SlotCell` y schemas Zod. |
| 3.5 | Extender `dataService`: `getBlocks`, `getSlots`, `getRooms`, `getRoomById`, `createRoom`, `updateRoom`, `deactivateRoom` (con warning de reservas futuras — RN-10), `confirmDeactivateRoom`, `getBlockAvailability`, `getRoomWeeklyCalendar`. |
| 3.6 | API Routes: `GET /api/blocks`, `GET /api/blocks/[id]/availability?date=`, `GET /api/slots`, `GET/POST /api/rooms`, `GET/PUT /api/rooms/[id]`, `POST /api/rooms/[id]/deactivate`, `GET /api/rooms/[id]/calendar?weekStart=`. |
| 3.7 | Crear `app/blocks/page.tsx`: grilla de 3 `BlockCard` con selector de fecha. Al seleccionar una fecha, muestra el conteo de salones disponibles por bloque. |
| 3.8 | Crear `app/blocks/[blockId]/page.tsx`: lista de `RoomCard` con su disponibilidad del día (libre/ocupada). |
| 3.9 | Crear `app/blocks/[blockId]/[roomId]/page.tsx`: `WeeklyCalendar` del salón con `WeekNavigator`. Las celdas libres son verdes y clicables (navegan a crear reserva pre-llenada). Las ocupadas son rojas con tooltip del profesor y materia. Las pasadas son grises. |
| 3.10 | Crear `components/calendar/WeeklyCalendar.tsx`, `SlotCell.tsx`, `WeekNavigator.tsx`. |
| 3.11 | Crear `app/admin/rooms/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx` (solo admin). |

---

### Fase 4 — Reservas
> Rol: Ingeniero Fullstack Senior — Flujo central del sistema y prevención de conflictos

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_reservations.sql` con el índice UNIQUE parcial. Aplicar desde `/admin/db-setup`. |
| 4.2 | Crear `lib/reservationService.ts`: `checkConflict` y `validateReservationRules` (RN-02, RN-03). |
| 4.3 | Agregar tipos `Reservation`, `ReservationWithDetails`, `CreateReservationRequest`, `CancelReservationRequest` y schemas Zod. |
| 4.4 | Extender `dataService`: `createReservation` (valida reglas, verifica conflicto, inserta, registra auditoría), `cancelReservation` (valida RN-04 para profesores, cancela con motivo, registra auditoría), `getReservations`, `getMyReservations`. |
| 4.5 | `createReservation` sigue esta secuencia: (1) `validateReservationRules(date)` — RN-02 y RN-03; (2) `checkConflict(roomId, slotId, date)` — si hay conflicto, retornar 409 con datos del conflicto; (3) INSERT en `reservations`; (4) si Postgres rechaza el INSERT por UNIQUE (race condition), capturar el error y retornar 409; (5) `recordAudit`. |
| 4.6 | API Routes: `GET/POST /api/reservations` (coord/admin), `GET /api/reservations/my` (profesor), `GET /api/reservations/[id]`, `POST /api/reservations/[id]/cancel`. |
| 4.7 | Crear `app/reservations/new/page.tsx`: formulario pre-llenado si viene con query params (`?roomId=&slotId=&date=` desde el calendario). Muestra sala, franja y fecha seleccionadas. Inputs para materia y grupo. Resumen antes de confirmar. |
| 4.8 | Crear `app/reservations/page.tsx` para el profesor: listado de sus reservas con filtros. Para el coordinador/admin: todas las reservas con filtros por bloque, fecha y estado. |
| 4.9 | `CancelModal.tsx`: para el profesor, confirmación simple. Para coordinador/admin, textarea de motivo obligatorio. |
| 4.10 | Integrar el calendario del salón con el flujo de reserva: al tocar una franja libre, navega a `/reservations/new?roomId=&slotId=&date=`. |

---

### Fase 5 — Reportes y Administración de Usuarios
> Rol: Ingeniero Fullstack Senior

| # | Tarea |
|---|---|
| 5.1 | Crear `lib/reportService.ts`: `generateOccupancyCSV(rows)` que genera el CSV con las columnas documentadas. |
| 5.2 | Extender `dataService`: `getOccupancyReport(from, to, blockId?)` — query con JOIN entre reservations, rooms, blocks, slots y users, filtrando por rango de fechas y bloque opcional. Solo reservas con `status = 'confirmada'`. |
| 5.3 | API Routes: `GET /api/reports/occupancy?from=&to=&blockId=&format=json|csv` (coord/admin). Si `format=csv`, genera y descarga el archivo con headers de descarga. Sin datos en el período → 404. |
| 5.4 | Crear `app/reports/page.tsx`: selector de rango de fechas + selector de bloque (opcional, "Todos"). Muestra la tabla preview en JSON. Botón "Descargar CSV" llama al endpoint con `format=csv`. |
| 5.5 | API Routes de usuarios con `withRole(['admin'])`: `GET/POST /api/users`, `GET/PUT /api/users/[id]`. |
| 5.6 | El POST genera contraseña temporal con `crypto.randomBytes`, la hashea, marca `must_change_password=true`, retorna EN CLARO una sola vez. Modal con "Copiar" y advertencia. |
| 5.7 | En el login: si `must_change_password=true`, redirigir a `/profile` para cambio obligatorio. |
| 5.8 | Crear `app/admin/users/page.tsx`: tabla con nombre, email, rol, estado, último acceso. Acciones: editar, activar/suspender. |
| 5.9 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con selector de mes. Lee de `dataService.readAuditMonth()`. |

---

### Fase 6 — Pulido final y Deploy
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 6.1 | Auditoría de empty states: sin salones registrados, sin reservas para la fecha, sin datos en el reporte del período, calendario de salón sin reservas (todas las franjas en verde). Mensajes claros con CTA según el rol. |
| 6.2 | Manejo de errores global: 401 (sesión expirada), 403 (sin permisos), 409 (conflicto de reserva — mostrar el detalle del conflicto, no solo "Error 409"), 500. Toasts apropiados. |
| 6.3 | El mensaje de conflicto (RF-06) es el más importante del sistema. Verificar que el 409 de `createReservation` incluye: nombre del salón, franja, fecha, nombre del profesor que tiene la reserva y materia. Verificar que el frontend lo muestra completo. |
| 6.4 | Calendario semanal en celular: verificar que el acordeón de días funciona, que los botones de franja tienen al menos 44px de alto y que la información de franja ocupada es legible sin zoom. |
| 6.5 | Verificar el flujo de race condition manualmente: abrir dos pestañas del navegador, seleccionar el mismo salón/franja/fecha en ambas, confirmar en las dos rápidamente. Solo una debe quedar confirmada. |
| 6.6 | Verificar las reglas de negocio en producción: intentar reservar un sábado (debe fallar), con más de 60 días de anticipación (debe fallar), cancelar una reserva pasada como profesor (botón deshabilitado). |
| 6.7 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 6.8 | Verificar que ningún componente cliente importa variables privadas ni módulos de `lib/` directamente. |
| 6.9 | Deploy en Vercel con todas las variables de entorno configuradas. |
| 6.10 | Probar en producción con los 3 roles: admin hace bootstrap → crea usuarios → profesor reserva → coordinador ve la reserva → profesor cancela → admin descarga reporte. |

---

## 19. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod (loginSchema)
2. dataService.getUserByEmail(email)  ← seed o Postgres
3. Verificar is_active (RN-07) y password con bcrypt.compare()
4. Si must_change_password: incluir flag en JWT
5. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
6. dataService.recordAudit({ action: 'login', ... })
7. Retornar SafeUser
```

### Prevención de conflictos — doble validación

```
1. reservationService.checkConflict(roomId, slotId, date)
   → Query: SELECT * FROM reservations WHERE room_id=? AND slot_id=? AND
     reservation_date=? AND status='confirmada'
   → Si hay resultado: retornar 409 con datos del conflicto. STOP.

2. INSERT INTO reservations (...)
   → Si Postgres rechaza por UNIQUE parcial (race condition de milisegundos):
     capturar el error de unicidad, retornar 409 con mensaje genérico de conflicto.
   → Si INSERT exitoso: continuar.

3. recordAudit({ action: 'create_reservation', ... })
```

### Permisos por endpoint

```typescript
// Todos los roles pueden ver:
// GET /api/blocks, /api/slots, /api/rooms, /api/rooms/[id]/calendar

// Solo profesores pueden crear reservas:
// POST /api/reservations  →  withRole(['profesor', 'admin'])

// Solo coordinador y admin pueden ver todas las reservas:
// GET /api/reservations   →  withRole(['coordinador', 'admin'])

// Solo admin puede gestionar salones y usuarios:
// POST/PUT /api/rooms, /api/users  →  withRole(['admin'])

// Reportes para coordinador y admin:
// GET /api/reports/occupancy  →  withRole(['coordinador', 'admin'])
```

---

## 20. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | Los usuarios no pueden registrarse solos. El admin crea las cuentas. |
| RS-02 | Franjas fijas | Las 6 franjas horarias son estándar de la institución y no son editables por el usuario. |
| RS-03 | Tres bloques fijos | Los bloques A, B y C se crean en el seed. El admin puede agregar más desde el sistema si necesita. |
| RS-04 | Solo días hábiles (lunes–viernes) | No hay soporte para reservas en sábado, domingo o festivos. En v1 no hay calendario de festivos. |
| RS-05 | No hay notificaciones | No hay emails ni push notifications en v1. La comunicación es mediante el sistema. |
| RS-06 | Sin reservas recurrentes | Cada reserva es individual. Para una clase que se repite semanalmente, el profesor debe crear una reserva por día. |
| RS-07 | Bootstrap obligatorio | Hasta no aplicar migrations + seed, el sistema solo permite login admin. |
| RS-08 | Auditoría no editable | Append-only en Blob. |
| RS-09 | Export solo en CSV | El reporte de ocupación se exporta en CSV. Sin PDF en v1. |

---

## 21. Glosario

| Término | Definición |
|---|---|
| **Bloque** | Edificio o ala de la universidad que agrupa un conjunto de salones (A, B, C). |
| **Salón** | Espacio físico dentro de un bloque disponible para reservar. |
| **Franja horaria (Slot)** | Período de tiempo fijo para el cual se puede hacer una reserva (ej: 07:00–09:00). |
| **Reserva** | Asignación confirmada de un salón a un profesor para una franja y fecha específicas. |
| **Conflicto** | Situación en que dos reservas intentan usar el mismo salón, franja y fecha. |
| **Cancelación** | Cambio del estado de una reserva a 'cancelada', liberando la franja. |
| **Disponibilidad** | Estado de una franja horaria en un salón para una fecha dada: libre u ocupada. |
| **Calendario semanal** | Vista del sistema que muestra el estado de todas las franjas de un salón para los 5 días hábiles de una semana. |
| **Reporte de ocupación** | Listado de reservas de un período exportable en CSV. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **Modo seed** | Estado antes del bootstrap. Solo permite login admin. |
| **Modo live** | Estado normal. Persiste en Supabase. |
| **dataService** | Único punto de acceso a datos. Encapsula Supabase, Blob y el seed reader. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Juan Gutiérrez — Doc: 1044218091
> Curso: Lógica y Programación — SIST0200
