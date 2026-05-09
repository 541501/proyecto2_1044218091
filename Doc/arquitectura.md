# 🏛️ ClassSport — Arquitectura del Sistema

> Documento técnico de arquitectura para la plataforma de gestión de salones universitarios.

---

## 1. Stack Tecnológico Recomendado

### Frontend
| Tecnología | Versión | Justificación |
|---|---|---|
| **Next.js** | 14+ (App Router) | SSR/SSG nativo, excelente para dashboards con datos en tiempo real, ideal para Vercel |
| **TypeScript** | 5+ | Tipado estático reduce errores en lógica de reservas y conflictos de horarios |
| **Tailwind CSS** | 3+ | Desarrollo rápido de UI, consistencia visual, sin overhead de CSS personalizado |
| **shadcn/ui** | Latest | Componentes accesibles y personalizables (calendarios, modales, tablas) |
| **React Query (TanStack)** | 5+ | Gestión de estado servidor, caché automático, revalidación de reservas |
| **date-fns** | 3+ | Manipulación de fechas/franjas horarias sin dependencias pesadas |

### Backend
| Tecnología | Versión | Justificación |
|---|---|---|
| **Next.js API Routes** | 14+ | Backend dentro del mismo proyecto, deploy unificado en Vercel, reduce latencia |
| **Prisma ORM** | 5+ | Type-safe queries, migraciones automáticas, compatible con múltiples DBs |
| **PostgreSQL** | 15+ | Relacional: ideal para constraints de unicidad (salón + hora + fecha), transacciones ACID |
| **NextAuth.js** | 5+ | Autenticación lista (OAuth, credentials), sesiones JWT/DB |

### Infraestructura (Vercel-native)
| Tecnología | Justificación |
|---|---|
| **Vercel** | Deploy automático desde GitHub, Edge Network, preview environments por PR |
| **Vercel Postgres** | PostgreSQL gestionado integrado con Vercel, zero config |
| **Vercel KV (Redis)** | Caché de horarios consultados frecuentemente, rate limiting |

---

## 2. Diagrama de Arquitectura

```mermaid
graph TB
    subgraph Cliente["🌐 Cliente (Browser)"]
        UI[Next.js App Router\nReact + TypeScript]
        RQ[React Query Cache]
    end

    subgraph Vercel["☁️ Vercel Platform"]
        subgraph App["Next.js Application"]
            Pages[Pages / Layouts\nApp Router]
            API[API Routes\n/api/*]
            MW[Middleware\nAuth Guard]
        end
        KV[(Vercel KV\nRedis Cache)]
    end

    subgraph DB["🗄️ Base de Datos"]
        PG[(Vercel Postgres\nPostgreSQL)]
    end

    subgraph Auth["🔐 Autenticación"]
        NA[NextAuth.js]
        Session[JWT Session]
    end

    Usuario -->|HTTPS| UI
    UI <-->|API calls + mutations| RQ
    RQ <-->|fetch| API
    API <-->|Prisma ORM| PG
    API <-->|Cache lookup| KV
    MW -->|Verificar token| NA
    NA <-->|Guardar sesión| Session
    Pages -->|Protected routes| MW

    style Cliente fill:#1e293b,color:#e2e8f0
    style Vercel fill:#0f172a,color:#e2e8f0
    style DB fill:#1e3a5f,color:#e2e8f0
    style Auth fill:#1e1b4b,color:#e2e8f0
```

### Flujo de Datos por Capa

```mermaid
sequenceDiagram
    participant P as Profesor
    participant UI as Next.js UI
    participant MW as Middleware
    participant API as API Route
    participant DB as PostgreSQL
    participant KV as Redis Cache

    P->>UI: Selecciona Bloque A → Salón 101 → 10:00AM
    UI->>MW: GET /api/salones/101/horario?fecha=2025-04-23
    MW->>MW: Valida JWT token
    MW->>API: Request autorizado
    API->>KV: ¿Existe caché para salón:101:2025-04-23?
    KV-->>API: MISS (no existe)
    API->>DB: SELECT reservas WHERE salon_id=101 AND fecha=...
    DB-->>API: Lista de reservas
    API->>KV: SET caché (TTL: 60s)
    API-->>UI: Horario con slots disponibles/ocupados
    UI-->>P: Renderiza calendario semanal

    P->>UI: Confirma reserva 10:00-11:00
    UI->>API: POST /api/reservas
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT ... FOR UPDATE (lock optimista)
    DB-->>API: Slot libre confirmado
    API->>DB: INSERT reserva
    API->>DB: COMMIT
    API->>KV: INVALIDATE caché salón:101
    API-->>UI: 201 Created
    UI-->>P: ✅ Reserva confirmada
```

---

## 3. Modelo de Datos

### Entidades Principales

```mermaid
erDiagram
    USUARIO {
        uuid id PK
        string nombre
        string email UK
        string password_hash
        enum rol "profesor | admin | coordinador"
        string departamento
        boolean activo
        timestamp created_at
    }

    BLOQUE {
        uuid id PK
        string nombre "A | B | C"
        string descripcion
        int capacidad_total
        boolean activo
    }

    SALON {
        uuid id PK
        uuid bloque_id FK
        string codigo "A-101, B-203..."
        string nombre
        int capacidad
        enum tipo "aula | laboratorio | auditorio | sala_sistemas"
        json equipamiento "['proyector','AC','tablero']"
        boolean activo
    }

    HORARIO_FRANJA {
        uuid id PK
        time hora_inicio
        time hora_fin
        string etiqueta "08:00-09:00"
    }

    RESERVA {
        uuid id PK
        uuid salon_id FK
        uuid usuario_id FK
        uuid franja_id FK
        date fecha
        string materia
        string grupo
        string observaciones
        enum estado "pendiente | confirmada | cancelada"
        timestamp created_at
        timestamp updated_at
    }

    CONFIGURACION {
        uuid id PK
        string clave
        string valor
        string descripcion
    }

    BLOQUE ||--o{ SALON : "contiene"
    SALON ||--o{ RESERVA : "tiene"
    USUARIO ||--o{ RESERVA : "realiza"
    HORARIO_FRANJA ||--o{ RESERVA : "define"
```

### Constraints Críticos en DB

```sql
-- Evita reservas duplicadas: mismo salón, misma franja, misma fecha
ALTER TABLE reservas ADD CONSTRAINT unique_reserva
  UNIQUE (salon_id, franja_id, fecha);

-- Solo reservas en días hábiles (lunes-viernes)
ALTER TABLE reservas ADD CONSTRAINT dia_habil
  CHECK (EXTRACT(DOW FROM fecha) BETWEEN 1 AND 5);

-- Índices de rendimiento
CREATE INDEX idx_reservas_salon_fecha ON reservas(salon_id, fecha);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
```

---

## 4. Flujos Principales del Sistema

### Flujo 1: Reserva de Salón

```mermaid
flowchart TD
    A([Profesor inicia sesión]) --> B[Selecciona fecha]
    B --> C[Elige Bloque: A/B/C]
    C --> D[Ve salones del bloque con disponibilidad]
    D --> E{¿Salón disponible?}
    E -->|No| F[Muestra todos ocupados\nSugiere alternativas]
    E -->|Sí| G[Selecciona salón]
    G --> H[Ve franjas horarias del día]
    H --> I{¿Franja libre?}
    I -->|No| J[Franja bloqueada en UI]
    I -->|Sí| K[Selecciona franja]
    K --> L[Ingresa: Materia + Grupo]
    L --> M[Confirma reserva]
    M --> N{Validación backend\nLock optimista}
    N -->|Conflicto detectado| O[Error: Slot ocupado\nRefresh automático]
    N -->|OK| P[INSERT en DB]
    P --> Q[Invalida caché]
    Q --> R[✅ Reserva creada\nEmail de confirmación]
```

### Flujo 2: Vista Semanal de Salón (Admin/Coordinador)

```mermaid
flowchart LR
    A[Dashboard Admin] --> B[Selecciona Bloque]
    B --> C[Grid: Salones x Franjas x Días]
    C --> D{Tipo de celda}
    D -->|Verde| E[Disponible - clickeable]
    D -->|Rojo| F[Ocupado - muestra profesor + materia]
    D -->|Gris| G[No disponible / festivo]
    E --> H[Admin puede reservar\nen nombre de alguien]
    F --> I[Admin puede cancelar\ncon notificación]
```

---

## 5. Seguridad y Escalabilidad

### Seguridad

| Capa | Medida |
|---|---|
| **Autenticación** | JWT con expiración corta (15min) + Refresh tokens (7 días) |
| **Autorización** | RBAC: profesor solo ve/crea sus reservas; admin gestiona todo |
| **API** | Rate limiting via Vercel KV (max 30 req/min por usuario) |
| **DB** | Prepared statements via Prisma (previene SQL injection) |
| **Inputs** | Validación con Zod en cliente y servidor |
| **Conflictos** | Transacciones DB con SELECT FOR UPDATE (lock pesimista en reservas) |
| **Sesiones** | NextAuth con CSRF protection nativo |

### Escalabilidad

| Aspecto | Estrategia |
|---|---|
| **Caché** | Redis (Vercel KV) para horarios consultados frecuentemente |
| **DB** | Connection pooling via Prisma + PgBouncer en producción |
| **Edge** | Middleware en Vercel Edge Network (auth checks sin latencia) |
| **Futuro** | Arquitectura lista para microservicios (API routes separables) |
| **Carga** | Vercel escala automáticamente funciones serverless |

---

*Versión: 1.0.0 | Proyecto: ClassSport | Arquitecto: IA Senior*
