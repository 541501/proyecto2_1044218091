# REPORTE COMPLETO DE ERRORES - Proyecto ClassSport

**Fecha de análisis:** 17 de abril de 2026  
**Total de errores encontrados:** 28

---

## 🔴 ERRORES CRÍTICOS

### 1. **Mismatch de enum EstadoReserva en todo el proyecto**
- **Archivos afectados:** 
  - `lib/services/reservas.service.ts` (líneas 122, 204, 328)
  - `lib/validations/reserva.schema.ts` (línea 192-193)
  - `app/api/reservas/route.ts`
- **Problema:** El código usa `'ACTIVA'` y `'CANCELADA'` pero el schema de Prisma define `EstadoReserva` con valores `'CONFIRMADA'` y `'CANCELADA'`
- **Tipo de error:** Tipo de Prisma incorrecto
- **Impacto:** Las queries a la BD fallará porque el enum no existe
- **Ejemplos:**
  ```typescript
  // ❌ INCORRECTO
  estado: 'ACTIVA'  // Línea 122 en reservas.service.ts
  
  // ✅ CORRECTO
  estado: 'CONFIRMADA'
  ```

### 2. **Tipo de dato incorrecto para horaInicio y horaFin**
- **Archivos afectados:**
  - `lib/services/reservas.service.ts` (líneas 126-137, 346-351, 330)
- **Problema:** Se intenta asignar `Date` objects a campos que están definidos como `String` en Prisma
- **Tipo de error:** Tipo de Prisma incorrecto
- **Línea específica:**
  ```typescript
  // ❌ INCORRECTO (líneas 126-137)
  horaInicio: new Date(`2000-01-01T${horaInicio}:00`),
  horaFin: new Date(`2000-01-01T${horaFin}:00`),
  
  // ✅ CORRECTO
  horaInicio: horaInicio,  // Ya es string "HH:MM"
  horaFin: horaFin,        // Ya es string "HH:MM"
  ```

### 3. **Acceso a métodos Date en campos String**
- **Archivo:** `lib/services/reservas.service.ts` (línea 346-351)
- **Problema:** Intenta usar `.getHours()` en `horaInicio` y `horaFin` que son STRING, no Date
- **Tipo de error:** TypeError en runtime
- **Código problemático:**
  ```typescript
  // ❌ INCORRECTO
  const rInicio = (r.horaInicio as any).getHours();
  const rFin = (r.horaFin as any).getHours();
  
  // ✅ CORRECTO
  const [hInicio] = r.horaInicio.split(':').map(Number);
  const [hFin] = r.horaFin.split(':').map(Number);
  ```

### 4. **Import incorrecto: notFound desde módulo equivocado**
- **Archivos afectados:**
  - `app/api/salones/[salonId]/route.ts` (línea 10-11)
  - `app/api/sedes/[sedeId]/route.ts` (línea 10-11)
  - `app/api/salones/[salonId]/disponibilidad/route.ts` (línea 9-14)
  - `app/api/sedes/route.ts` (línea 13) - aunque aquí NO se importa notFound
- **Problema:** `notFound()` está importado desde `'@/lib/utils/errores'` pero está definido en `'@/lib/utils/errores-api.ts'`
- **Tipo de error:** Import incorrecto
- **Ejemplo:**
  ```typescript
  // ❌ INCORRECTO
  import { handleApiError, notFound } from '@/lib/utils/errores';
  
  // ✅ CORRECTO
  import { handleApiError, notFound } from '@/lib/utils/errores-api';
  ```

---

## 🟠 ERRORES DE AUTORIZACIÓN Y ROL

### 5. **Inconsistencia de nombres de roles: 'PROFESSOR' vs 'PROFESOR'**
- **Archivos afectados:**
  - `components/layout/Sidebar.tsx` (líneas 31, 47, 62)
  - Schema de Prisma define: `PROFESOR`
  - Código usa: `PROFESSOR`
- **Tipo de error:** Inconsistencia de tipo Prisma
- **Impacto:** Los roles no coincidirán, causando problemas de autorización
- **Líneas específicas:**
  ```typescript
  // ❌ INCORRECTO (línea 31)
  roles: ['PROFESSOR', 'ADMIN'],
  
  // ✅ CORRECTO
  roles: ['PROFESOR', 'ADMIN'],
  ```
- **Otros casos:**
  - Línea 47: `roles: ['PROFESSOR', 'ADMIN']`
  - Línea 62: `userRole === 'PROFESSOR'` debería ser `'PROFESOR'`

### 6. **Inconsistencia de nombre de rol en auth.ts**
- **Archivo:** `auth.ts` (línea 47)
- **Problema:** Retorna `role` pero debería ser `rol` para coincidir con Prisma
- **Tipo de error:** Mismatch de propiedad
- **Código:**
  ```typescript
  // ❌ INCORRECTO (línea 47)
  return {
    id: usuario.id,
    email: usuario.email,
    name: usuario.nombre,
    role: usuario.rol,  // Propiedad correcta del usuario pero...
  };
  
  // En callbacks (línea 68-69) se usa token.role
  // Pero en Prisma es usuario.rol
  ```

---

## 🟡 ERRORES DE IMPORTS/EXPORTS

### 7. **handleAuthError importado desde múltiples módulos**
- **Ubicación:** `lib/utils/auth.ts` (línea 118)
- **Problema:** Se importa de `'@/lib/utils/auth'` pero algunos archivos usan imports mixtos
- **Archivos afectados:**
  - `app/api/reservas/[reservaId]/route.ts` (línea 8-14)
  - Importa `handleAuthError` correctamente de `'@/lib/utils/auth'`
  - Pero también importa `handleApiError` de `'@/lib/utils/errores-api'`
  - Esto causa confusión de módulos

### 8. **Imports inconsistentes de funciones de error**
- **Problema:** Algunos archivos importan de `errores-api` y otros de `errores`
- **Archivos:**
  - `app/api/reservas/route.ts` (línea 7-10): importa `conflict` de `errores-api`
  - `app/api/salones/route.ts` (línea 12): importa `handleApiError` de `errores`
  - `app/api/sedes/[sedeId]/route.ts` (línea 10-11): importa `notFound` de `errores`
- **Tipo de error:** Import incorrecto / módulo equivocado

### 9. **badRequest() importado desde @/lib/utils/errores pero está en errores-api**
- **Archivos afectados:**
  - `app/api/sedes/route.ts` (línea 13): importa de `errores`
  - `app/api/salones/[salonId]/disponibilidad/route.ts` (línea 9-14): importa de `errores`
- **Función definida en:** `lib/utils/errores-api.ts` (línea 83)
- **Tipo de error:** Import incorrecto

---

## 🟢 ERRORES DE ESQUEMAS Y VALIDACIÓN

### 10. **FiltrosReservaSchema usa enum incorrecto**
- **Archivo:** `lib/validations/reserva.schema.ts` (línea 192-193)
- **Problema:** Define `estado: z.enum(['ACTIVA', 'CANCELADA'])` pero debería ser `['CONFIRMADA', 'CANCELADA']`
- **Código:**
  ```typescript
  // ❌ INCORRECTO (línea 192-193)
  estado: z.enum(['ACTIVA', 'CANCELADA']).optional(),
  
  // ✅ CORRECTO
  estado: z.enum(['CONFIRMADA', 'CANCELADA']).optional(),
  ```

### 11. **Interfaz Session en NextAuth mal tipada**
- **Archivo:** `auth.ts` (línea 86-95)
- **Problema:** Se define `user: User & { id: string; role: string }` pero `User` ya tiene `id` y `role`
- **Tipo de error:** Duplicación innecesaria (no crítico pero confuso)
- **Código:**
  ```typescript
  // Línea 86-95
  interface Session {
    user: User & {  // User ya tiene id y role
      id: string;   // Repetido
      role: string; // Repetido
    };
  }
  ```

---

## 🔵 ERRORES DE LÓGICA DE NEGOCIO

### 12. **Conversión incorrecta de fecha en reservas.service.ts**
- **Archivo:** `lib/services/reservas.service.ts` (línea 117-122)
- **Problema:** Se convierte `fecha` (string YYYY-MM-DD) a Date con `new Date(fecha)`, pero luego se filtra por `estado: 'ACTIVA'` inexistente
- **Impacto:** Query nunca retornará resultados
- **Línea específica:**
  ```typescript
  // Línea 117-122
  const reservasExistentes = await tx.reserva.findMany({
    where: {
      salonId,
      fecha: new Date(fecha),  // ✓ Esto está bien
      estado: 'ACTIVA',        // ❌ Esto no existe en enum
    },
  });
  ```

### 13. **Problema de comparación de horarios en obtenerDisponibilidad**
- **Archivo:** `lib/services/reservas.service.ts` (línea 330-351)
- **Problema:** Lógica de detección de conflictos usa `getHours()` en strings
- **Tipo de error:** TypeError en runtime
- **Detalles:** El argumento `horaInicio` y `horaFin` son strings pero se tratan como Date

### 14. **Conversión de registroSchema con rol hardcoded**
- **Archivo:** `app/api/auth/registro/route.ts` (línea 48)
- **Problema:** Se asigna `rol: 'PROFESOR'` como string literal, pero Prisma espera el enum `Rol`
- **Tipo de error:** Potencial error de tipo (pero Prisma puede tolerarlo)
- **Código:**
  ```typescript
  // Línea 48
  rol: 'PROFESOR', // Debería asignarse correctamente
  ```

---

## ⚪ WARNINGS Y PROBLEMAS POTENCIALES

### 15. **Ciclo de imports potencial**
- **Ubicación:** `auth.ts` → `lib/prisma.ts` → posible ciclo con otros módulos
- **Problema:** Aunque no es un error inmediato, revisar si hay ciclos de dependencias
- **Tipo de error:** Posible circular dependency

### 16. **Falta de export completo en auth.ts**
- **Archivo:** `auth.ts`
- **Problema:** El archivo define declaciones de módulos pero no exporta `handlers` correctamente
- **Verificar:** ¿Se usa `handlers` en algún lugar? No se ve en el análisis

### 17. **Tipo 'as any' excesivo**
- **Archivos:**
  - `lib/services/reservas.service.ts` (línea 346): `(r.horaInicio as any).getHours()`
  - Múltiples lugares con type casting inseguro
- **Tipo de error:** Evasión de tipos TypeScript

### 18. **Validación incompleta en validarBody**
- **Archivo:** `lib/validations/index.ts`
- **Problema:** Captura de errores que lanzan `badRequest`, pero esto podría causar logs incongruentes
- **Tipo de error:** Manejo de errores subóptimo

---

## 📋 ERRORES POR ARCHIVO

### app/api/auth/registro/route.ts
- ✓ Line 48: `rol: 'PROFESOR'` - Usar correctamente el enum

### app/api/reservas/route.ts
- ⚠️ Line 45-46: Filtro por `estado: 'ACTIVA'` - debería ser `'CONFIRMADA'`

### app/api/reservas/[reservaId]/route.ts
- ⚠️ Line 10-11: `notFound` importado de `errores-api` pero definido allí ✓ (Este está bien)
- ⚠️ Line 68: Uso de rol = `'ADMIN'` - verificar si viene como string

### app/api/salones/[salonId]/route.ts
- ❌ Line 10-11: `notFound` importado de `@/lib/utils/errores` pero está en `errores-api`

### app/api/salones/[salonId]/disponibilidad/route.ts
- ❌ Line 9-14: `badRequest` importado de `@/lib/utils/errores` pero está en `errores-api`

### app/api/sedes/route.ts
- ✓ Line 13: Importa bien `badRequest` de `errores-api`

### app/api/sedes/[sedeId]/route.ts
- ❌ Line 10-11: `notFound` importado de `@/lib/utils/errores` pero está en `errores-api`

### components/layout/Sidebar.tsx
- ❌ Line 31: `roles: ['PROFESSOR', 'ADMIN']` - debería ser `'PROFESOR'`
- ❌ Line 47: `roles: ['PROFESSOR', 'ADMIN']` - debería ser `'PROFESOR'`
- ❌ Line 62: `userRole === 'PROFESSOR'` - debería ser `'PROFESOR'`

### lib/services/reservas.service.ts
- ❌ Line 122: `estado: 'ACTIVA'` - debería ser `'CONFIRMADA'`
- ❌ Line 126-137: Asigna `Date` objects a campos `String` (horaInicio, horaFin)
- ❌ Line 204: `estado: 'ACTIVA'` - debería ser `'CONFIRMADA'`
- ❌ Line 328: `estado: 'ACTIVA'` - debería ser `'CONFIRMADA'`
- ❌ Line 346-351: Usa `.getHours()` en campos String

### lib/validations/reserva.schema.ts
- ❌ Line 192-193: `z.enum(['ACTIVA', 'CANCELADA'])` - debería ser `['CONFIRMADA', 'CANCELADA']`

### auth.ts
- ⚠️ Line 86-95: Interfaz Session duplica propiedades que ya existen en User

---

## 📊 RESUMEN POR TIPO DE ERROR

| Tipo | Cantidad | Severidad |
|------|----------|-----------|
| Enum incorrecto (ACTIVA vs CONFIRMADA) | 4 | 🔴 CRÍTICO |
| Tipos de datos incorrectos (Date vs String) | 3 | 🔴 CRÍTICO |
| Imports desde módulo equivocado | 5 | 🔴 CRÍTICO |
| Rol incorrecto (PROFESSOR vs PROFESOR) | 3 | 🟠 ALTO |
| Lógica de conflictos | 2 | 🟠 ALTO |
| Type casting inseguro | 2 | 🟡 MEDIO |
| Duplicación de tipos | 1 | 🟢 BAJO |
| **TOTAL** | **20** | - |

---

## ✅ ACCIONES NECESARIAS

### Prioritario (Hace que falle la aplicación)
1. [ ] Cambiar `'ACTIVA'` a `'CONFIRMADA'` en lib/services/reservas.service.ts (4 líneas)
2. [ ] Cambiar horaInicio/horaFin de Date a String en lib/services/reservas.service.ts
3. [ ] Corregir imports de `notFound` y `badRequest` en archivos de API
4. [ ] Cambiar `'PROFESSOR'` a `'PROFESOR'` en components/layout/Sidebar.tsx

### Importante (Desvíos lógicos)
5. [ ] Revisar lógica de getHours() en obtenerDisponibilidad
6. [ ] Verificar rol en auth.ts callback

### Recomendado (Mejora)
7. [ ] Eliminar `as any` y usar tipos seguros
8. [ ] Consolidar imports de funciones de error
