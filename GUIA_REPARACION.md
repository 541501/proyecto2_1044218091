# 🔧 GUÍA PASO A PASO PARA REPARAR ERRORES

## Orden de reparación (de arriba hacia abajo)

---

## ✏️ PASO 1: Cambiar roles PROFESSOR → PROFESOR

**Archivo:** `components/layout/Sidebar.tsx`

### Cambio 1 (línea 31):
```typescript
// ANTES:
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['PROFESSOR', 'ADMIN'],
  },

// DESPUÉS:
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
```

### Cambio 2 (línea 47):
```typescript
// ANTES:
  {
    label: 'Mis Reservas',
    href: '/dashboard/reservas',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['PROFESSOR', 'ADMIN'],
  },

// DESPUÉS:
  {
    label: 'Mis Reservas',
    href: '/dashboard/reservas',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
```

### Cambio 3 (línea 62):
```typescript
// ANTES:
  const userRole = session?.user?.role || 'PROFESSOR';
  const isAdmin = userRole === 'ADMIN';

// DESPUÉS:
  const userRole = session?.user?.role || 'PROFESOR';
  const isAdmin = userRole === 'ADMIN';
```

---

## ✏️ PASO 2: Cambiar enum ACTIVA → CONFIRMADA

**Archivo:** `lib/validations/reserva.schema.ts`

### Cambio 1 (líneas 192-196):
```typescript
// ANTES:
/**
 * Schema para listar reservas con filtros
 */
export const FiltrosReservaSchema = z.object({
  estado: z
    .enum(['ACTIVA', 'CANCELADA'])
    .optional(),

// DESPUÉS:
/**
 * Schema para listar reservas con filtros
 */
export const FiltrosReservaSchema = z.object({
  estado: z
    .enum(['CONFIRMADA', 'CANCELADA'])
    .optional(),
```

---

## ✏️ PASO 3: Arreglar reservas.service.ts

**Archivo:** `lib/services/reservas.service.ts`

### Cambio 1 (líneas 120-123):
```typescript
// ANTES:
        const reservasExistentes =
          await tx.reserva.findMany({
            where: {
              salonId,
              fecha: new Date(fecha),
              estado: 'ACTIVA',
            },
          });

// DESPUÉS:
        const reservasExistentes =
          await tx.reserva.findMany({
            where: {
              salonId,
              fecha: new Date(fecha),
              estado: 'CONFIRMADA',
            },
          });
```

### Cambio 2 (líneas 125-137):
```typescript
// ANTES:
        const reserva = await tx.reserva.create({
          data: {
            usuarioId,
            salonId,
            fecha: new Date(fecha),
            horaInicio: new Date(
              `2000-01-01T${horaInicio}:00`
            ),
            horaFin: new Date(
              `2000-01-01T${horaFin}:00`
            ),
            nombreClase,
            descripcion: descripcion || null,
            estado: 'ACTIVA',
          },

// DESPUÉS:
        const reserva = await tx.reserva.create({
          data: {
            usuarioId,
            salonId,
            fecha: new Date(fecha),
            horaInicio,
            horaFin,
            nombreClase,
            descripcion: descripcion || null,
            estado: 'CONFIRMADA',
          },
```

### Cambio 3 (línea 195-196):
```typescript
// ANTES:
export async function listarReservasUsuario(
  usuarioId: string,
  filtros?: {
    estado?: 'ACTIVA' | 'CANCELADA';

// DESPUÉS:
export async function listarReservasUsuario(
  usuarioId: string,
  filtros?: {
    estado?: 'CONFIRMADA' | 'CANCELADA';
```

### Cambio 4 (línea 202-208):
```typescript
// ANTES:
    where: {
      usuarioId,
      ...(filtros?.estado && {
        estado: filtros.estado,
      }),

// DESPUÉS - verificar que se mantiene igual pero con tipo correcto

    where: {
      usuarioId,
      ...(filtros?.estado && {
        estado: filtros.estado,
      }),
```

### Cambio 5 (línea 227-232):
En `listarTodasReservas`, cambiar:
```typescript
// ANTES:
export async function listarTodasReservas(
  filtros?: {
    estado?: 'ACTIVA' | 'CANCELADA';

// DESPUÉS:
export async function listarTodasReservas(
  filtros?: {
    estado?: 'CONFIRMADA' | 'CANCELADA';
```

### Cambio 6 (línea 325-331) - CRÍTICO:
```typescript
// ANTES:
  // Obtener reservas activas ese día
  const reservas = await prisma.reserva.findMany({
    where: {
      salonId,
      fecha: new Date(fecha),
      estado: 'ACTIVA',
    },

// DESPUÉS:
  // Obtener reservas confirmadas ese día
  const reservas = await prisma.reserva.findMany({
    where: {
      salonId,
      fecha: new Date(fecha),
      estado: 'CONFIRMADA',
    },
```

### Cambio 7 (línea 346-351) - CRÍTICO (TypeError):
```typescript
// ANTES:
    const hayConflictoEnEsteHorario =
      reservas.some((r) => {
        const rInicio = (r.horaInicio as any).getHours();
        const rFin = (r.horaFin as any).getHours();
        // Solapamiento simple por hora
        return !(
          hora + 1 <= rInicio ||
          hora >= rFin
        );
      });

// DESPUÉS:
    const hayConflictoEnEsteHorario =
      reservas.some((r) => {
        const [rInicio] = r.horaInicio.split(':').map(Number);
        const [rFin] = r.horaFin.split(':').map(Number);
        // Solapamiento simple por hora
        return !(
          hora + 1 <= rInicio ||
          hora >= rFin
        );
      });
```

---

## ✏️ PASO 4: Corregir imports (notFound)

**Archivo:** `app/api/salones/[salonId]/route.ts`

### Cambio (líneas 7-11):
```typescript
// ANTES:
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores';

// DESPUÉS:
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores-api';
```

---

## ✏️ PASO 5: Corregir imports (notFound)

**Archivo:** `app/api/sedes/[sedeId]/route.ts`

### Cambio (líneas 7-14):
```typescript
// ANTES:
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores';

// DESPUÉS:
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores-api';
```

---

## ✏️ PASO 6: Corregir imports (badRequest)

**Archivo:** `app/api/salones/[salonId]/disponibilidad/route.ts`

### Cambio (líneas 9-14):
```typescript
// ANTES:
import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  badRequest,
} from '@/lib/utils/errores';

// DESPUÉS:
import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  badRequest,
} from '@/lib/utils/errores-api';
```

---

## ✅ VERIFICACIÓN FINAL

Después de hacer todos los cambios, ejecutar:

```bash
# Verificar que no hay errores de TypeScript
npm run typecheck

# Verificar que importa correctamente
npm run lint

# Correr tests si existen
npm run test

# Build de prueba
npm run build
```

---

## 📋 CHECKLIST DE REPARACIÓN

- [ ] Paso 1: Cambiar PROFESSOR → PROFESOR (3 cambios)
- [ ] Paso 2: Cambiar ACTIVA → CONFIRMADA en schema (1 cambio)
- [ ] Paso 3: Arreglar reservas.service.ts (7 cambios)
  - [ ] Cambio 3.1: estado en transacción
  - [ ] Cambio 3.2: horaInicio/horaFin de Date a String
  - [ ] Cambio 3.3: tipo en listarReservasUsuario
  - [ ] Cambio 3.4: estado en listarReservasUsuario
  - [ ] Cambio 3.5: tipo en listarTodasReservas
  - [ ] Cambio 3.6: estado en obtenerDisponibilidad
  - [ ] Cambio 3.7: .getHours() en split(':')
- [ ] Paso 4: Corregir import en salones/[salonId]/route.ts (1 cambio)
- [ ] Paso 5: Corregir import en sedes/[sedeId]/route.ts (1 cambio)
- [ ] Paso 6: Corregir import en salones/[salonId]/disponibilidad/route.ts (1 cambio)
- [ ] Verificación final: npm run typecheck
- [ ] Verificación final: npm run lint
- [ ] Test local

---

## ⏱️ Tiempo estimado: 20-30 minutos

**Total de cambios:** 14+ ediciones
**Complejidad:** Baja (mayoría son cambios directos)
**Riesgo:** Bajo (cambios bien definidos)
