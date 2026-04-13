# 🧩 Plan de Implementación por Fases — ClassSport
## Sistema de Gestión y Reserva de Salones Universitarios

> **Versión:** 1.0  
> **Fecha:** Abril 2026  
> **Referencia:** arquitectura.md v1.0  
> **Duración estimada total:** 22 días hábiles (~4.5 semanas)  
> **Metodología:** Entrega incremental — cada fase produce un artefacto funcional y verificable independiente

---

## Resumen Ejecutivo de Fases

| # | Fase | Duración | Rol principal | Entregable |
|:---:|---|:---:|---|---|
| 1 | Definición y Diseño del Sistema | Días 1–2 | Arquitecto / PM Técnico | Documentación técnica completa |
| 2 | Diseño UX/UI | Días 3–6 | Diseñador UX/UI Senior | Sistema de diseño + mockups + prototipo |
| 3 | Setup del Proyecto | Días 7–8 | Ingeniero Fullstack Senior | Repositorio configurado + CI/CD activo |
| 4 | Desarrollo Backend | Días 9–13 | Ingeniero Backend Senior | API REST completa + BD funcional |
| 5 | Desarrollo Frontend | Días 14–17 | Ingeniero Frontend Senior | UI completa conectada a la API |
| 6 | Integración y Pruebas | Días 18–19 | Fullstack + QA Engineer | Sistema integrado y probado |
| 7 | Testing | Días 20–21 | QA Engineer | Suite de tests completa |
| 8 | Despliegue y Go-Live | Día 22 | DevOps / Fullstack Senior | Sistema en producción |

---

## Diagrama de Dependencias entre Fases

```
FASE 1           FASE 2           FASE 3
Definición  ──▶  UX/UI       ──▶  Setup
Documentos       Mockups          Repositorio
                 Sistema          CI/CD
                 de diseño            │
                                      ▼
                              FASE 4        FASE 5
                              Backend  ──▶  Frontend
                              API REST      UI + componentes
                              BD + Auth         │
                                               ▼
                                        FASE 6
                                        Integración
                                        E2E Funcional
                                             │
                                             ▼
                                        FASE 7
                                        Testing
                                        Unit + E2E
                                             │
                                             ▼
                                        FASE 8
                                        Deploy
                                        Producción
```

---

---

# FASE 1 — Definición y Diseño del Sistema

> **Duración:** Días 1–2  
> **Roles:** Arquitecto de Software · Project Manager Técnico  
> **Objetivo:** Solidificar todos los requisitos funcionales y no funcionales del sistema, validar la arquitectura propuesta y dejar todos los documentos técnicos listos antes de escribir una sola línea de código.

---

## 1.1 Tareas

### Definición de requisitos funcionales
- Documentar los casos de uso completos del sistema (RF-001 al RF-020)
- Definir las reglas de negocio de bloqueo de horarios
- Especificar los datos de las dos sedes universitarias, sus bloques y salones
- Definir los roles de usuario (ADMIN y PROFESOR) y sus capacidades exactas
- Documentar los flujos críticos: registro, login, crear reserva, cancelar reserva

### Definición de requisitos no funcionales
- Tiempo máximo de respuesta aceptable para crear una reserva: < 2 segundos
- Disponibilidad del sistema: 99.5% (apropiado para sistema universitario)
- Soporte de navegadores: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- Responsividad: mobile-first, funcional desde 320px de ancho

### Validación de arquitectura
- Revisar y aprobar el documento `arquitectura.md`
- Confirmar el schema de base de datos y sus constraints críticos
- Confirmar la estrategia anti-race-conditions (triple capa)
- Definir la estrategia de datos semilla (seed): sedes, bloques, salones iniciales

### Datos iniciales del sistema (seed)
Definir con el cliente los datos reales de las dos sedes:

**Sede 1 — [Nombre real a confirmar]**
- Bloques: [listar bloques reales]
- Salones por bloque: [listar con capacidades]

**Sede 2 — [Nombre real a confirmar]**
- Bloques: [listar bloques reales]
- Salones por bloque: [listar con capacidades]

### Creación de cuentas y accesos
- Crear cuenta en GitHub y repositorio `classsport`
- Crear cuenta en Vercel y vincular con GitHub
- Crear cuenta en Neon.tech y crear proyecto de base de datos
- Configurar los 4 branches de Neon (dev, preview, staging, main)

## 1.2 Tecnologías involucradas
- Notion / Google Docs para documentación de requisitos
- Neon.tech para aprovisionamiento inicial de la BD
- GitHub para creación del repositorio

## 1.3 Entregables
- [ ] Documento de requisitos funcionales y no funcionales
- [ ] Datos reales de sedes, bloques y salones confirmados por el cliente
- [ ] `arquitectura.md` aprobado
- [ ] Cuentas de GitHub, Vercel y Neon.tech creadas y configuradas
- [ ] Accesos y credenciales documentados en bóveda segura

---

---

# FASE 2 — Diseño UX/UI

> **Duración:** Días 3–6  
> **Roles:** Diseñador UX/UI Senior  
> **Objetivo:** Diseñar la experiencia completa del sistema — desde el login hasta la gestión de reservas — priorizando claridad, eficiencia y prevención de errores. El diseño final se entrega como sistema de diseño + prototipo interactivo.

---

## 2.1 Tareas

### Investigación y arquitectura de información
- Definir el mapa de sitio completo (todas las páginas y su jerarquía)
- Definir los flujos de usuario principales:
  - Flujo 1: Profesor nuevo → registro → primer login → crear reserva
  - Flujo 2: Profesor → buscar disponibilidad → reservar salón
  - Flujo 3: Profesor → ver mis reservas → cancelar una
  - Flujo 4: Admin → gestionar sedes/bloques/salones
  - Flujo 5: Admin → ver todas las reservas del día

### Wireframes (baja fidelidad)
- Pantalla de login / registro
- Dashboard principal (vista de hoy)
- Vista de sede con bloques
- Vista de salón con calendario semanal
- Formulario de nueva reserva con selector de horario
- Lista "Mis reservas"
- Panel de administración

### Sistema de diseño
Definir y documentar:
- **Paleta de colores:** primario, secundario, semánticos (éxito, error, advertencia, info)
- **Tipografía:** familia, escala de tamaños, pesos
- **Espaciado:** sistema de 4px o 8px base
- **Componentes base:** botones, inputs, modales, cards, badges, toasts
- **Estados visuales de horarios:** libre (verde), ocupado (gris/rojo), seleccionado (azul), propio (azul claro)
- **Iconografía:** set de iconos de Lucide React a usar

### Mockups de alta fidelidad (en Figma o similar)
- Versión desktop de todas las pantallas principales
- Versión mobile de las pantallas críticas (dashboard, selector de salón, formulario de reserva)
- Todos los estados de UI: loading, empty state, error state, success state

### Prototipo interactivo
- Flujo completo de reserva (clickeable)
- Revisión y aprobación con el cliente

## 2.2 Tecnologías involucradas
- Figma (mockups y prototipo)
- Tailwind CSS v3 (referencia para el sistema de diseño)
- shadcn/ui (componentes base a personalizar)

## 2.3 Entregables
- [ ] Mapa de sitio documentado
- [ ] Wireframes de todas las pantallas (baja fidelidad)
- [ ] Sistema de diseño documentado (colores, tipografía, componentes)
- [ ] Mockups de alta fidelidad desktop y mobile
- [ ] Prototipo interactivo aprobado por el cliente
- [ ] Especificación de tokens de diseño (variables CSS / Tailwind config)
- [ ] `fase_2_resumen.md`

---

---

# FASE 3 — Setup del Proyecto

> **Duración:** Días 7–8  
> **Roles:** Ingeniero Fullstack Senior · Ingeniero DevOps  
> **Objetivo:** Crear el proyecto Next.js completamente configurado, con TypeScript estricto, herramientas de calidad de código, pipeline CI/CD funcional y base de datos aprovisionada. Al final de esta fase el equipo puede empezar a desarrollar sobre una base sólida.

---

## 3.1 Tareas

### Inicialización del proyecto
- Crear proyecto Next.js 14 con App Router, TypeScript, Tailwind CSS
- Configurar `tsconfig.json` con `strict: true` y paths aliases
- Instalar y configurar todas las dependencias del stack
- Configurar ESLint con reglas TypeScript estrictas
- Configurar Prettier con plugin de Tailwind
- Configurar Husky + lint-staged (validación pre-commit)
- Configurar scripts en `package.json` (`dev`, `build`, `typecheck`, `validate`)

### Configuración de la base de datos
- Conectar el proyecto con Neon.tech (branch `dev`)
- Crear `prisma/schema.prisma` completo según `arquitectura.md`
- Ejecutar la primera migración: `prisma migrate dev --name init`
- Crear `prisma/seed.ts` con los datos reales de las dos sedes, bloques y salones
- Ejecutar `prisma db seed` para poblar la BD de desarrollo
- Crear `lib/prisma.ts` con el singleton de PrismaClient

### Configuración de autenticación base
- Instalar y configurar NextAuth.js v5
- Crear `lib/auth.ts` con el provider de credentials
- Crear `app/api/auth/[...nextauth]/route.ts`
- Crear el middleware de protección de rutas `middleware.ts`

### Estructura de carpetas
- Crear toda la estructura de carpetas definida en `arquitectura.md`
- Crear archivos placeholder con tipos básicos
- Crear `lib/types/index.ts` con tipos derivados de Prisma
- Crear `lib/validations/` con esquemas Zod base

### Pipeline CI/CD
- Crear `.github/workflows/ci.yml` (typecheck + lint + build en PRs)
- Vincular repositorio con Vercel
- Configurar variables de entorno en Vercel (dev, staging, prod)
- Verificar que el primer deploy automático a Vercel funciona

### Configuración de Tailwind y shadcn/ui
- Configurar `tailwind.config.ts` con los tokens del sistema de diseño (Fase 2)
- Instalar shadcn/ui y los componentes base necesarios
- Crear `app/globals.css` con variables CSS del sistema de diseño

## 3.2 Tecnologías involucradas
- Next.js 14, TypeScript 5, Tailwind CSS
- Prisma 5, PostgreSQL (Neon.tech)
- NextAuth.js v5
- GitHub Actions, Vercel
- pnpm, ESLint, Prettier, Husky

## 3.3 Entregables
- [ ] Repositorio GitHub con proyecto inicializado y commiteado
- [ ] `tsconfig.json` con `strict: true` verificado (`pnpm typecheck` limpio)
- [ ] Schema de Prisma creado y primera migration ejecutada
- [ ] Base de datos de desarrollo con datos semilla
- [ ] NextAuth configurado (login con email/password funcional)
- [ ] Middleware de rutas protegidas funcionando
- [ ] GitHub Actions pasando en el PR inicial
- [ ] Deploy automático en Vercel activo (URL de preview)
- [ ] `pnpm validate` pasa sin errores
- [ ] `fase_3_resumen.md`

---

---

# FASE 4 — Desarrollo Backend

> **Duración:** Días 9–13  
> **Roles:** Ingeniero Backend Senior · Ingeniero Fullstack Senior  
> **Objetivo:** Implementar todas las API Routes del sistema con su lógica de negocio, validaciones, manejo de errores y la lógica crítica de bloqueo de reservas. Al finalizar esta fase, la API está completamente funcional y verificable con herramientas como Postman o curl.

---

## 4.1 Tareas

### Utilidades del servidor
- Implementar `lib/utils/errores.ts`: función `handleApiError(e)` que mapea errores de Prisma a respuestas HTTP correctas (P2002 → 409, P2025 → 404, etc.)
- Implementar `lib/utils/horarios.ts`: función `hayConflicto(reservas[], horaInicio, horaFin)` que detecta solapamientos
- Implementar helper `verificarSesion(req)` que valida autenticación y retorna la sesión o lanza 401

### API de Sedes
- `GET /api/sedes` — Lista todas las sedes con sus bloques (solo ADMIN y PROFESOR autenticados)
- `POST /api/sedes` — Crear sede (solo ADMIN)
- `GET /api/sedes/[sedeId]` — Detalle de sede con sus bloques y salones
- `PUT /api/sedes/[sedeId]` — Actualizar sede (solo ADMIN)
- `DELETE /api/sedes/[sedeId]` — Eliminar sede (solo ADMIN)

### API de Bloques y Salones
- `GET /api/sedes/[sedeId]/bloques` — Lista bloques de una sede
- `POST /api/sedes/[sedeId]/bloques` — Crear bloque (solo ADMIN)
- `GET /api/salones` — Lista todos los salones con filtros opcionales
- `GET /api/salones/[salonId]` — Detalle de salón
- `GET /api/salones/[salonId]/disponibilidad?fecha=YYYY-MM-DD` — Horarios ocupados del día

### API de Reservas (LÓGICA CRÍTICA)
Implementar `lib/services/reservas.service.ts` con:

```typescript
// Función central — verificar disponibilidad y crear reserva atómicamente
async function crearReserva(datos: CrearReservaInput, usuarioId: string): Promise<Reserva>
// - Usa transacción con SELECT ... FOR UPDATE
// - Verifica solapamiento de horarios
// - Retorna la reserva creada o lanza ConflictoHorarioError

async function listarReservasUsuario(usuarioId: string): Promise<Reserva[]>
async function cancelarReserva(reservaId: string, usuarioId: string): Promise<void>
async function listarTodasReservas(filtros: FiltrosReserva): Promise<Reserva[]>  // solo ADMIN
```

Endpoints:
- `GET /api/reservas` — Mis reservas (PROFESOR) / Todas (ADMIN con filtros: fecha, sede, estado)
- `POST /api/reservas` — Crear reserva con lógica de bloqueo atómico
- `GET /api/reservas/[reservaId]` — Detalle de reserva (propia o ADMIN)
- `PUT /api/reservas/[reservaId]` — Cancelar reserva (solo propia o ADMIN)

### Validaciones Zod para el servidor
- `lib/validations/reserva.schema.ts`: schema completo de creación de reserva
- `lib/validations/sede.schema.ts`: schema de creación/edición de sede
- `lib/validations/usuario.schema.ts`: schema de registro de usuario
- Función utilitaria `validarBody<T>(schema, body)` que retorna 400 si falla

### Tests unitarios del servicio de reservas
- Test: crear reserva en slot libre → debe crear exitosamente
- Test: crear reserva en slot ocupado → debe retornar 409
- Test: crear reserva solapada (parcialmente) → debe retornar 409
- Test: cancelar reserva propia → debe actualizar estado a CANCELADA
- Test: cancelar reserva ajena (como PROFESOR) → debe retornar 403

## 4.2 Tecnologías involucradas
- Next.js API Routes
- Prisma 5 (transacciones, queries)
- PostgreSQL (constraints, FOR UPDATE)
- Zod (validación server-side)
- Vitest (unit tests)
- NextAuth.js (getServerSession)

## 4.3 Entregables
- [ ] Todos los endpoints de sedes, bloques y salones implementados
- [ ] Endpoint de disponibilidad implementado y verificado
- [ ] Servicio de reservas con lógica de bloqueo atómico implementado
- [ ] Todos los endpoints de reservas implementados
- [ ] Validaciones Zod en todos los endpoints POST/PUT
- [ ] Manejo de errores consistente en toda la API
- [ ] Tests unitarios del servicio de reservas: 100% pasando
- [ ] Documentación de endpoints (comentarios en código o colección Postman)
- [ ] `pnpm validate` pasa sin errores
- [ ] `fase_4_resumen.md`

---

---

# FASE 5 — Desarrollo Frontend

> **Duración:** Días 14–17  
> **Roles:** Ingeniero Frontend Senior · Diseñador UX/UI (revisión)  
> **Objetivo:** Implementar toda la interfaz de usuario siguiendo los mockups de la Fase 2, consumiendo la API de la Fase 4. Prioridad: el flujo de reserva debe ser impecable en usabilidad.

---

## 5.1 Tareas

### Componentes de layout y navegación
- `components/layout/Sidebar.tsx`: navegación lateral con sedes, mis reservas, admin
- `components/layout/Header.tsx`: nombre de usuario, sede activa, logout
- `components/layout/MobileNav.tsx`: navegación mobile con bottom tabs
- `app/(dashboard)/layout.tsx`: layout principal con sidebar responsivo

### Páginas de autenticación
- `app/(auth)/login/page.tsx`: formulario de login con React Hook Form + Zod
- `app/(auth)/registro/page.tsx`: formulario de registro con validación
- Manejo de errores de autenticación (credenciales inválidas, email en uso)
- Redirección automática si ya está autenticado

### Dashboard principal
- `app/(dashboard)/page.tsx`: vista de hoy
  - Resumen: cuántos salones disponibles ahora, mis reservas de hoy
  - Lista de reservas del día (para la sede seleccionada)
  - Acceso rápido a crear nueva reserva

### Vista de sedes y salones
- `app/(dashboard)/sedes/page.tsx`: grid de las dos sedes
- `app/(dashboard)/sedes/[sedeId]/page.tsx`: detalle de sede con bloques colapsables
- `app/(dashboard)/sedes/[sedeId]/[bloqueId]/page.tsx`: grid de salones del bloque
- `components/salones/TarjetaSalon.tsx`: muestra disponibilidad actual del salón

### Componente de calendario y disponibilidad (CRÍTICO)
- `components/reservas/CalendarioSalon.tsx`:
  - Grilla de slots horarios (7:00–22:00, intervalos de 1 hora)
  - Slots ocupados: gris oscuro, tooltip con nombre de clase y profesor
  - Slots libres: verde suave, clickeable
  - Navegación entre días (← →)
  - Indicador de "cargando disponibilidad"
  - Revalidación automática cada 60 segundos

- `components/reservas/SelectorHorario.tsx`:
  - Selección de hora inicio y hora fin con validación de solapamiento visual
  - Solo permite seleccionar slots libres
  - Previsualización del bloque de tiempo a reservar

### Formulario de nueva reserva (CRÍTICO)
- `app/(dashboard)/reservas/nueva/page.tsx`:
  - Paso 1: Seleccionar sede → bloque → salón
  - Paso 2: Seleccionar fecha y horario (con CalendarioSalon integrado)
  - Paso 3: Completar nombre de clase y descripción
  - Validación con React Hook Form + Zod
  - Optimistic update al confirmar
  - Manejo de error 409 (conflicto) con mensaje claro y refresco del calendario

### Vista de mis reservas
- `app/(dashboard)/reservas/page.tsx`:
  - Lista de reservas futuras y pasadas del profesor
  - Filtro por fecha y sede
  - Botón cancelar (con confirmación modal)
  - Badge de estado (Activa / Cancelada)

### Panel de administración
- `app/(dashboard)/admin/page.tsx`: resumen general
- `app/(dashboard)/admin/sedes/page.tsx`: CRUD de sedes
- `app/(dashboard)/admin/salones/page.tsx`: CRUD de bloques y salones
- `app/(dashboard)/admin/usuarios/page.tsx`: lista de profesores registrados
- Vista de todas las reservas con filtros avanzados (fecha, sede, bloque, salón, profesor)

### Estados de UI transversales
- `components/common/LoadingSpinner.tsx`
- `components/common/EmptyState.tsx` (con ilustración y CTA)
- `app/(dashboard)/error.tsx` y `app/(dashboard)/not-found.tsx`
- `app/(dashboard)/loading.tsx` (skeleton screens)
- Sistema de toasts para feedback: reserva creada, cancelada, error de conflicto

## 5.2 Tecnologías involucradas
- React 18 (Server Components + Client Components)
- Next.js 14 App Router
- TypeScript 5 strict
- Tailwind CSS + shadcn/ui
- TanStack Query (React Query) v5
- React Hook Form + Zod
- date-fns

## 5.3 Entregables
- [ ] Layout principal con sidebar/header/mobile nav funcional
- [ ] Páginas de login y registro funcionando
- [ ] Dashboard principal con datos reales
- [ ] Vista de sedes, bloques y salones completa
- [ ] CalendarioSalon con disponibilidad en tiempo real
- [ ] Formulario de nueva reserva — flujo completo funcional
- [ ] Vista "Mis reservas" con cancelación
- [ ] Panel de administración (todas las secciones)
- [ ] Estados de loading, error y empty en todas las páginas
- [ ] Diseño consistente con los mockups de Fase 2
- [ ] Responsivo en mobile y desktop
- [ ] `pnpm typecheck` y `pnpm lint` limpios
- [ ] `fase_5_resumen.md`

---

---

# FASE 6 — Integración y Pruebas Funcionales

> **Duración:** Días 18–19  
> **Roles:** Ingeniero Fullstack Senior · QA Engineer  
> **Objetivo:** Conectar frontend y backend en el entorno de staging, ejecutar todos los flujos de usuario end-to-end manualmente y resolver cualquier problema de integración antes de la fase de testing formal.

---

## 6.1 Tareas

### Despliegue en staging
- Crear branch `develop` en Git y hacer merge de todo el trabajo de Fases 3–5
- Configurar la BD de Neon branch `staging` con datos semilla completos
- Hacer deploy a entorno de staging en Vercel
- Verificar que todas las variables de entorno de staging están configuradas

### Ejecución de flujos críticos completos
Ejecutar manualmente cada flujo y documentar el resultado:

**Flujo 1 — Registro y primer login**
- Registrar un nuevo profesor
- Confirmar que el rol es PROFESOR por defecto
- Login con las credenciales recién creadas
- Verificar redirección al dashboard

**Flujo 2 — Reserva exitosa**
- Navegar a sede → bloque → salón
- Seleccionar una fecha futura
- Verificar que el calendario muestra disponibilidad
- Crear una reserva en un slot libre
- Confirmar que aparece en "Mis reservas"
- Confirmar que el slot aparece ahora como ocupado en el calendario

**Flujo 3 — Conflicto de reserva**
- Con usuario A: reservar Salón X a las 10:00–11:00 el martes
- Con usuario B: intentar reservar el mismo Salón X a las 10:00–11:00 el mismo martes
- Confirmar que usuario B ve un error claro "Horario no disponible"
- Confirmar que la reserva de usuario A no fue afectada

**Flujo 4 — Cancelación**
- Cancelar una reserva propia
- Confirmar que el slot vuelve a aparecer disponible en el calendario
- Confirmar que la reserva aparece como "Cancelada" en la lista

**Flujo 5 — Acceso de administrador**
- Login como ADMIN
- Verificar acceso a todas las secciones del panel de admin
- Crear un nuevo salón
- Ver reservas de todos los profesores
- Cancelar una reserva de otro profesor

**Flujo 6 — Protección de rutas**
- Intentar acceder a `/admin/*` como PROFESOR → debe redirigir
- Intentar acceder sin sesión a `/reservas` → debe redirigir a login
- Intentar acceder a `/api/reservas` sin token → debe retornar 401

### Corrección de bugs de integración
- Documentar cada bug encontrado con: descripción, pasos para reproducir, severidad
- Corregir todos los bugs de severidad alta y media
- Crear issues en GitHub para bugs de severidad baja (post-launch)

### Revisión de diseño vs implementación
- Comparar cada pantalla implementada contra el mockup de Fase 2
- Documentar desviaciones y corregir las que afecten usabilidad
- Revisión de responsividad en mobile (375px), tablet (768px) y desktop (1280px)

## 6.2 Tecnologías involucradas
- Vercel (entorno staging)
- Neon.tech (BD staging)
- Chrome DevTools (responsive testing)

## 6.3 Entregables
- [ ] Deploy funcional en entorno staging
- [ ] Los 6 flujos críticos ejecutados y documentados
- [ ] Flujo 3 (conflicto de reserva) verificado con dos usuarios simultáneos
- [ ] Bugs encontrados documentados con severidad
- [ ] Bugs de alta y media severidad resueltos
- [ ] Revisión de diseño completada y desviaciones corregidas
- [ ] `fase_6_resumen.md`

---

---

# FASE 7 — Testing

> **Duración:** Días 20–21  
> **Roles:** QA Engineer · Ingeniero Fullstack Senior  
> **Objetivo:** Escribir y ejecutar la suite de tests automatizados que protegerá el sistema contra regresiones futuras. El foco está en los flujos críticos: creación de reservas y prevención de conflictos.

---

## 7.1 Tareas

### Tests unitarios (Vitest)
Completar y expandir los tests del servicio de reservas iniciados en Fase 4:

```
tests/unit/reservas.service.test.ts
  ✓ crearReserva — slot completamente libre → crea exitosamente
  ✓ crearReserva — slot exactamente ocupado → lanza ConflictoHorarioError
  ✓ crearReserva — solapamiento por inicio (10:30 en reserva 10:00-12:00) → lanza error
  ✓ crearReserva — solapamiento por fin (11:30 en reserva 10:00-12:00) → lanza error
  ✓ crearReserva — slot contenido dentro de otro (11:00-11:30) → lanza error
  ✓ crearReserva — reserva cancelada no bloquea el slot → crea exitosamente
  ✓ cancelarReserva — propia → cambia estado a CANCELADA
  ✓ cancelarReserva — ajena como PROFESOR → lanza ForbiddenError
  ✓ cancelarReserva — ajena como ADMIN → cancela exitosamente

tests/unit/horarios.ts
  ✓ hayConflicto — sin solapamiento → false
  ✓ hayConflicto — solapamiento exacto → true
  ✓ hayConflicto — solapamiento parcial inicio → true
  ✓ hayConflicto — solapamiento parcial fin → true
  ✓ hayConflicto — contenido → true
  ✓ hayConflicto — adyacente (fin == inicio del otro) → false
```

### Tests de integración de API (Vitest + testcontainers o BD de test)
```
tests/integration/api-reservas.test.ts
  ✓ POST /api/reservas — sin sesión → 401
  ✓ POST /api/reservas — body inválido → 400 con detalles Zod
  ✓ POST /api/reservas — slot libre → 201 con reserva creada
  ✓ POST /api/reservas — slot ocupado → 409 con mensaje claro
  ✓ GET /api/reservas — PROFESOR solo ve sus reservas
  ✓ GET /api/reservas — ADMIN ve todas las reservas
  ✓ PUT /api/reservas/:id — cancelar propia → 200
  ✓ PUT /api/reservas/:id — cancelar ajena como PROFESOR → 403
```

### Tests E2E (Playwright)
Flujos críticos automatizados:

```
tests/e2e/flujo-reserva.spec.ts
  ✓ Login exitoso con credenciales válidas
  ✓ Redirección a login sin sesión
  ✓ Flujo completo: navegar sede → salón → reservar → confirmar en mis reservas
  ✓ Conflicto: dos usuarios intentan reservar el mismo slot (race condition simulada)
  ✓ Cancelación: cancelar reserva y verificar que slot queda libre
  ✓ Admin: login como admin y cancelar reserva de otro usuario
```

### Configuración de cobertura
- Configurar Vitest con reporte de coverage
- Objetivo mínimo: 80% de cobertura en `lib/services/`
- Generar reporte de coverage y documentarlo en el resumen

### Integración de tests en CI
- Agregar step de `pnpm test` al workflow de GitHub Actions
- Agregar step de E2E de Playwright (en rama `develop` y `main`)

## 7.2 Tecnologías involucradas
- Vitest (unit + integration)
- Playwright (E2E)
- @prisma/client (test utils)

## 7.3 Entregables
- [ ] Suite de tests unitarios: todos pasando
- [ ] Suite de tests de integración: todos pasando
- [ ] Tests E2E (flujos críticos): todos pasando
- [ ] Cobertura de código ≥ 80% en servicios críticos
- [ ] Tests integrados en GitHub Actions CI
- [ ] Reporte de coverage documentado
- [ ] `fase_7_resumen.md`

---

---

# FASE 8 — Despliegue y Go-Live

> **Duración:** Día 22  
> **Roles:** Ingeniero DevOps · Ingeniero Fullstack Senior  
> **Objetivo:** Desplegar ClassSport en el entorno de producción, ejecutar la validación end-to-end final y declarar el sistema en producción.

---

## 8.1 Tareas

### Preparación de producción
- Configurar BD de producción en Neon.tech (branch `main`)
- Ejecutar migrations en la BD de producción
- Ejecutar seed con datos reales de sedes, bloques y salones
- Crear usuario ADMIN inicial de producción
- Revisar y confirmar todas las variables de entorno de producción en Vercel
- Verificar que `NEXTAUTH_SECRET` es único y seguro para producción

### Merge y deploy
- Hacer merge de `develop` → `main`
- Verificar que GitHub Actions pasa en el PR
- Merge aprobado → Vercel detecta el push y despliega automáticamente
- Monitorear los logs de build en Vercel
- Confirmar que el estado del deploy es "Ready"

### Validación post-deploy
Ejecutar checklist en la URL de producción:

**Funcionalidad core**
- [ ] Login funciona con el usuario ADMIN de producción
- [ ] Las dos sedes aparecen correctamente con sus bloques y salones
- [ ] Un profesor puede registrarse, iniciar sesión y crear una reserva
- [ ] El calendario muestra correctamente los slots ocupados
- [ ] El conflicto de horario retorna error 409 con mensaje claro
- [ ] La cancelación de reserva funciona
- [ ] El panel de admin es accesible solo para ADMIN

**Técnico**
- [ ] Las API Routes responden en menos de 2 segundos
- [ ] La app es responsive en mobile (375px)
- [ ] No hay errores en la consola del navegador
- [ ] Las variables de entorno de producción no están expuestas al cliente

**Lighthouse en producción**
- [ ] Performance ≥ 85
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 85

### Documentación final
- Actualizar `README.md` con URL de producción, stack, instrucciones de desarrollo local
- Crear guía de administración (cómo agregar sedes, bloques, salones)
- Crear guía de usuario para profesores (cómo reservar un salón)
- Documentar proceso de rollback si es necesario

## 8.2 Tecnologías involucradas
- Vercel (deploy de producción)
- Neon.tech (BD de producción)
- GitHub (merge a main)
- Chrome Lighthouse

## 8.3 Entregables
- [ ] Base de datos de producción con datos reales
- [ ] Deploy en producción con estado "Ready" en Vercel
- [ ] Checklist de validación post-deploy completado al 100%
- [ ] Scores de Lighthouse documentados
- [ ] README actualizado con URL de producción
- [ ] Guía de administración entregada al cliente
- [ ] Guía de usuario para profesores entregada
- [ ] URL de producción comunicada al cliente
- [ ] Sistema declarado: **EN PRODUCCIÓN** ✅
- [ ] `fase_8_resumen.md`

---

## Resumen de Stack Tecnológico por Fase

| Fase | Frontend | Backend | BD | DevOps |
|---|---|---|---|---|
| 1 | — | — | Neon (aprovisionamiento) | GitHub, Vercel |
| 2 | Figma, Tailwind (ref) | — | — | — |
| 3 | Next.js, Tailwind, shadcn | Prisma, NextAuth | PostgreSQL (Neon) | GitHub Actions, Vercel |
| 4 | — | API Routes, Zod, Prisma | PostgreSQL, transacciones | — |
| 5 | React, TanStack Query, RHF | — | — | — |
| 6 | Chrome DevTools | — | Neon staging | Vercel staging |
| 7 | — | Vitest, Playwright | BD test | GitHub Actions |
| 8 | — | — | Neon producción | Vercel producción |

---

*Cada fase produce artefactos verificables. Ninguna fase puede comenzar sin que la anterior haya completado sus criterios de salida.*
