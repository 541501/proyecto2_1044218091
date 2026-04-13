# ⚙️ Prompts de Ejecución por Fases — ClassSport
## Sistema de Gestión y Reserva de Salones Universitarios

> **Archivo:** `prompts_ejecucion.md`  
> **Proyecto:** ClassSport  
> **Creado:** Abril 2026  
> **Uso:** Copiar cada prompt completo y pegarlo en una nueva conversación al iniciar cada fase.

---

## ⚠️ Instrucciones de Uso Obligatorias

1. **Adjuntar siempre los 3 documentos de referencia** a la conversación antes de pegar el prompt:
   - `arquitectura.md`
   - `plan_implementacion.md`
   - `estado_ejecucion.md`

2. **Copiar el prompt completo** de la fase correspondiente, sin modificar nada.

3. Cuando el agente indique el **bloque de inicio**, copiarlo y actualizar `estado_ejecucion.md` manualmente.

4. Al finalizar la fase, el agente entregará el contenido del **archivo de resumen** (`fase_X_resumen.md`) — crearlo como archivo independiente.

5. **Regla de oro:** No ejecutar la fase N+1 sin que la fase N esté marcada ✅ Completada en `estado_ejecucion.md`.

---

## Tabla de Prompts

| Prompt | Fase | Skill/Rol | Prerequisito |
|---|---|---|---|
| PROMPT-F1 | Definición y Diseño del Sistema | Arquitecto de Software + PM Técnico | Ninguno |
| PROMPT-F2 | Diseño UX/UI | Diseñador UX/UI Senior | F1 ✅ |
| PROMPT-F3 | Setup del Proyecto | Ingeniero Fullstack Senior + DevOps | F2 ✅ |
| PROMPT-F4 | Desarrollo Backend | Ingeniero Backend Senior | F3 ✅ |
| PROMPT-F5 | Desarrollo Frontend | Ingeniero Frontend Senior | F4 ✅ |
| PROMPT-F6 | Integración y Pruebas Funcionales | Ingeniero Fullstack Senior + QA | F5 ✅ |
| PROMPT-F7 | Testing | QA Engineer + Ingeniero Fullstack | F6 ✅ |
| PROMPT-F8 | Despliegue y Go-Live | Ingeniero DevOps + Fullstack Senior | F7 ✅ |

---

---

# PROMPT-F1 — Definición y Diseño del Sistema

> **Skill:** Arquitecto de Software Senior + Project Manager Técnico  
> **Fase:** 1 — Definición y Diseño del Sistema  
> **Duración estimada:** Días 1–2

---

```
Actúa como Arquitecto de Software Senior y Project Manager Técnico con amplia 
experiencia en sistemas universitarios, SaaS B2B y planificación técnica de 
proyectos fullstack.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — estado actual del proyecto

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Lo primero que debes hacer es generar el bloque de texto exacto y formateado 
para registrar el inicio de la Fase 1 en estado_ejecucion.md. Incluye: 
fecha y hora actual, estado "🔄 En progreso", nombre del prompt (PROMPT-F1) 
y el campo "ejecutado por" como [COMPLETAR]. Hazlo listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 1 del plan_implementacion.md: "Definición y Diseño del 
Sistema". Tu trabajo en esta fase es documental y organizativo — establecer 
la base completa de conocimiento del proyecto antes del primer commit.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas en cada tarea, 
explicando tus decisiones y el porqué de cada entregable.

TAREAS A EJECUTAR (en orden):

1. REQUISITOS FUNCIONALES
   Genera el documento completo de casos de uso de ClassSport:
   - RF-001 al RF-025 numerados, con: nombre, actores, descripción, 
     precondiciones y postcondiciones
   - Cubrir: autenticación, gestión de sedes/bloques/salones, reservas 
     (crear, ver, cancelar), conflictos de horario, administración
   - Reglas de negocio explícitas (ej: "Un salón no puede tener dos reservas 
     activas que se solapen en fecha y horario")

2. REQUISITOS NO FUNCIONALES
   Define y justifica:
   - Rendimiento: tiempo máximo de respuesta aceptable
   - Disponibilidad: SLA esperado
   - Seguridad: qué datos son sensibles y cómo se protegen
   - Usabilidad: soportes de dispositivos y navegadores
   - Escalabilidad: cuántos usuarios concurrentes debe soportar

3. DATOS SEMILLA INICIALES
   Proporciona el contenido sugerido para el archivo prisma/seed.ts 
   con datos realistas para dos sedes universitarias colombianas 
   (puedes usar nombres genéricos como "Sede Norte" y "Sede Sur"), 
   cada una con 3 bloques y cada bloque con 4-6 salones con nombres 
   y capacidades realistas.

4. CHECKLIST DE CUENTAS Y ACCESOS
   Proporciona la lista paso a paso para:
   - Crear cuenta en Neon.tech y aprovisionar el proyecto de BD
   - Crear los 4 branches de Neon (dev, preview, staging, main)
   - Vincular Vercel con GitHub
   Sé específico: qué opciones seleccionar en cada plataforma.

5. VALIDACIÓN DE ARQUITECTURA
   Revisa el arquitectura.md adjunto y confirma:
   - Si la estrategia de triple capa anti-conflictos es correcta y completa
   - Si el schema de Prisma cubre todos los requisitos funcionales definidos
   - Si hay algún gap o riesgo arquitectónico que debas señalar
   - Propón mejoras si las hay, con justificación técnica

CRITERIOS DE SALIDA:
Al finalizar cada tarea, indica explícitamente si el criterio de salida 
correspondiente de la Fase 1 del plan_implementacion.md fue cumplido.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas, genera:

1. El bloque de texto completo para registrar el cierre de la Fase 1 en 
   estado_ejecucion.md: estado ✅ Completada, decisiones tomadas, 
   observaciones y timestamp.

2. El contenido completo del archivo fase_1_resumen.md que incluya:
   - Fecha de ejecución
   - Decisiones técnicas tomadas y su justificación
   - Requisitos funcionales (listado completo RF-001 a RF-025)
   - Requisitos no funcionales definidos
   - Datos semilla: estructura de sedes, bloques y salones
   - Gaps o riesgos identificados en la arquitectura
   - Observaciones finales y recomendaciones para la Fase 2
   - Estado: todos los criterios de salida cumplidos ✅

No menciones ni adelantes la Fase 2 hasta que yo confirme que el 
estado_ejecucion.md y el fase_1_resumen.md han sido actualizados.
```

---

---

# PROMPT-F2 — Diseño UX/UI

> **Skill:** Diseñador UX/UI Senior con experiencia en aplicaciones SaaS y sistemas de reservas  
> **Fase:** 2 — Diseño UX/UI  
> **Duración estimada:** Días 3–6  
> **Prerequisito:** Fase 1 ✅ Completada

---

```
Actúa como Diseñador UX/UI Senior especializado en aplicaciones SaaS de 
gestión, con criterio estético refinado y enfoque en usabilidad funcional. 
Tienes experiencia diseñando sistemas de reservas, calendarios y dashboards.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 1 está ✅ Completada. Si no lo 
   está, detente e indícame que debo completar la Fase 1 primero.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 2 en 
estado_ejecucion.md con: fecha y hora, estado "🔄 En progreso", 
nombre del prompt PROMPT-F2. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 2 del plan: "Diseño UX/UI". Diseñar la experiencia completa 
de ClassSport con foco en claridad, eficiencia y prevención de errores. 
El flujo de reserva de salón es el núcleo — debe ser impecable.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, justificando cada 
decisión de diseño.

TAREAS A EJECUTAR (en orden):

1. MAPA DE SITIO COMPLETO
   Genera el mapa de sitio de ClassSport en formato árbol de texto, 
   incluyendo todas las rutas definidas en arquitectura.md, con indicación 
   de qué páginas requieren autenticación y qué páginas son solo para ADMIN.

2. FLUJOS DE USUARIO (User Flows)
   Documenta en formato de pasos numerados los 5 flujos críticos:
   - Flujo 1: Profesor nuevo → registro → dashboard
   - Flujo 2: Profesor → buscar salón disponible → crear reserva
   - Flujo 3: Profesor → ver mis reservas → cancelar una
   - Flujo 4: Intento de reserva en slot ocupado → manejo del error
   - Flujo 5: Admin → ver todas las reservas y cancelar una

3. SISTEMA DE DISEÑO
   Define el sistema de diseño completo para ClassSport:
   
   a) PALETA DE COLORES (con códigos hex y su uso):
      - Color primario (identidad de ClassSport)
      - Color secundario
      - Colores semánticos: éxito, error, advertencia, info
      - Escala de grises (6 tonos mínimo)
      - ESTADOS DE HORARIOS: libre, ocupado, seleccionado, propio
   
   b) TIPOGRAFÍA:
      - Familia de fuente (justificada para un sistema universitario formal)
      - Escala de tamaños (xs, sm, base, lg, xl, 2xl, 3xl)
      - Pesos usados y para qué contexto
   
   c) ESPACIADO Y LAYOUT:
      - Sistema de espaciado base (4px o 8px)
      - Breakpoints responsivos
      - Ancho máximo del contenido
   
   d) COMPONENTES CLAVE — describe visualmente:
      - TarjetaSalon: qué información muestra y cómo
      - CalendarioSalon: layout de la grilla de slots horarios
      - SelectorHorario: cómo se ve un slot libre vs ocupado
      - FormularioReserva: estructura de los 3 pasos
      - Badges de estado de reserva
      - Toast notifications (éxito y error)

4. WIREFRAMES EN TEXTO (ASCII / descripción estructurada)
   Para cada pantalla principal, describe la estructura de layout con 
   indicación de componentes y su disposición:
   - Login
   - Dashboard (vista de hoy)
   - Vista de sede con bloques
   - Salón individual con CalendarioSalon
   - Formulario de nueva reserva (paso a paso)
   - Mis reservas
   - Panel de admin (vista principal)

5. ESPECIFICACIÓN TAILWIND
   Genera el bloque de configuración completo para tailwind.config.ts 
   que incluya los tokens de color, tipografía y breakpoints definidos 
   en el sistema de diseño. Este archivo debe poder copiarse directamente 
   al proyecto en Fase 3.

6. ESPECIFICACIÓN DE VARIABLES CSS
   Genera el bloque de variables CSS para app/globals.css que defina 
   todos los tokens del sistema de diseño (colores, radios, shadows, etc.)

CRITERIOS DE SALIDA:
Al finalizar cada tarea, verifica explícitamente el criterio de salida 
correspondiente de la Fase 2 del plan_implementacion.md.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas, genera:

1. El bloque de texto completo para registrar el cierre de la Fase 2 en 
   estado_ejecucion.md: estado ✅ Completada, decisiones de diseño más 
   importantes, observaciones y timestamp.

2. El contenido completo del archivo fase_2_resumen.md con:
   - Fecha de ejecución
   - Mapa de sitio completo
   - Sistema de diseño documentado (colores, tipografía, espaciado)
   - Especificación de estados visuales de horarios
   - Wireframes de todas las pantallas
   - tailwind.config.ts listo para copiar
   - Variables CSS listas para copiar
   - Decisiones de diseño clave y su justificación
   - Criterios de salida verificados ✅

No menciones ni adelantes la Fase 3 hasta que confirme que ambos 
archivos fueron actualizados.
```

---

---

# PROMPT-F3 — Setup del Proyecto

> **Skill:** Ingeniero Fullstack Senior + Ingeniero DevOps  
> **Fase:** 3 — Setup del Proyecto  
> **Duración estimada:** Días 7–8  
> **Prerequisito:** Fase 2 ✅ Completada

---

```
Actúa como Ingeniero Fullstack Senior y Ingeniero DevOps con especialización 
en Next.js 14, TypeScript estricto, Prisma ORM, PostgreSQL en Neon.tech y 
pipelines CI/CD con GitHub Actions y Vercel.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 2 está ✅ Completada. 
   Si no lo está, detente e indícame que debo completar la Fase 2 primero.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 3 en 
estado_ejecucion.md. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 3 del plan: "Setup del Proyecto". Al final de esta fase 
el proyecto debe estar en GitHub con TypeScript corriendo limpio, la BD 
de desarrollo con datos semilla, NextAuth funcionando y el pipeline CI/CD 
activo en Vercel.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, justificando cada 
decisión de configuración.

TAREAS A EJECUTAR (en orden):

1. INICIALIZACIÓN DEL PROYECTO
   Dame el comando exacto pnpm create next-app con las flags correctas.
   Luego dame los comandos de instalación de TODAS las dependencias 
   del stack (producción y desarrollo) en una sola instrucción pnpm.

2. ARCHIVOS DE CONFIGURACIÓN — entrega el contenido completo de:
   a) tsconfig.json (strict mode, paths aliases de arquitectura.md)
   b) .eslintrc.json (con reglas @typescript-eslint del plan)
   c) .prettierrc (con plugin tailwindcss)
   d) next.config.ts
   e) tailwind.config.ts (usando tokens del fase_2_resumen.md)
   f) package.json — solo el bloque "scripts" completo
   g) .gitignore completo para este stack
   h) .env.example con todas las variables de arquitectura.md

3. PRISMA — entrega:
   a) prisma/schema.prisma completo (exactamente el de arquitectura.md)
   b) lib/prisma.ts con el singleton serverless
   c) Los comandos exactos para ejecutar la migración inicial
   d) prisma/seed.ts completo usando los datos definidos en fase_1_resumen.md
   e) El comando para ejecutar el seed

4. NEXTAUTH — entrega el contenido completo de:
   a) lib/auth.ts con configuración del provider credentials
   b) app/api/auth/[...nextauth]/route.ts
   c) middleware.ts con protección de rutas y lógica de rol ADMIN
   d) lib/types/index.ts con los tipos extendidos de NextAuth session

5. ESTRUCTURA DE CARPETAS
   Dame los comandos bash para crear toda la estructura de carpetas y 
   archivos placeholder definida en arquitectura.md en una sola ejecución.

6. CI/CD — entrega el contenido completo de:
   a) .github/workflows/ci.yml (typecheck + lint + build)
   b) Instrucciones paso a paso para vincular el proyecto en Vercel
   c) Lista exacta de variables de entorno a configurar en Vercel por entorno

7. VERIFICACIÓN COMPLETA
   Dame la secuencia de comandos de verificación y el resultado esperado:
   - pnpm typecheck → sin errores
   - pnpm lint → sin warnings
   - pnpm build → build exitoso
   - Cómo verificar que NextAuth funciona (login de prueba)
   - Cómo verificar que la BD tiene los datos semilla

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist completo de la Fase 3 del plan.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas, genera:

1. Bloque de texto para registrar cierre en estado_ejecucion.md: 
   estado ✅ Completada, decisiones tomadas, hash del primer commit, 
   URL del repositorio, URL de preview de Vercel.

2. Contenido completo de fase_3_resumen.md con:
   - Fecha de ejecución
   - Versiones exactas del stack instalado
   - Lista de todos los archivos de configuración creados
   - Schema de Prisma aplicado y primera migration ejecutada
   - Resultado de pnpm typecheck, pnpm lint, pnpm build
   - URL del repositorio GitHub
   - URL de deploy preview en Vercel
   - Problemas encontrados y resoluciones
   - Criterios de salida verificados ✅
```

---

---

# PROMPT-F4 — Desarrollo Backend

> **Skill:** Ingeniero Backend Senior especializado en TypeScript, APIs REST y PostgreSQL  
> **Fase:** 4 — Desarrollo Backend  
> **Duración estimada:** Días 9–13  
> **Prerequisito:** Fase 3 ✅ Completada

---

```
Actúa como Ingeniero Backend Senior con especialización en TypeScript estricto, 
Next.js API Routes serverless, Prisma ORM, transacciones PostgreSQL y diseño 
de APIs REST seguras y robustas. Eres el responsable de la lógica de negocio 
más crítica del sistema: el bloqueo de reservas sin conflictos.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 3 está ✅ Completada. 
   Si no lo está, detente e indícame que debo completar la Fase 3 primero.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 4 en 
estado_ejecucion.md. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 4 del plan: "Desarrollo Backend". Al final de esta fase 
la API REST de ClassSport debe estar 100% funcional y verificable via 
curl/Postman, incluyendo la lógica de bloqueo atómico de reservas.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, explicando especialmente 
las decisiones de seguridad y la lógica anti-conflictos.

TAREAS A EJECUTAR (en orden):

1. UTILIDADES DEL SERVIDOR
   Entrega el contenido completo de:
   a) lib/utils/errores.ts — función handleApiError(e) que mapea errores 
      de Prisma (P2002→409, P2025→404, etc.) a NextResponse con el formato 
      { error: string, code: string, status: number }
   b) lib/utils/horarios.ts — función hayConflicto(reservas, horaInicio, 
      horaFin) que detecta solapamientos correctamente (incluyendo casos 
      borde: adyacentes no son conflicto, contenidos sí)
   c) lib/utils/auth.ts — función verificarSesion(req) y verificarAdmin(req) 
      que retornan la sesión o lanzan NextResponse de 401/403

2. VALIDACIONES ZOD — entrega el contenido completo de:
   a) lib/validations/reserva.schema.ts — CrearReservaSchema con validación 
      de horaFin > horaInicio, fecha no pasada, campos requeridos
   b) lib/validations/sede.schema.ts
   c) lib/validations/usuario.schema.ts — con validación de email y 
      password (mínimo 8 caracteres)
   d) Función utilitaria validarBody<T>(schema, body) que retorna 
      NextResponse 400 con detalles de Zod si falla

3. SERVICIO DE RESERVAS (LÓGICA CRÍTICA)
   Entrega el contenido completo de lib/services/reservas.service.ts con:
   a) crearReserva(datos, usuarioId) — implementación completa con:
      - Transacción Prisma con $transaction
      - SELECT de reservas existentes con bloqueo pesimista (raw query si 
        Prisma no soporta FOR UPDATE natively)
      - Verificación de solapamiento usando hayConflicto()
      - Lanzar ConflictoHorarioError si hay conflicto
      - INSERT atómico si no hay conflicto
   b) listarReservasUsuario(usuarioId, filtros)
   c) listarTodasReservas(filtros) — solo para ADMIN
   d) cancelarReserva(reservaId, usuarioId, esAdmin)
   e) obtenerDisponibilidad(salonId, fecha)
   
   Define también las clases de error personalizadas: ConflictoHorarioError, 
   ForbiddenError, NotFoundError.

4. API ROUTES — entrega el contenido completo de cada archivo:
   a) app/api/sedes/route.ts (GET lista, POST crear)
   b) app/api/sedes/[sedeId]/route.ts (GET, PUT, DELETE)
   c) app/api/salones/route.ts (GET con filtros)
   d) app/api/salones/[salonId]/route.ts (GET detalle)
   e) app/api/salones/[salonId]/disponibilidad/route.ts (GET por fecha)
   f) app/api/reservas/route.ts (GET lista, POST crear — usa el servicio)
   g) app/api/reservas/[reservaId]/route.ts (GET, PUT cancelar)
   
   Para cada endpoint, incluye: verificación de sesión, validación de body 
   con Zod, llamada al servicio y manejo de errores con handleApiError.

5. TESTS UNITARIOS
   Entrega el contenido completo de:
   a) tests/unit/horarios.test.ts — todos los casos de hayConflicto
   b) tests/unit/reservas.service.test.ts — todos los casos listados 
      en la Fase 7 del plan (pero escritos ahora, ejecutados en Fase 7)

6. DOCUMENTACIÓN DE API
   Genera una tabla markdown con todos los endpoints:
   Método | Ruta | Auth requerida | Rol mínimo | Body (si aplica) | 
   Respuesta éxito | Posibles errores

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist de la Fase 4 y verifica con los 
comandos curl del plan que los endpoints responden correctamente.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas, genera:

1. Bloque para registrar cierre en estado_ejecucion.md: estado ✅ Completada,
   decisiones técnicas de la lógica anti-conflictos, endpoints implementados.

2. Contenido completo de fase_4_resumen.md con:
   - Fecha de ejecución
   - Estrategia de bloqueo atómico implementada (las 3 capas)
   - Lista completa de endpoints con su estado
   - Tabla de errores mapeados (Prisma → HTTP)
   - Resultado de tests unitarios de horarios
   - Decisiones técnicas tomadas y su justificación
   - Problemas encontrados y resoluciones
   - Criterios de salida verificados ✅
```

---

---

# PROMPT-F5 — Desarrollo Frontend

> **Skill:** Ingeniero Frontend Senior + Diseñador UX/UI (revisión)  
> **Fase:** 5 — Desarrollo Frontend  
> **Duración estimada:** Días 14–17  
> **Prerequisito:** Fase 4 ✅ Completada

---

```
Actúa como Ingeniero Frontend Senior con especialización en React 18, 
Next.js 14 App Router, TypeScript estricto, Tailwind CSS, shadcn/ui, 
TanStack Query y React Hook Form. Tienes también criterio de Diseñador UX/UI 
para asegurar que la implementación es fiel a los mockups y tiene alta 
usabilidad. El componente CalendarioSalon y el flujo de reserva son tu 
responsabilidad más importante.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 4 está ✅ Completada. 
   Si no lo está, detente e indícame que debo completar la Fase 4 primero.
   Además lee las decisiones de diseño documentadas en las fases anteriores.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 5 en 
estado_ejecucion.md. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 5 del plan: "Desarrollo Frontend". Implementar toda la 
interfaz de ClassSport, consumiendo la API de la Fase 4, siguiendo el sistema 
de diseño de la Fase 2. Prioridad máxima: CalendarioSalon y el flujo de 
nueva reserva.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, justificando decisiones 
de componentes (Server vs Client), manejo de estado y UX.

TAREAS A EJECUTAR (en orden de prioridad):

1. PROVIDERS Y CONFIGURACIÓN GLOBAL
   Entrega el contenido completo de:
   a) app/layout.tsx — Root layout con SessionProvider de NextAuth y 
      QueryClientProvider de TanStack Query
   b) lib/query-client.ts — configuración del QueryClient
   c) app/(dashboard)/layout.tsx — layout con Sidebar, Header, área de 
      contenido principal

2. COMPONENTES DE LAYOUT
   Entrega el contenido completo de:
   a) components/layout/Sidebar.tsx — navegación: Dashboard, Sedes, 
      Mis Reservas, Admin (condicional por rol). Activo según ruta.
   b) components/layout/Header.tsx — nombre de usuario, avatar inicial, 
      dropdown con logout
   c) components/layout/MobileNav.tsx — bottom navigation para mobile

3. PÁGINAS DE AUTENTICACIÓN
   Entrega el contenido completo de:
   a) app/(auth)/login/page.tsx — formulario con RHF + Zod, manejo de 
      error de credenciales, link a registro
   b) app/(auth)/registro/page.tsx — formulario completo con validación

4. COMPONENTE CRÍTICO: CalendarioSalon
   Entrega el contenido completo de 
   components/reservas/CalendarioSalon.tsx:
   - Props: salonId, fecha seleccionada, onSlotSelect callback
   - Grilla de slots de 1 hora de 7:00 a 22:00
   - React Query: GET /api/salones/:id/disponibilidad?fecha=X
   - Slot libre: verde claro, clickeable, hover effect
   - Slot ocupado: gris, no clickeable, tooltip con nombre de clase
   - Slot seleccionado: azul, borde resaltado
   - Slot propio (del usuario actual): azul claro diferenciado
   - Loading state: skeleton de la grilla
   - Navegación de días: botones ← Anterior | Fecha | Siguiente →
   - Revalidación automática cada 60 segundos

5. COMPONENTE CRÍTICO: FormularioReserva
   Entrega el contenido completo de:
   a) app/(dashboard)/reservas/nueva/page.tsx — página de nueva reserva
   b) components/reservas/FormularioReserva.tsx — formulario en 3 pasos:
      - Paso 1: Selector de sede → bloque → salón (dropdowns en cascada)
      - Paso 2: Selector de fecha + CalendarioSalon integrado
      - Paso 3: Nombre de clase, descripción, botón confirmar
      - Manejo del error 409: toast "Ese horario acaba de ser reservado" 
        + refresco automático del calendario
      - Optimistic update al confirmar
      - Validación con React Hook Form + Zod

6. DASHBOARD Y VISTAS DE SEDES
   Entrega el contenido completo de:
   a) app/(dashboard)/page.tsx — Dashboard: resumen del día, 
      mis reservas de hoy, acceso rápido a nueva reserva
   b) app/(dashboard)/sedes/page.tsx — grid de las dos sedes
   c) app/(dashboard)/sedes/[sedeId]/page.tsx — detalle de sede con 
      bloques y sus salones en grid
   d) components/salones/TarjetaSalon.tsx — muestra nombre, capacidad 
      y disponibilidad actual del salón

7. MIS RESERVAS
   Entrega el contenido completo de:
   a) app/(dashboard)/reservas/page.tsx — lista de mis reservas con 
      filtro por fecha y estado
   b) components/reservas/TarjetaReserva.tsx — muestra datos de la 
      reserva, estado badge, botón cancelar con modal de confirmación

8. PANEL DE ADMINISTRACIÓN
   Entrega el contenido completo de:
   a) app/(dashboard)/admin/page.tsx — métricas: total reservas hoy, 
      salones ocupados ahora, lista de reservas recientes
   b) app/(dashboard)/admin/salones/page.tsx — CRUD de sedes, bloques 
      y salones con formularios modales

9. ESTADOS GLOBALES DE UI
   Entrega el contenido completo de:
   a) components/common/LoadingSpinner.tsx
   b) components/common/EmptyState.tsx — con ilustración y CTA contextual
   c) app/(dashboard)/loading.tsx — skeleton screens del dashboard
   d) app/(dashboard)/error.tsx — página de error con botón retry

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist de la Fase 5. Verifica explícitamente 
que pnpm typecheck, pnpm lint y pnpm build pasan sin errores.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas, genera:

1. Bloque para registrar cierre en estado_ejecucion.md: estado ✅ Completada,
   componentes implementados, decisiones de Server vs Client Components tomadas.

2. Contenido completo de fase_5_resumen.md con:
   - Fecha de ejecución
   - Lista de componentes implementados (Server vs Client)
   - Descripción del flujo de reserva y su manejo de errores
   - Estrategia de estado con TanStack Query (qué se cachea, qué se invalida)
   - Decisiones de UX tomadas
   - Resultado de pnpm typecheck, lint y build
   - Problemas encontrados y resoluciones
   - Criterios de salida verificados ✅
```

---

---

# PROMPT-F6 — Integración y Pruebas Funcionales

> **Skill:** Ingeniero Fullstack Senior + QA Engineer  
> **Fase:** 6 — Integración y Pruebas Funcionales  
> **Duración estimada:** Días 18–19  
> **Prerequisito:** Fase 5 ✅ Completada

---

```
Actúa como Ingeniero Fullstack Senior y QA Engineer con experiencia en 
testing de sistemas de reservas, detección de bugs de integración 
frontend-backend y validación de flujos críticos en entornos de staging.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 5 está ✅ Completada.
   Lee el historial de todas las fases anteriores para contexto.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 6 en 
estado_ejecucion.md. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 6 del plan: "Integración y Pruebas Funcionales". Conectar 
frontend y backend en staging, ejecutar los 6 flujos críticos y documentar 
todos los hallazgos.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, siendo meticuloso con 
cada caso de prueba, especialmente el Flujo 3 (race condition).

TAREAS A EJECUTAR (en orden):

1. CHECKLIST DE DEPLOY EN STAGING
   Proporciona la secuencia exacta de comandos y pasos para:
   a) Hacer merge de todas las fases a la rama `develop`
   b) Configurar la BD de Neon branch `staging` (migrate + seed)
   c) Configurar variables de entorno de staging en Vercel
   d) Forzar un deploy de staging y verificar el estado "Ready"

2. GUÍA DE EJECUCIÓN DE FLUJOS CRÍTICOS
   Para cada uno de los 6 flujos del plan_implementacion.md Fase 6, 
   genera una guía de ejecución con:
   - Pasos exactos numerados
   - Qué cuenta de usuario usar (crear las cuentas necesarias)
   - Qué resultado exacto esperar en cada paso
   - Qué capturas de pantalla / evidencias tomar
   - Cómo determinar si el flujo pasó ✅ o falló ❌

   Presta especial atención al Flujo 3 (conflicto de reserva): 
   explica cómo simular dos usuarios intentando reservar el mismo 
   slot (dos ventanas de browser, dos sesiones diferentes).

3. PLANTILLA DE REPORTE DE BUGS
   Genera la plantilla markdown que debo usar para documentar 
   cada bug encontrado:
   - ID, Título, Severidad (Alta/Media/Baja)
   - Pasos para reproducir
   - Resultado obtenido vs esperado
   - Captura o log relevante
   - Componente afectado (Frontend/Backend/BD)
   - Estado (Abierto/En progreso/Resuelto)

4. CHECKLIST DE REVISIÓN DE DISEÑO
   Genera el checklist de revisión UI vs mockups para cada 
   pantalla principal, con criterios específicos a verificar:
   - Colores correctos
   - Tipografía correcta
   - Espaciado correcto
   - Comportamiento responsive (375px, 768px, 1280px)
   - Estados de loading y error presentes

5. ANÁLISIS DE BUGS COMUNES EN INTEGRACIÓN
   Lista los 10 bugs más frecuentes en sistemas de reservas 
   Next.js + Prisma + React Query, con cómo detectarlos y cómo 
   resolverlos. Esto me ayuda a saber qué buscar activamente.

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist de la Fase 6 del plan.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar, genera:

1. Bloque para registrar cierre en estado_ejecucion.md: estado ✅ Completada,
   resumen de flujos ejecutados, bugs encontrados y su severidad, 
   decisiones tomadas para resolver bloquers.

2. Contenido completo de fase_6_resumen.md con:
   - Fecha de ejecución
   - URL del entorno de staging
   - Resultado de cada uno de los 6 flujos (✅ / ❌ con descripción)
   - Lista de bugs encontrados con severidad y estado de resolución
   - Resultado de la revisión de diseño
   - Decisiones tomadas para manejar los bugs encontrados
   - Criterios de salida verificados ✅
```

---

---

# PROMPT-F7 — Testing

> **Skill:** QA Engineer Senior + Ingeniero Fullstack  
> **Fase:** 7 — Testing  
> **Duración estimada:** Días 20–21  
> **Prerequisito:** Fase 6 ✅ Completada

---

```
Actúa como QA Engineer Senior especializado en testing de TypeScript, Vitest, 
testing de APIs REST y Playwright para E2E de flujos de reservas y calendarios. 
Tu responsabilidad es garantizar que el sistema ClassSport no puede tener 
regresiones en el flujo de reservas y que la lógica anti-conflictos es 
indestructible.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 6 está ✅ Completada.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 7 en 
estado_ejecucion.md. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 7 del plan: "Testing". Escribir y ejecutar la suite de 
tests automatizados completa. Foco en la lógica de conflictos de reserva 
y los flujos críticos de usuario.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, explicando qué 
riesgo cubre cada test.

TAREAS A EJECUTAR (en orden):

1. CONFIGURACIÓN DE VITEST
   Entrega el contenido completo de:
   a) vitest.config.ts — con configuración para Next.js y Prisma mocking
   b) tests/setup.ts — setup global de tests (mocks de Prisma, NextAuth)
   c) Comandos para ejecutar tests: unitarios, integración, coverage

2. TESTS UNITARIOS COMPLETOS — entrega el contenido de:
   a) tests/unit/horarios.test.ts — todos los casos de hayConflicto 
      incluyendo: sin solapamiento, exacto, parcial inicio, parcial fin, 
      contenido, adyacente (borde: NO debe ser conflicto)
   b) tests/unit/reservas.service.test.ts — todos los casos listados 
      en Fase 7 del plan (con Prisma mockeado via vi.mock)
   c) tests/unit/errores.test.ts — mapeo de errores Prisma a HTTP

3. TESTS DE INTEGRACIÓN DE API — entrega el contenido de:
   tests/integration/api-reservas.test.ts con todos los casos listados 
   en Fase 7 del plan. Usa una estrategia realista para la BD de tests 
   (puede ser mock de Prisma o BD en memoria según tu preferencia justificada).

4. TESTS E2E CON PLAYWRIGHT — entrega el contenido completo de:
   a) playwright.config.ts — configuración para el entorno de staging
   b) tests/e2e/auth.spec.ts — login exitoso, fallo de login, 
      redirección sin sesión
   c) tests/e2e/flujo-reserva.spec.ts — flujo completo de reserva, 
      cancelación, y el caso de conflicto (dos páginas paralelas)
   d) tests/e2e/admin.spec.ts — acceso de admin, restricción de PROFESOR

5. CONFIGURACIÓN DE COVERAGE
   a) Configurar Vitest con reporte de coverage (v8 o istanbul)
   b) Script en package.json: "test:coverage"
   c) Criterio mínimo: 80% en lib/services/

6. CI INTEGRATION
   Entrega el contenido actualizado de .github/workflows/ci.yml 
   que incluya los steps de tests unitarios y el workflow separado 
   para E2E de Playwright.

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist de la Fase 7. Dame los resultados 
esperados de la ejecución de todos los tests.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar, genera:

1. Bloque para registrar cierre en estado_ejecucion.md: estado ✅ Completada,
   total de tests escritos, coverage alcanzado, decisiones de testing.

2. Contenido completo de fase_7_resumen.md con:
   - Fecha de ejecución
   - Total de tests unitarios: N pasando / N fallando
   - Total de tests de integración: N pasando / N fallando
   - Total de tests E2E: N pasando / N fallando
   - Porcentaje de coverage en lib/services/
   - Tests más importantes y qué riesgo cubren
   - Estrategia de mocking elegida y su justificación
   - Criterios de salida verificados ✅
```

---

---

# PROMPT-F8 — Despliegue y Go-Live

> **Skill:** Ingeniero DevOps Senior + Ingeniero Fullstack Senior  
> **Fase:** 8 — Despliegue y Go-Live  
> **Duración estimada:** Día 22  
> **Prerequisito:** Fase 7 ✅ Completada

---

```
Actúa como Ingeniero DevOps Senior e Ingeniero Fullstack con experiencia 
en go-live de aplicaciones Next.js en Vercel, gestión de bases de datos 
PostgreSQL en Neon.tech en producción y validación post-deploy de sistemas 
críticos de reservas universitarias.

DOCUMENTOS DE REFERENCIA OBLIGATORIOS:
Lee los tres documentos adjuntos COMPLETAMENTE antes de responder:
1. arquitectura.md — arquitectura técnica del proyecto ClassSport
2. plan_implementacion.md — plan de implementación por fases
3. estado_ejecucion.md — verifica que Fase 7 está ✅ Completada.
   Lee TODO el historial de ejecución para tener el contexto completo 
   del proyecto antes de declararlo listo para producción.

ACCIÓN INMEDIATA — REGISTRO DE INICIO:
Genera el bloque de texto exacto para registrar el inicio de la Fase 8 en 
estado_ejecucion.md. Listo para copiar y pegar.

OBJETIVO:
Ejecutar la Fase 8 del plan: "Despliegue y Go-Live". Llevar ClassSport a 
producción de forma segura, validar el sistema end-to-end en la URL pública 
y declarar el proyecto en producción.

DESCRIBE LO QUE ESTÁS HACIENDO a medida que avanzas, siendo meticuloso 
en cada paso de producción — un error aquí afecta a usuarios reales.

TAREAS A EJECUTAR (en orden):

1. CHECKLIST PRE-DEPLOY DE PRODUCCIÓN
   Genera el checklist completo que debo verificar ANTES del merge a main:
   - BD de producción configurada y con datos reales
   - Variables de entorno de producción en Vercel verificadas
   - NEXTAUTH_SECRET único y generado con openssl
   - Todos los tests de Fase 7 pasando
   - pnpm validate limpio en la rama develop
   - PR de develop → main con CI en verde

2. COMANDOS DE SETUP DE BD DE PRODUCCIÓN
   Dame la secuencia exacta de comandos para:
   a) Ejecutar migrations en la BD de producción de Neon
   b) Ejecutar el seed con datos reales
   c) Crear el usuario ADMIN inicial de producción
   d) Verificar que los datos están correctos con queries de verificación

3. PROCESO DE MERGE Y DEPLOY
   Dame los comandos Git exactos para el merge final y los pasos 
   para monitorear el deploy en Vercel. Incluye: cómo interpretar 
   los logs de build, cuánto tiempo esperar, cómo verificar el 
   estado "Ready".

4. CHECKLIST DE VALIDACIÓN POST-DEPLOY
   Genera el checklist completo de validación en producción con:
   - Para cada punto: qué hacer, qué resultado esperar, cómo marcarlo ✅
   - Incluir: funcionalidad core, seguridad, performance, responsividad
   - Los comandos curl exactos para probar los endpoints de producción

5. GUÍA LIGHTHOUSE
   Pasos exactos para ejecutar Lighthouse en Chrome DevTools 
   sobre la URL de producción, con la configuración correcta y 
   cómo interpretar los scores.

6. DOCUMENTACIÓN FINAL DEL PROYECTO — entrega:
   a) README.md completo y definitivo con:
      - Badge de deploy de Vercel (con placeholder de URL)
      - Descripción del proyecto ClassSport
      - Stack tecnológico
      - Instrucciones de instalación y desarrollo local (paso a paso)
      - Comandos disponibles y su propósito
      - Estructura del proyecto
      - Descripción de la arquitectura de datos
      - Variables de entorno requeridas
      - URL de producción
   b) Guía de administración (cómo agregar sedes, bloques, salones)
   c) Guía de usuario para profesores (cómo reservar un salón)

7. PLAN DE ROLLBACK
   Define el plan de rollback en caso de fallo crítico en producción:
   - Cuándo hacer rollback vs cuándo hacer hotfix
   - Cómo hacer rollback en Vercel
   - Cómo hacer rollback de la BD (consideraciones con Neon branching)

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist completo de la Fase 8 del plan. 
Declara explícitamente si el sistema cumple todos los criterios para 
ser considerado en producción.

ACCIÓN FINAL — REGISTRO DE CIERRE Y DECLARACIÓN DE PRODUCCIÓN:
Al completar, genera:

1. Bloque para registrar cierre de la Fase 8 en estado_ejecucion.md: 
   estado ✅ Completada, URL de producción, fecha de go-live, 
   scores de Lighthouse, commit de deploy final.

2. Actualización del panel de control general del estado_ejecucion.md: 
   TODAS las fases ✅ Completadas, progreso 100%.

3. Contenido completo de fase_8_resumen.md con:
   - Fecha de go-live
   - URL de producción definitiva
   - Commit hash del deploy de producción
   - Resultado del checklist de validación post-deploy (cada ítem)
   - Scores de Lighthouse (Performance, Accessibility, Best Practices, SEO)
   - Tiempos de respuesta de los endpoints principales
   - Problemas encontrados en producción y resoluciones
   - Plan de rollback documentado
   - Criterios de salida verificados ✅

4. Mensaje de cierre del proyecto:
   - Resumen ejecutivo de ClassSport en producción
   - Stack completo con versiones definitivas
   - URL de producción y repositorio GitHub
   - Próximas funcionalidades recomendadas (backlog sugerido)
   - Fecha y estado: CLASSSPORT EN PRODUCCIÓN ✅
```

---

---

## 📎 Archivos de resumen generados por fase

```
fase_1_resumen.md  ← Definición del sistema y requisitos
fase_2_resumen.md  ← Sistema de diseño y wireframes
fase_3_resumen.md  ← Setup del proyecto y CI/CD
fase_4_resumen.md  ← API REST y lógica de reservas
fase_5_resumen.md  ← Interfaz completa
fase_6_resumen.md  ← Integración y pruebas funcionales
fase_7_resumen.md  ← Suite de tests
fase_8_resumen.md  ← Deploy y go-live
```

---

*Usar cada prompt completo en una conversación nueva con los 3 documentos de referencia adjuntos. El orden de ejecución es obligatorio.*
