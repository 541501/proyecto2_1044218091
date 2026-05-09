# PROMPTS DE IMPLEMENTACIÓN — ClassSport
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_CLASSSPORT.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_CLASSSPORT.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_CLASSSPORT.md
2. Leer doc/ESTADO_EJECUCION_CLASSSPORT.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer doc/PLAN_CLASSSPORT.md
y crear el archivo doc/ESTADO_EJECUCION_CLASSSPORT.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, persistencia y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de la primera experiencia visual del usuario en sistemas institucionales.

Tu mentalidad: ClassSport es una herramienta que los profesores y coordinadores
van a usar varias veces al día para gestionar espacios físicos de la institución.
La arquitectura de persistencia no es negociable: dataService como único punto
de acceso, blobAudit como módulo interno, tokens lazy, cero caché en memoria,
headers no-store en toda la cadena. El login transmite seriedad institucional —
es una herramienta corporativa universitaria, no una app casual.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CLASSSPORT.md — secciones 8 (stack y variables de entorno),
   9 (reglas de oro de persistencia), 10 (estructura de data/seed.json —
   nota que el seed incluye admin, 3 bloques, 6 franjas horarias y 4 salones
   de demo), 11 (estructura interna de lib/), 13 (implementación de blobAudit
   con withFileLock y getBlobToken lazy) y 17 (identidad visual del login —
   fondo azul oscuro, tarjeta blanca, logo de edificio académico)
2. doc/ESTADO_EJECUCION_CLASSSPORT.md — registra el inicio de la Fase 1

El plan tiene todo lo que necesitas: SQL de la migration 0001, la estructura
exacta del seed.json, las funciones de auth.ts, el patrón de withAuth y
withRole y la especificación visual completa del login.

Puntos críticos que no puedes ignorar:

— ClassSport no tiene registro público. Los usuarios no pueden crear su propia
  cuenta. El login no tiene link de "Crear cuenta" — los usuarios los crea
  el administrador. Esto es diferente a FlowMind y CampusZen donde sí hay
  registro público. El formulario de login solo tiene correo, contraseña y
  el botón "Ingresar".

— El seedReader debe exponer los 3 bloques, las 6 franjas y los 4 salones
  del seed.json además del usuario admin. En modo seed, el sistema puede
  mostrar esa información estática para que el admin pueda navegar antes del
  bootstrap y entender la estructura del sistema.

— El token de Blob se accede siempre con getBlobToken() como función lazy,
  nunca como constante de módulo. Si lo defines como const TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN al nivel del módulo, fallará en
  build time porque las variables de entorno no existen en ese momento.

— La auditoría usa get() del SDK de @vercel/blob, nunca fetch(url). Los
  blobs privados devuelven 401 silencioso con fetch — el error nunca aparece.

— withFileLock serializa escrituras al mismo archivo de auditoría dentro
  de la misma instancia. Sin él, dos reservas creadas simultáneamente pueden
  corromper el archivo de auditoría mensual.

— dataService.ts es el ÚNICO archivo que importa supabase.ts y blobAudit.ts.
  Ninguna API Route ni componente importa esos módulos directamente.

— El error de login es siempre genérico: "Correo o contraseña incorrectos".

— Cookie de sesión: HttpOnly, Secure, SameSite=Strict. Nunca localStorage.

— La identidad visual del login no es opcional: fondo azul oscuro #0F172A
  con patrón geométrico, tarjeta blanca con borde superior azul institucional,
  logo SVG de edificio académico estilizado, animación Framer Motion. El plan
  describe todo esto en la sección 17.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → /api/system/mode retorna 'seed' → cookie
  HttpOnly verificada en DevTools → logout → /dashboard redirige a /login
- Registra el cierre en ESTADO_EJECUCION_CLASSSPORT.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. ClassSport tiene tres roles con dashboards distintos:
el profesor ve sus reservas del día, el coordinador ve el estado global de
los bloques, el admin tiene la misma vista del coordinador más acceso a la
administración del sistema.

Tu mentalidad: el sidebar de ClassSport no es un menú genérico — es la
navegación específica de cada actor. Un profesor no necesita ver "Gestión de
Salones" ni "Reportes". Mostrar opciones que el usuario no puede usar genera
confusión y es una falla de diseño.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CLASSSPORT.md — la paleta de colores completa (sección 17 —
   azul institucional como color primario), la matriz de permisos (sección 4),
   el endpoint /api/dashboard con sus datos por rol, y la Fase 2 del plan
2. doc/ESTADO_EJECUCION_CLASSSPORT.md — verifica que la Fase 1 esté completada
   y registra el inicio de la Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar tiene tres versiones explícitas según el rol:
  Profesor: Inicio, Bloques, Mis Reservas, Perfil.
  Coordinador: Inicio, Bloques, Todas las Reservas, Reportes, Perfil.
  Admin: Inicio, Bloques, Todas las Reservas, Reportes, Administración, Perfil.
  Un profesor que acceda directamente a /reservations (todas las reservas)
  debe ser redirigido a /reservations/my por el middleware.

— El dashboard del profesor muestra sus reservas del día en curso y sus
  próximas reservas de los 7 días siguientes. Si no tiene reservas, muestra
  un empty state con botón "Hacer una reserva" que lleva a /blocks.

— El dashboard del coordinador y del admin muestra el conteo de reservas
  activas del día por bloque (ej: "Bloque A: 4 franjas ocupadas de 18"),
  más un acceso rápido al calendario de hoy.

— La página /admin/db-setup informa exactamente qué insertará el bootstrap:
  "Aplicará 3 migrations y cargará: 1 usuario admin, 3 bloques (A, B, C),
  6 franjas horarias y 4 salones de demo." Los números deben coincidir con
  el seed real.

— El middleware.ts protege /admin/* para role='admin', /reports para
  role='coordinador' o role='admin', y /reservations (listado global) para
  role='coordinador' o role='admin'.

Al terminar:
- Probar el flujo completo: login admin → banner seed → /admin/db-setup →
  bootstrap → verificar que las 3 migrations quedan aplicadas y el seed
  insertado → SeedModeBanner desaparece
- Verificar el sidebar con los 3 roles (crear usuarios de prueba directamente
  en Supabase para probar)
- Verificar responsive en 375px, 768px y 1280px
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Bloques, Salones y Disponibilidad

### Rol: `Ingeniero Fullstack Senior — Consulta de disponibilidad en tiempo real`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en sistemas
de disponibilidad en tiempo real y diseño de calendarios de ocupación de
recursos físicos.

Tu mentalidad: el calendario semanal es la pieza de UI más importante de
ClassSport. Es lo que el profesor ve para decidir dónde dictar su clase.
Tiene que ser instantáneamente legible: verde = libre, rojo = ocupado.
Sin ambigüedad, sin clics adicionales para entender el estado. Y tiene que
reflejar el estado real en el momento en que se carga — sin datos cacheados.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CLASSSPORT.md — migration 0002 con sus tres tablas (blocks,
   slots, rooms), los componentes WeeklyCalendar, SlotCell, BlockCard y
   RoomCard (sección 17), la lógica de availabilityService.ts (sección 11.4),
   reglas RN-06 y RN-09, y la Fase 3 completa del plan
2. doc/ESTADO_EJECUCION_CLASSSPORT.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— El bootstrap ya insertó los 3 bloques, las 6 franjas y los 4 salones de
  demo. La migration 0002 crea las tablas. Aplícala desde /admin/db-setup
  y verifica que los datos del seed están presentes en Supabase.

— buildWeeklyCalendar(roomId, weekStart) construye la grilla completa de la
  semana. Para cada día de lunes a viernes y para cada una de las 6 franjas:
  (1) determinar si la fecha es pasada (estado 'pasada'), presente o futura;
  (2) buscar si existe una reserva activa para esa combinación (room, slot,
  fecha); (3) retornar el estado: 'libre', 'ocupada' (con datos del profesor
  y materia) o 'pasada'. La fecha de hoy y las fechas pasadas se muestran en
  gris y no son interactivas.

— El SlotCell en una franja ocupada muestra en tooltip (o en una expansión
  al hacer hover/tap): nombre del profesor, materia y grupo. En móvil donde
  no hay hover, mostrar esta info al tocar la celda con un pequeño popup.

— El WeeklyCalendar en celular se implementa como acordeón: un botón por día
  (Lun 14, Mar 15, etc.) que al tocarlo expande la lista de las 6 franjas de
  ese día con su estado. Esto es mucho más usable que una grilla 5×6 en 375px.
  En tablet y desktop se muestra la grilla completa.

— deactivateRoom tiene dos pasos (RN-10): la primera petición devuelve
  { warningCount: N } si hay reservas futuras confirmadas para ese salón.
  Si warningCount > 0, el frontend muestra la advertencia: "Este salón tiene
  N reservas futuras activas. Si lo desactivas, esas reservas quedan activas
  pero el salón no aparecerá disponible para nuevas reservas. ¿Continuar?"
  Si el admin confirma, hace una segunda petición POST con `?confirm=true`.
  Si warningCount === 0, el salón se desactiva directamente.

— RN-06: los salones con is_active = false no aparecen en la consulta de
  disponibilidad ni en el listado de salones para reservar. Sí aparecen
  en la gestión de salones del admin con badge "Inactivo".

— RN-09: el código del salón debe ser único dentro del bloque. El endpoint
  de creación debe capturar el error de UNIQUE de Postgres y retornar 409
  con mensaje claro: "Ya existe un salón con código X-YYY en el Bloque X."

Al terminar:
- Probar el calendario semanal con salones con y sin reservas (crear algunas
  manualmente en Supabase para probar antes de implementar reservas)
- Probar deactivateRoom con el flujo de dos pasos
- Probar que un salón inactivo no aparece en /blocks
- Probar creación de salón con código duplicado en el mismo bloque → 409
- Verificar el acordeón del calendario en 375px
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_DISPONIBILIDAD.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Reservas

### Rol: `Ingeniero Fullstack Senior — Flujo central del sistema y prevención de conflictos`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en sistemas
de reservas de recursos compartidos, prevención de conflictos a nivel de base
de datos y diseño de flujos de confirmación críticos.

Tu mentalidad: la reserva de salones es la razón de existir de ClassSport.
Dos profesores nunca pueden tener el mismo salón a la misma hora — eso es
el problema que el sistema vino a resolver. Si falla esa garantía, el sistema
no tiene valor. La prevención de conflictos se implementa a dos niveles:
validación en el servicio y UNIQUE parcial en Postgres como red de seguridad.
Ninguno de los dos es suficiente solo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CLASSSPORT.md — migration 0003 con el índice UNIQUE parcial
   (sección 12 — lee la nota explicativa sobre por qué es parcial y no
   normal), reglas RN-01 al RN-05 y RN-08, la lógica de reservationService.ts
   (sección 11.4), el flujo de conflicto simultáneo (sección 16), y la
   Fase 4 completa del plan
2. doc/ESTADO_EJECUCION_CLASSSPORT.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— El índice UNIQUE de la migration 0003 es parcial: solo aplica a reservas
  con status = 'confirmada'. Esto es fundamental. Si fuera un UNIQUE normal
  sobre (room_id, slot_id, reservation_date), una reserva cancelada bloquearía
  esa franja para siempre. Con el índice parcial, una reserva cancelada + una
  nueva confirmada pueden coexistir en el mismo (room, slot, date). Asegúrate
  de usar exactamente el SQL del plan: CREATE UNIQUE INDEX IF NOT EXISTS
  idx_unique_active_reservation ON reservations(room_id, slot_id, reservation_date)
  WHERE status = 'confirmada'.

— createReservation en el dataService sigue esta secuencia exacta:
  (1) validateReservationRules(date): verificar RN-02 (día hábil, no sábado
  ni domingo) y RN-03 (no más de 60 días de anticipación). Si falla, retornar
  400 con el mensaje específico de qué regla se violó.
  (2) checkConflict(roomId, slotId, date): buscar reservas activas con esa
  combinación. Si existe, retornar 409 con el objeto de conflicto completo:
  { professorName, subject, groupName }. El frontend usa estos datos para
  mostrar el mensaje descriptivo.
  (3) INSERT INTO reservations. Si Postgres rechaza el INSERT por el UNIQUE
  parcial (race condition de milisegundos), capturar el error de unicidad
  (código de error de Postgres: '23505') y retornar 409 con mensaje genérico
  de conflicto — no dejar que el error de DB llegue al cliente.
  (4) recordAudit.

— El mensaje de conflicto (RF-06) es la respuesta de error más importante del
  sistema. Cuando el frontend recibe el 409 con datos del conflicto, debe
  mostrar exactamente: "El salón [código] ya está reservado en esa franja
  por Prof. [nombre] — [materia]". No un mensaje genérico de error. El
  componente que muestra este mensaje debe ser prominente, no un toast pequeño.

— cancelReservation aplica las reglas según el rol:
  Para 'profesor': verificar RN-05 (solo puede cancelar sus propias reservas)
  Y RN-04 (solo reservas con reservation_date > TODAY — no del día actual
  ni pasadas). Si intenta cancelar una reserva de otro profesor: 403.
  Si intenta cancelar una del día actual o pasada: 409 con mensaje claro.
  Para 'coordinador' y 'admin': pueden cancelar cualquier reserva sin
  restricción de fecha, pero deben proporcionar un motivo (cancellation_reason
  no puede estar vacío para estos roles).

— El formulario de nueva reserva en /reservations/new acepta query params
  ?roomId=&slotId=&date= porque el flujo principal llega desde el calendario
  del salón. Si estos params están presentes, el formulario pre-llena el salón,
  la franja y la fecha mostrando un resumen claro (nombre del salón, bloque,
  franja, fecha formateada en español). El usuario solo necesita ingresar
  materia y grupo. Si no hay params, muestra selectores para elegir.

— La franja de la fecha de hoy y las fechas pasadas no se pueden reservar.
  El botón de "Confirmar" en el formulario está deshabilitado si la fecha
  es pasada o de hoy, y el mensaje explica por qué.

— RN-04 en el frontend: en la página "Mis Reservas", el botón "Cancelar"
  aparece solo para reservas con reservation_date > TODAY. Para las del
  día actual y las pasadas, el botón no aparece. Si el profesor intenta
  acceder directamente al endpoint de cancelación con una reserva pasada,
  el servidor también lo rechaza — doble validación.

Al terminar:
- Probar el flujo completo: calendario del salón → clic en franja libre →
  formulario pre-llenado → ingresar materia y grupo → confirmar → franja
  aparece roja en el calendario con los datos del profesor
- Probar el conflicto: intentar reservar una franja ya ocupada → ver el
  mensaje descriptivo con el nombre del profesor y la materia
- Probar RN-02: intentar reservar un sábado → debe fallar con mensaje claro
- Probar RN-03: intentar reservar con 61 días de anticipación → debe fallar
- Probar RN-04: intentar cancelar una reserva de hoy → botón deshabilitado
  en UI + 409 si se intenta via API directa
- Probar RN-05: intentar cancelar la reserva de otro profesor → 403
- Probar la cancelación de coordinador: debe requerir motivo obligatorio
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_RESERVAS.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Reportes y Administración de Usuarios

### Rol: `Ingeniero Fullstack Senior — Reportes de ocupación y gestión de usuarios`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
generación de reportes de datos institucionales y gestión de accesos de
usuarios en sistemas corporativos.

Tu mentalidad: el reporte de ocupación es la herramienta que justifica
decisiones institucionales sobre el uso de espacios. Un coordinador que
necesita saber cuáles salones están subutilizados, o un administrador que
quiere conocer la tasa de ocupación del Bloque B el mes pasado — esos son
los casos de uso reales. El CSV tiene que ser limpio, bien estructurado y
directo, no necesita ser sofisticado.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CLASSSPORT.md — el reportService.ts con las columnas del CSV,
   los permisos de reportes (coordinador y admin), el flujo de gestión de
   usuarios, y la Fase 5 completa del plan
2. doc/ESTADO_EJECUCION_CLASSSPORT.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— getOccupancyReport hace un JOIN entre reservations, rooms, blocks, slots
  y users (para el nombre del profesor). Filtra por:
  reservation_date BETWEEN from AND to (ambos inclusive), status = 'confirmada',
  y opcionalmente block_id si se seleccionó un bloque específico.
  Las columnas del CSV son exactamente las del plan: Fecha, Bloque, Salón,
  Código, Franja, Profesor, Materia, Grupo, Estado.

— generateOccupancyCSV en reportService.ts genera el string CSV puro.
  El endpoint GET /api/reports/occupancy?format=csv devuelve ese string
  con los headers: Content-Type: text/csv;charset=utf-8, Content-Disposition:
  attachment; filename="reporte-ocupacion-YYYYMMDD-YYYYMMDD.csv".
  Si el formato es json (por defecto), devuelve el array de objetos para
  que la página muestre la tabla preview antes de descargar.
  Si no hay datos en el período: retornar 404 con mensaje claro.

— La página /reports muestra: selector de fecha inicio, selector de fecha
  fin, dropdown de bloque (opción "Todos los bloques" + cada bloque), botón
  "Generar reporte" que llama al endpoint con format=json y muestra la tabla
  preview. Botón "Descargar CSV" que llama con format=csv. El botón de
  descarga aparece solo cuando hay datos en la preview.

— Gestión de usuarios: mismo patrón que los demás proyectos del curso.
  POST crea usuario con contraseña temporal (crypto.randomBytes 12 chars),
  la hashea con bcrypt, must_change_password=true, retorna contraseña en
  claro una sola vez con modal de advertencia.
  En el login: si must_change_password=true, redirigir a /profile para
  cambio obligatorio antes de acceder al sistema.

— La auditoría de usuarios (create_user, toggle_user) se registra en Blob
  igual que las operaciones de reservas. El admin siempre tiene trazabilidad
  de qué cuentas creó y cuándo.

— /admin/audit muestra la auditoría mensual en tabla. El campo summary es
  legible directamente: "Prof. García reservó A-101 el 15/06 (09:00–11:00)
  para Matemáticas I Grupo 2024-1A". El administrador no necesita decodificar
  IDs para entender qué pasó.

Al terminar:
- Crear varias reservas de prueba para distintos salones y fechas
- Generar el reporte de ese período y verificar que los datos son correctos
- Probar el filtro por bloque: solo deben aparecer reservas del bloque
  seleccionado
- Descargar el CSV y verificar que se puede abrir en Excel con las columnas
  correctas
- Probar el flujo de usuario nuevo: admin crea → contraseña temporal → usuario
  hace login → redirigido a cambio de contraseña → accede al sistema
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_REPORTES_ADMIN.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Pulido final y Deploy

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de ClassSport.

Tu mentalidad: ClassSport resuelve un problema real de una institución
universitaria. Un conflicto de horario que pase porque el sistema no lo
detectó, un calendario que muestre datos desactualizados, o un mensaje de
error genérico que no explique qué franja está ocupada — cualquiera de esos
fallos afecta directamente a profesores y estudiantes. Esta fase termina
cuando el sistema sea confiable en todos sus flujos en producción.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CLASSSPORT.md — Fase 6 completa con todas las tareas, los
   requerimientos no funcionales (RNF-01 al RNF-08) y las restricciones
   del sistema (sección 20)
2. doc/ESTADO_EJECUCION_CLASSSPORT.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Lo que debes completar en esta fase:

Empty states con mensajes contextuales según el rol:
- Bloque sin salones: "Este bloque aún no tiene salones registrados."
  (solo admin ve el botón "Agregar salón").
- Calendario semanal con todas las franjas libres: mostrar todas en verde
  con el mensaje "Todas las franjas disponibles para esta semana." sin botón
  de empty state — no es un error, es disponibilidad total.
- Mis Reservas sin reservas: "Aún no tienes reservas. Consulta la
  disponibilidad de los bloques para hacer tu primera reserva." Con botón
  que lleva a /blocks.
- Todas las Reservas sin datos para los filtros aplicados: "No hay reservas
  para los filtros seleccionados. Prueba con otro rango de fechas o bloque."
- Reporte sin datos en el período: "No hay reservas confirmadas en el período
  seleccionado. No se puede generar el reporte."

Manejo de errores global:
- 401 (sesión expirada): toast "Tu sesión ha expirado" + redirect a /login.
- 403 (sin permisos de rol): toast "No tienes permisos para esta acción."
- 409 de conflicto de reserva: NO es un toast genérico. Es un componente de
  alerta prominente que muestra exactamente: "El salón [X] ya está reservado
  en ese horario por Prof. [nombre] — [materia]". El usuario necesita esa
  información para tomar una decisión alternativa.
- 409 de otras reglas (sábado, más de 60 días): toast con el mensaje
  específico de la regla que se violó.
- 500: toast genérico.

Verificación del flujo de race condition (RNF-03):
Abrir dos sesiones del navegador (dos pestañas o incógnito), autenticarse
como dos profesores distintos, navegar al mismo salón y franja, confirmar
ambas reservas en rápida sucesión. Solo una debe quedar confirmada. La otra
debe recibir el mensaje de conflicto descriptivo. Este es el test más
importante del sistema — si falla aquí, el proyecto no cumple su promesa
fundamental.

Verificación de todas las reglas de negocio en producción:
- RN-02: intentar reservar un sábado → debe fallar con mensaje
- RN-03: intentar reservar con 62 días de anticipación → debe fallar
- RN-04: intentar cancelar reserva de ayer → botón no aparece
- RN-05: intentar cancelar reserva de otro profesor vía API → 403
- RN-06: desactivar un salón → verificar que desaparece de /blocks
- RN-07: suspender un usuario → verificar que no puede hacer login

Verificación del calendario en celular (RNF-04):
El acordeón de días debe funcionar perfectamente en 375px. Al expandir un
día, las celdas de franja deben tener altura suficiente para tocar con el
dedo. La información de franja ocupada (profesor + materia) debe ser
legible sin hacer zoom.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Verificar que ningún componente cliente importa variables privadas ni
  módulos de lib/ directamente
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción con los 3 roles el flujo completo:
- Admin: bootstrap → crear un profesor y un coordinador → verificar usuarios
  en la tabla
- Profesor: login → ver dashboard → ir a Bloque A → seleccionar A-101 →
  ver calendario → reservar una franja → verificar en Mis Reservas
- Coordinador: login → ver todas las reservas → cancelar la del profesor
  con motivo → verificar que la franja queda libre en el calendario
- Admin: generar reporte del período → descargar CSV → verificar contenido

Al cerrar el proyecto:
- Registra la Fase 6 como Completada en ESTADO_EJECUCION_CLASSSPORT.md
  con la URL de producción de Vercel en el historial
- Crea doc/RESUMEN_FASE_6_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack utilizado, tablas de
  Supabase creadas con descripción, decisiones técnicas destacadas (índice
  UNIQUE parcial, doble validación de conflictos, calendario acordeón en
  mobile) y estado final del proyecto

El proyecto ClassSport está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Juan Gutiérrez — Doc: 1044218091
> Curso: Lógica y Programación — SIST0200
