# TABLA RÁPIDA DE ERRORES CRÍTICOS

| # | Archivo | Línea | Error | Tipo | Solución |
|---|---------|-------|-------|------|----------|
| 1 | lib/services/reservas.service.ts | 122 | `estado: 'ACTIVA'` - enum no existe | Tipo Prisma | Cambiar a `'CONFIRMADA'` |
| 2 | lib/services/reservas.service.ts | 126-137 | Asigna `Date` a campos `String` (horaInicio, horaFin) | Tipo datos | Quitar `new Date()`, usar string directo |
| 3 | lib/services/reservas.service.ts | 204 | `estado: 'ACTIVA'` - enum no existe | Tipo Prisma | Cambiar a `'CONFIRMADA'` |
| 4 | lib/services/reservas.service.ts | 328 | `estado: 'ACTIVA'` - enum no existe | Tipo Prisma | Cambiar a `'CONFIRMADA'` |
| 5 | lib/services/reservas.service.ts | 346-351 | `.getHours()` en String (horaInicio es STRING) | TypeError | Parsear con `split(':')` |
| 6 | lib/validations/reserva.schema.ts | 192-193 | `z.enum(['ACTIVA', 'CANCELADA'])` | Esquema | Cambiar a `['CONFIRMADA', 'CANCELADA']` |
| 7 | app/api/salones/[salonId]/route.ts | 10-11 | `notFound` importado de `errores` | Import | Cambiar a `from '@/lib/utils/errores-api'` |
| 8 | app/api/sedes/[sedeId]/route.ts | 10-11 | `notFound` importado de `errores` | Import | Cambiar a `from '@/lib/utils/errores-api'` |
| 9 | app/api/salones/[salonId]/disponibilidad/route.ts | 9-14 | `badRequest` importado de `errores` | Import | Cambiar a `from '@/lib/utils/errores-api'` |
| 10 | components/layout/Sidebar.tsx | 31 | `roles: ['PROFESSOR', 'ADMIN']` | Rol incorrecto | Cambiar a `['PROFESOR', 'ADMIN']` |
| 11 | components/layout/Sidebar.tsx | 47 | `roles: ['PROFESSOR', 'ADMIN']` | Rol incorrecto | Cambiar a `['PROFESOR', 'ADMIN']` |
| 12 | components/layout/Sidebar.tsx | 62 | `userRole === 'PROFESSOR'` | Rol incorrecto | Cambiar a `=== 'PROFESOR'` |

---

## 📍 UBICACIONES EXACTAS PARA REPARAR

### ❌ CAMBIOS EN lib/services/reservas.service.ts

**Línea 122 - Cambiar enum:**
```typescript
// ❌ ANTES:
estado: 'ACTIVA',

// ✅ DESPUÉS:
estado: 'CONFIRMADA',
```

**Líneas 126-137 - Cambiar tipos de datos:**
```typescript
// ❌ ANTES:
horaInicio: new Date(
  `2000-01-01T${horaInicio}:00`
),
horaFin: new Date(
  `2000-01-01T${horaFin}:00`
),

// ✅ DESPUÉS:
horaInicio,
horaFin,
```

**Línea 204 - Cambiar enum:**
```typescript
// ❌ ANTES:
estado?: 'ACTIVA' | 'CANCELADA';

// ✅ DESPUÉS:
estado?: 'CONFIRMADA' | 'CANCELADA';
```

**Línea 328 - Cambiar enum:**
```typescript
// ❌ ANTES:
estado: 'ACTIVA',

// ✅ DESPUÉS:
estado: 'CONFIRMADA',
```

**Líneas 346-351 - Cambiar lógica de parseo:**
```typescript
// ❌ ANTES:
const rInicio = (r.horaInicio as any).getHours();
const rFin = (r.horaFin as any).getHours();

// ✅ DESPUÉS:
const [hInicio] = r.horaInicio.split(':').map(Number);
const [hFin] = r.horaFin.split(':').map(Number);
// Y cambiar lógica: hora + 1 <= hInicio || hora >= hFin
```

---

### ❌ CAMBIOS EN lib/validations/reserva.schema.ts

**Línea 192-193 - Cambiar enum:**
```typescript
// ❌ ANTES:
estado: z
  .enum(['ACTIVA', 'CANCELADA'])
  .optional(),

// ✅ DESPUÉS:
estado: z
  .enum(['CONFIRMADA', 'CANCELADA'])
  .optional(),
```

---

### ❌ CAMBIOS EN app/api/salones/[salonId]/route.ts

**Línea 10-11 - Cambiar import:**
```typescript
// ❌ ANTES:
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores';

// ✅ DESPUÉS:
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores-api';
```

---

### ❌ CAMBIOS EN app/api/sedes/[sedeId]/route.ts

**Línea 10-11 - Cambiar import:**
```typescript
// ❌ ANTES:
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores';

// ✅ DESPUÉS:
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores-api';
```

---

### ❌ CAMBIOS EN app/api/salones/[salonId]/disponibilidad/route.ts

**Línea 9-14 - Cambiar import:**
```typescript
// ❌ ANTES:
import {
  handleApiError,
  badRequest,
} from '@/lib/utils/errores';

// ✅ DESPUÉS:
import {
  handleApiError,
  badRequest,
} from '@/lib/utils/errores-api';
```

---

### ❌ CAMBIOS EN components/layout/Sidebar.tsx

**Línea 31 - Cambiar rol:**
```typescript
// ❌ ANTES:
roles: ['PROFESSOR', 'ADMIN'],

// ✅ DESPUÉS:
roles: ['PROFESOR', 'ADMIN'],
```

**Línea 47 - Cambiar rol:**
```typescript
// ❌ ANTES:
roles: ['PROFESSOR', 'ADMIN'],

// ✅ DESPUÉS:
roles: ['PROFESOR', 'ADMIN'],
```

**Línea 62 - Cambiar rol:**
```typescript
// ❌ ANTES:
const userRole = session?.user?.role || 'PROFESSOR';

// ✅ DESPUÉS:
const userRole = session?.user?.role || 'PROFESOR';
```

---

## 🔧 TOTAL DE CAMBIOS NECESARIOS: 12

- **Archivos a modificar:** 5
- **Líneas a cambiar:** 12 cambios principales
