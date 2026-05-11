# Schema SQL — TypeScript Types Mapping

## Resumen de Tablas

Tu proyecto tiene 6 tablas principales, directamente mapeadas desde los tipos en [lib/types.ts](lib/types.ts):

---

## 1. `users` — User

**Tipo TypeScript:**
```typescript
export type User = {
  id: string;              // UUID
  name: string;            // VARCHAR(100)
  email: string;           // VARCHAR(255) UNIQUE
  password_hash: string;   // TEXT
  role: 'profesor' | 'coordinador' | 'admin';  // VARCHAR(15)
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;  // TIMESTAMPTZ
  created_at: string;     // TIMESTAMPTZ
};
```

**Tabla SQL:**
```sql
CREATE TABLE users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  CHECK (role IN ('profesor', 'coordinador', 'admin')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);
```

**Indices:**
- `idx_users_email` — búsqueda por email (login)
- `idx_users_role` — filtrado por rol

**Migración:** [0001_init_users.sql](supabase/migrations/0001_init_users.sql)

---

## 2. `blocks` — Block

**Tipo TypeScript:**
```typescript
export type Block = {
  id: string;           // UUID
  name: string;         // VARCHAR(50)
  code: string;         // VARCHAR(5) UNIQUE
  is_active: boolean;
  created_at: string;   // TIMESTAMPTZ
};
```

**Tabla SQL:**
```sql
CREATE TABLE blocks (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  code       VARCHAR(5)   UNIQUE NOT NULL,   -- "A", "B", "C"
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
```

**Indices:**
- `idx_blocks_code` — búsqueda por código

**Migración:** [0002_init_spaces.sql](supabase/migrations/0002_init_spaces.sql)

---

## 3. `slots` — Slot

**Tipo TypeScript:**
```typescript
export type Slot = {
  id: string;           // UUID
  name: string;         // VARCHAR(20) "07:00–09:00"
  start_time: string;   // TIME
  end_time: string;     // TIME
  order_index: number;  // INTEGER
  is_active: boolean;
};
```

**Tabla SQL:**
```sql
CREATE TABLE slots (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(20) NOT NULL,
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  order_index INTEGER     NOT NULL,
  is_active   BOOLEAN     DEFAULT true,
  UNIQUE (start_time, end_time)
);
```

**Indices:**
- `idx_slots_order` — ordenamiento por franja horaria

**Migración:** [0002_init_spaces.sql](supabase/migrations/0002_init_spaces.sql)

---

## 4. `rooms` — Room

**Tipo TypeScript:**
```typescript
export type Room = {
  id: string;           // UUID
  block_id: string;     // UUID FK
  code: string;         // VARCHAR(20) "A-101"
  type: 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';
  capacity: number;     // INTEGER
  equipment: string | null;  // TEXT
  is_active: boolean;
  created_at: string;   // TIMESTAMPTZ
  updated_at: string;   // TIMESTAMPTZ
};
```

**Tabla SQL:**
```sql
CREATE TABLE rooms (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id    UUID         NOT NULL REFERENCES blocks(id),
  code        VARCHAR(20)  NOT NULL,
  type        VARCHAR(20)  NOT NULL DEFAULT 'salon'
              CHECK (type IN ('salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro')),
  capacity    INTEGER      NOT NULL CHECK (capacity > 0),
  equipment   TEXT,
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (block_id, code)  -- Código único dentro del bloque
);
```

**Indices:**
- `idx_rooms_block` — salones por bloque
- `idx_rooms_active` — búsqueda rápida de salones activos

**Migración:** [0002_init_spaces.sql](supabase/migrations/0002_init_spaces.sql)

---

## 5. `reservations` — Reservation

**Tipo TypeScript:**
```typescript
export type Reservation = {
  id: string;                     // UUID
  room_id: string;                // UUID FK
  slot_id: string;                // UUID FK
  professor_id: string;           // UUID FK
  reservation_date: string;       // DATE (solo weekdays)
  subject: string;                // VARCHAR(150)
  group_name: string;             // VARCHAR(50)
  status: 'confirmada' | 'cancelada';
  cancellation_reason: string | null;  // TEXT
  cancelled_by: string | null;    // UUID FK (may differ from professor)
  cancelled_at: string | null;    // TIMESTAMPTZ
  created_by: string;             // UUID FK (always equals professor_id)
  created_at: string;             // TIMESTAMPTZ
};
```

**Tabla SQL:**
```sql
CREATE TABLE reservations (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id          UUID         NOT NULL REFERENCES rooms(id),
  slot_id          UUID         NOT NULL REFERENCES slots(id),
  professor_id     UUID         NOT NULL REFERENCES users(id),
  reservation_date DATE         NOT NULL,
  subject          VARCHAR(150) NOT NULL,
  group_name       VARCHAR(50)  NOT NULL,
  status           VARCHAR(15)  NOT NULL DEFAULT 'confirmada'
                   CHECK (status IN ('confirmada', 'cancelada')),
  cancellation_reason TEXT,
  cancelled_by     UUID         REFERENCES users(id),
  cancelled_at     TIMESTAMPTZ,
  created_by       UUID         REFERENCES users(id),
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);
```

**Indices:**
- `idx_unique_active_reservation` — PARTIAL INDEX: solo una reserva confirmada por (room, slot, date)
- `idx_reservations_professor` — búsqueda de reservas por profesor
- `idx_reservations_room_date` — búsqueda por sala y fecha
- `idx_reservations_date` — búsqueda por fecha
- `idx_reservations_status` — filtrado por estado

**Regla Negocio (RN-01):**
```sql
CREATE UNIQUE INDEX idx_unique_active_reservation
  ON reservations(room_id, slot_id, reservation_date)
  WHERE status = 'confirmada';
```
→ Permite múltiples reservas `cancelada` para la misma combinación, pero solo **UNA** `confirmada`.

**Migración:** [0003_init_reservations.sql](supabase/migrations/0003_init_reservations.sql)

---

## 6. `audit_entries` — AuditEntry

**Tipo TypeScript:**
```typescript
export type AuditEntry = {
  id: string;                          // UUID
  timestamp: string;                   // TIMESTAMPTZ
  user_id: string;                     // UUID FK
  user_email: string;                  // VARCHAR(255)
  user_role: 'profesor' | 'coordinador' | 'admin';
  action: 'create_reservation' | 'cancel_reservation' | ...;
  entity: 'reservation' | 'room' | 'user' | 'system';
  entity_id?: string;                  // UUID | null
  summary: string;                     // TEXT
  metadata?: Record<string, unknown>;  // JSONB | null
};
```

**Tabla SQL:**
```sql
CREATE TABLE audit_entries (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp        TIMESTAMPTZ  DEFAULT NOW(),
  user_id          UUID         NOT NULL REFERENCES users(id),
  user_email       VARCHAR(255) NOT NULL,
  user_role        VARCHAR(15)  NOT NULL CHECK (user_role IN ('profesor', 'coordinador', 'admin')),
  action           VARCHAR(30)  NOT NULL CHECK (action IN (
                     'create_reservation', 'cancel_reservation',
                     'deactivate_room', 'create_room', 'update_room',
                     'create_user', 'toggle_user',
                     'login', 'logout', 'bootstrap'
                   )),
  entity           VARCHAR(20)  NOT NULL CHECK (entity IN ('reservation', 'room', 'user', 'system')),
  entity_id        UUID,
  summary          TEXT         NOT NULL,
  metadata         JSONB,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);
```

**Indices:**
- `idx_audit_entries_timestamp` — búsqueda por tiempo (DESC)
- `idx_audit_entries_user_id` — auditoría por usuario
- `idx_audit_entries_action` — búsqueda por tipo de acción
- `idx_audit_entries_entity` — búsqueda por entidad

**Migración:** [0004_init_audit.sql](supabase/migrations/0004_init_audit.sql)

---

## Convención de Nombres

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Tabla | `snake_case` | `audit_entries`, `user_roles` |
| Columna | `snake_case` | `created_at`, `password_hash` |
| Index | `idx_{table}_{field}` | `idx_users_email` |
| FK | Mismo nombre que la columna | `user_id` → referencia `users.id` |
| Check constraint | Implícito en CHECK | `role IN (...)` |

**TypeScript → SQL:**
- `camelCase` → `snake_case` (ej: `createdAt` → `created_at`)
- `string` → `VARCHAR(n)` o `TEXT` o `UUID`
- `number` → `INTEGER` o `BIGINT`
- `boolean` → `BOOLEAN`
- `Date | null` → `TIMESTAMPTZ` o `DATE`
- `Record<string, unknown>` → `JSONB`

---

## Setup

Para crear todas las tablas con RLS y políticas:

```bash
npm run dev
# Visita http://localhost:3000/setup-database
# Click: Test Connection
# Click: Create Tables
```

Véase [app/setup-database/page.tsx](app/setup-database/page.tsx) para la UI.
