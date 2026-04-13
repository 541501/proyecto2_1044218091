# 📊 FASE 6 — Integración y Pruebas Funcionales
## Sistema de Gestión y Reserva de Salones Universitarios — ClassSport

> **Versión:** 1.0  
> **Fecha de ejecución:** 13 de abril de 2026  
> **Rol principal:** Ingeniero Fullstack Senior + QA Engineer  
> **Referencia:** Plan de implementación (plan_implementacion.md Fase 6)  
> **Prerequisito:** Fase 5 ✅ Completada  

---

## 📋 Resumen Ejecutivo

**Fase 6 ejecutará la integración y pruebas funcionales** del sistema ClassSport, conectando frontend y backend en un entorno de staging, ejecutando 6 flujos críticos de usuario, detectando y resolviendo bugs de integración.

---

## 🚀 TAREA 1: CHECKLIST DE DEPLOY EN STAGING

### Preparación (Pre-Deploy)

#### 1.1 Configuración de Git
```bash
# Asegurarse de que todo está en el repo
git status  # Debe estar limpio

# Crear rama develop si no existe
git checkout -b develop  # o git checkout develop si ya existe

# Mergear todas las fases (3-5) en develop
git merge main  # Asegurar que develop tiene todo
git merge feature/fase-3-setup  # Si existen branches separadas
git merge feature/fase-4-backend
git merge feature/fase-5-frontend

# Verificar que develop está actualizado
git log --oneline -10

# (Opcional) Push a GitHub
git push origin develop
```

#### 1.2 Configuración de Neon.tech (BD Staging)

**Paso 1:** Acceder a Neon.tech console
- URL: https://console.neon.tech
- Ir al proyecto ClassSport
- Navegar a "Branches"

**Paso 2:** Crear/verificar branch "staging"
- Crear nueva rama desde "main"
- Nombre: `staging`
- Copia la connection string (incluye password)

**Paso 3:** Ejecutar migraciones en staging
```bash
# En terminal local, crear archivo .env.staging.local con:
DATABASE_URL = "postgresql://user:password@host.neon.tech/dbname?schema=public&sslmode=require"

# Ejecutar migraciones de Prisma
npx prisma migrate deploy --skip-generate

# Ejecutar seed data
NODE_ENV=staging npx ts-node prisma/seed.ts
```

**Archivo seed.ts debe crear:**
- 2 sedes (Sede Campus A, Sede Campus B)
- 6 bloques distribuidos
- 26 salones
- 3 usuarios de prueba:
  - profesor1@test.edu / Password123! (rol PROFESSOR)
  - profesor2@test.edu / Password123! (rol PROFESSOR)
  - admin@test.edu / AdminPass123! (rol ADMIN)

#### 1.3 Configuración de Vercel (Frontend Staging)

**Paso 1:** Acceder a Vercel dashboard
- URL: https://vercel.com
- Proyecto: ClassSport

**Paso 2:** Crear/verificar deployment "staging"
- Conectar rama `develop` a entorno "Preview"
- (O crear environment "staging" y deployar rama develop como "Production" en ese env)

**Paso 3:** Configurar variables de entorno de STAGING
```
NEXTAUTH_URL = https://classsport-staging.vercel.app  (ajustar dominio real)
NEXTAUTH_SECRET = [generate new: openssl rand -base64 32]
NEXTAUTH_PROVIDERS_CREDENTIALS_SECRET = [generate: openssl rand -base64 32]
DATABASE_URL = [connection string de staging en Neon]
NEXTAUTH_CREDENTIALPROVIDER_EMAIL = profesor1@test.edu (para credenciales demo)
NEXTAUTH_CREDENTIALPROVIDER_PASSWORD = Password123!
```

**Paso 4:** Tomar captura del status de Vercel
- Esperar hasta que la barra de build esté ✅ verde "Ready"
- Tomar screenshot
- Notar la URL: `https://classsport-staging-[hash].vercel.app`

#### 1.4 Verificación Post-Deploy

**Checklist:**
```
☐ BD staging accesible (Neon)
☐ 3 usuarios de prueba creados en BD
☐ Variables de entorno de Vercel staging configuradas
☐ Deploy de Vercel muestra ✅ "Ready"
☐ Acceder a https://classsport-staging-[hash].vercel.app en browser
☐ Si redirige a login, ✅ READY
☐ Si muestra error 500, ❌ REVISAR LOGS
```

---

## 🎯 TAREA 2: GUÍA DE EJECUCIÓN DE FLUJOS CRÍTICOS (x6)

### Cuentas de Prueba

```
PROFESOR 1:
  Email: profesor1@test.edu
  Password: Password123!
  Rol: PROFESSOR
  
PROFESOR 2:
  Email: profesor2@test.edu
  Password: Password123!
  Rol: PROFESSOR
  
ADMIN:
  Email: admin@test.edu
  Password: AdminPass123!
  Rol: ADMIN
```

---

### FLUJO 1️⃣: REGISTRO Y PRIMER LOGIN

**Objetivo:** Verificar que un usuario NUEVO puede registrarse y acceder al sistema

**Pasos:**

1. Abrir https://classsport-staging-[hash].vercel.app
   - Esperado: Se abre la página y redirige a `/login`
   - ✅ Si: Continuar
   - ❌ Si no: Anotar error

2. Hacer clic en "Regístrate aquí" (link en página de login)
   - Esperado: Página `/registro` carga
   - ✅ Si: Continuar
   - ❌ Si no: Error 404 o navegación rota

3. Ingresar datos de nuevo usuario:
   ```
   Nombre: Test Usuario Nuevo
   Email: testuser_[timestamp]@test.edu
   Password: TestPass123!
   Confirmar: TestPass123!
   ```
   - ✅ Si: Password requisites muestran ✓ todas las líneas verdes
   - ❌ Si no: Revisar validación de password

4. Click "Crear cuenta"
   - Esperado: Spinner "Registrando..." aparece por 2-3 seg
   - Esperado: Toast verde "¡Registro exitoso!"
   - Esperado: Redirección a `/login` luego de 2 seg
   - ✅ Si: Continuar
   - ❌ Si no: Anotar respuesta HTTP exacta en red

5. Login con nueva cuenta:
   - Email: testuser_[timestamp]@test.edu
   - Password: TestPass123!
   - Click "Iniciar sesión"
   - Esperado: Redirección a `/dashboard`
   - Esperado: Header muestra el nombre del usuario
   - Esperado: Sidebar muestra opciones PROFESSOR (Dashboard, Mis Reservas, Sedes)
   - ❌ Si aparece opción "Administración", ERROR — rol debería ser PROFESSOR no ADMIN

**Evidencia a recopilar:**
- Screenshot de página de registro
- Screenshot de mensaje "¡Registro exitoso!"
- Screenshot del dashboard después del login
- Screenshot del header con nombre del usuario

**Resultado:** ✅ PASO / ❌ FALLÓ
   - Si ✅: "Registro y login funcional"
   - Si ❌: Describir qué falló y en qué componente

---

### FLUJO 2️⃣: RESERVA EXITOSA COMPLETA

**Objetivo:** Verificar el flujo completo de crear una reserva exitosa

**Cuentas:** Usar PROFESOR 1 (profesor1@test.edu)

**Pasos:**

1. Login desde cero (o usar sesión existente)
   - Esperado: Dashboard visible, Bienvenido "Profesor 1"
   - ✅ Si: Continuar

2. Navegar a Nueva Reserva
   - Click botón "Nueva reserva" (en Dashboard o en Sidebar → "Mis Reservas" → botón + )
   - Esperado: URL = `/dashboard/reservas/nueva`
   - Esperado: Form muestra "Paso 1: Selecciona un salón" (progress bar 33%)
   - ✅ Si: Continuar

3. **PASO 1: Seleccionar Salón**
   - Dropdown Sede: Seleccionar "Sede Campus A"
     - Esperado: Dropdown Bloque se habilita
   - Dropdown Bloque: Seleccionar "Bloque A-1"
     - Esperado: Dropdown Salón se habilita, muestra 3-4 salones
   - Dropdown Salón: Seleccionar "Salón A-101" (capacidad 30)
     - Esperado: Campo lleno
   - Click "Siguiente"
     - Esperado: Progresa a Paso 2 (progress bar 66%)
     - Esperado: CalendarioSalon componente carga

4. **PASO 2: Seleccionar Horario**
   - Esperado: Grid de 16 slots (07:00 a 22:00) visible
   - Esperado: Slots muestran colores: Verde (libre) y Gris (ocupado)
   - Navegar a fecha FUTURA (ej: próximo martes)
     - Click botón "Siguiente >" para cambiar fecha
     - Esperado: Fechas se actualizan en el header "viernes, X de abril..."
   - Seleccionar slots libres (ej: 10:00, 11:00, 12:00)
     - Click en slot "10:00"
     - Esperado: Slot se pone AZUL (seleccionado)
     - Esperado: Aparecer info "Rango seleccionado: 10:00 - 13:00" (asume auto-cierre a fin)
   - Click "Siguiente"
     - Esperado: Progresa a Paso 3 (progress bar 100%)

5. **PASO 3: Detalles & Confirmar**
   - Campo "Nombre de la clase": Ingresar "Matemáticas 101"
   - Campo "Descripción": Ingresar "Sesión teórica de ecuaciones diferenciales"
   - Esperado: Resumen visible abajo:
     ```
     Salón: Salón A-101
     Fecha: [próximo martes]
     Horario: 10:00 - 13:00
     ```
   - Click "Confirmar reserva"
     - Esperado: Spinner "Creando..." por 1-2 seg
     - Esperado: Toast ✅ verde "¡Reserva creada exitosamente!"
     - Esperado: Redirección a `/dashboard/reservas` luego de 2 seg

6. **Verificación en "Mis Reservas":**
   - Página `/dashboard/reservas` carga
   - Esperado: Sección "Próximas" muestra la reserva creada:
     ```
     Matemáticas 101
     📍 Salón A-101 • Bloque A-1 • Sede Campus A
     📅 [próximo martes]
     10:00 - 13:00 (badge azul)
     ```
   - Click en la tarjeta → Esperado: Abre detalles de reserva (si disponible)

7. **Verificación en Calendario:**
   - Navegar a `/dashboard/sedes/[sedeId]` → Bloque → Salón → Botón de nueva reserva
   - O ir a "Sedes" → "Sede Campus A" → "Bloque A-1" → Click "Salón A-101"
   - (Si hay endpoint de disponibilidad) Verificar que horario 10:00-13:00 aparece como "ocupado" (gris)
   - Esperado: Slots 10:00, 11:00, 12:00 en COLOR GRIS (ocupado, no clickeable)

**Evidencia:**
- Screenshot Paso 1 (selección de salón)
- Screenshot Paso 2 (calendario con slots seleccionados)
- Screenshot Paso 3 (resumen)
- Screenshot "¡Reserva creada exitosamente!"
- Screenshot de "Mis Reservas" con nueva reserva
- Screenshot del calendario mostrando slots ocupados

**Resultado:** ✅ PASO / ❌ FALLÓ

---

### FLUJO 3️⃣: CONFLICTO DE RESERVA (RACE CONDITION) ⭐ CRÍTICO

**Objetivo:** Verificar que dos usuarios intentando reservar el MISMO slot resulta en error 409 para uno

**Cuentas:** 
- PROFESOR 1 (profesor1@test.edu) en VENTANA 1
- PROFESOR 2 (profesor2@test.edu) en VENTANA 2

**Equipo:** 2 ventanas de navegador (lado a lado)

**Pasos:**

**VENTANA 1 — PROFESOR 1:**
1. Login con profesor1@test.edu
2. Navegar a `/dashboard/reservas/nueva`
3. Seleccionar:
   - Sede: "Sede Campus A"
   - Bloque: "Bloque A-2"
   - Salón: "Salón A-201"
   - Fecha: Mañana (13 Apr)
   - Slots: 14:00, 15:00 (click en 14:00, click en 15:00)
   - Nombre clase: "Inglés Primera Parte"
   - Descripción: (opcional)
4. **PAUSAR aquí — NO clickear "Confirmar reserva" aún**

**VENTANA 2 — PROFESOR 2:**
1. Login con profesor2@test.edu
2. Navegar a `/dashboard/reservas/nueva`
3. Seleccionar:
   - Sede: "Sede Campus A"
   - Bloque: "Bloque A-2"
   - Salón: **"Salón A-201"** (MISMO que Ventana 1)
   - Fecha: **Mañana (13 Apr)** (MISMA que Ventana 1)
   - Slots: **14:00, 15:00** (MISMO horario)
   - Nombre clase: "Inglés Segunda Parte"
   - Descripción: (opcional)
4. **PAUSAR aquí — NO clickear "Confirmar reserva" aún**

**SINCRONIZACIÓN:**
1. (VENTANA 1) Click "Confirmar reserva"
   - Esperado: Spinner "Creando..." por 1 seg
   - Esperado: Toast ✅ "¡Reserva creada exitosamente!"
   - Esperado: Redirección a `/dashboard/reservas`
   - Esperado: Nueva reserva "Inglés Primera Parte" visible

2. (VENTANA 2) Click "Confirmar reserva" **inmediatamente después** (antes de 2 seg)
   - Esperado: Spinner "Creando..." por 1 seg
   - Esperado: **Toast ROJO ❌ "Ese horario acaba de ser reservado. Intenta otra fecha u horario."**
   - Esperado: **NO redirecciona**, user vuelve a Paso 2 (calendario)
   - Esperado: CalendarioSalon **re-fetcha automáticamente**
   - Esperado: Slots 14:00-15:00 ahora aparecen en **GRIS (ocupado)**

3. (VENTANA 2) Verificar integridad:
   - Profesor 2 puede clickear en otros slots (deben ser verdes)
   - Profesor 1 navega a `/dashboard/reservas` → reserva debe aparecer UNA sola vez (no duplicada)
   - Profesor 1 navega al calendario del Salón A-201 para 13 Apr → slots 14-15 GRIS
   - **Profesor 2 NO tiene una reserva "Inglés Segunda Parte"** (la creación falló correctamente)

**Evidencia (muy importante):**
- Screenshot de VENTANA 1 mostrando "✅ Reserva creada"
- Screenshot de VENTANA 2 mostrando "❌ Ese horario acaba de ser reservado"
- Screenshot del calendario auto-refresco (slots de 14-15 en gris)
- Screenshot de Mis Reservas de Profesor 1 (solo 1 reserva, no duplicada)
- Screenshot de Mis Reservas de Profesor 2 (la reserva fallida NO aparece)
- **Captura de red (DevTools Network tab) mostrando POST /api/reservas:**
  - Profesor 1: Status 201 (éxito)
  - Profesor 2: Status 409 (conflicto)

**Resultado:** ✅ PASO / ❌ FALLÓ
- Si ✅: "Sistema previene race conditions correctamente"
- Si ❌: Describir: "Profesor 2 logró crear reserva duplicada" o "Error no mostrado al user"

---

### FLUJO 4️⃣: CANCELACIÓN DE RESERVA

**Objetivo:** Verificar que cancelar una reserva libera el slot

**Cuentas:** PROFESOR 1 (usar reserva de FLUJO 2)

**Pasos:**

1. Login PROFESOR 1 (ya debe haber reserva de FLUJO 2)
2. Navegar a `/dashboard/reservas`
   - Esperado: Sección "Próximas" contiene reserva "Matemáticas 101" (14:30 - 15:30 aproximadamente)

3. Click en tarjeta de reserva o botón "Cancelar"
   - (Si hay modal de confirmación) Esperado: Modal "¿Confirmar cancelación?"
   - Click "Sí, cancelar"
   - Esperado: Spinner "Cancelando..."
   - Esperado: Toast ✅ "Reserva cancelada"
   - Esperado: Tarjeta de reserva se mueve a "Historial" (opacidad baja)
   - Esperado: Reserva ahora moestra "CANCELADA" badge rojo

4. **Verificación de liberación del slot:**
   - Navegar a Nueva Reserva → Mismo Salón → Misma Fecha
   - Esperado: Calendario carga slots del salón
   - Esperado: Los slots que fueron de la reserva cancelada ahora VERDES (disponibles)
   - Antes: Slots 14:30, 15:30 = GRIS
   - Después: Slots 14:30, 15:30 = VERDE ✓

5. **Verificación en Mis Reservas:**
   - Volver a `/dashboard/reservas`
   - Sección "Próximas": Reserva "Matemáticas 101" desaparece
   - Sección "Historial": Reserva "Matemáticas 101" aparece con "Cancelada" badge

**Evidencia:**
- Screenshot de tarjeta de reserva antes de cancelar
- Screenshot de modal de confirmación (si existe)
- Screenshot de Toast "Reserva cancelada"
- Screenshot de Historial mostrando reserva cancelada
- Screenshot del calendario mostrando slots liberados (verdes)

**Resultado:** ✅ PASO / ❌ FALLÓ

---

### FLUJO 5️⃣: ACCESO Y ACCIONES DE ADMINISTRADOR

**Objetivo:** Verificar panel admin, creación de recursos, visibilidad de todas las reservas

**Cuentas:** ADMIN (admin@test.edu)

**Pasos:**

1. Login ADMIN
   - Esperado: Dashboard visible
   - Esperado: Sidebar muestra "Administración" (último item)
   - ✅ Si: Continuar
   - ❌ Si no: PROFESOR no debería ver esta opción

2. Click "Administración" (Sidebar → "Administración")
   - Esperado: URL = `/dashboard/admin`
   - Esperado: Página muestra 5 stats cards:
     ```
     | Sedes (N)     | Salones (N)  | Reservas (N) |
     | Reservas hoy (N) | Canceladas (N) |
     ```
   - Esperado: Cards muestran números correctos (ej: 2 sedes, 26 salones)
   - ✅ Si: Continuar

3. **Verificar acceso a Todas las Reservas:**
   - Click botón "Todas las reservas" o link similar
   - (O navegar a `/dashboard/reservas` como ADMIN)
   - Esperado: Lista de **TODAS** las reservas del sistema (no solo propias)
   - Esperado: Cada reserva muestra: Clase, Usuario (profesor), Salón, Fecha, Horario
   - Verificar que reservas de PROFESOR 1 y PROFESOR 2 aparecen
   - ✅ Si: Continuar

4. **Crear nuevo salón (ADMIN):**
   - (Si existe UI para crear salones en admin)
   - Click "Crear salón" o "Nuevo salón"
   - Esperado: Form o modal con campos:
     ```
     Sede: [dropdown]
     Bloque: [dropdown]
     Nombre del salón: [text]
     Capacidad: [number]
     ```
   - Ingresar:
     ```
     Sede: Sede Campus B
     Bloque: Bloque B-1
     Nombre: Laboratorio Física
     Capacidad: 20
     ```
   - Click "Crear"
   - Esperado: Toast ✅ "Salón creado"
   - Esperado: Nuevo salón aparece en grid

5. **Cancelar reserva de otro profesor:**
   - Navegar a Todas las Reservas
   - Buscar reserva de PROFESOR 2 (ej: "Inglés Segunda Parte" — puede no existir si FLUJO 3 pasó, o usar otra)
   - O buscar reserva de PROFESOR 1 que no fue cancelada
   - Click en reserva → "Cancelar"
   - Esperado: Modal "¿Cancelar reserva de [profesor]?"
   - Click "Sí"
   - Esperado: Toast ✅ "Reserva cancelada por administrador"
   - Esperado: Reserva ya no aparece en "Próximas" de ese profesor

**Evidencia:**
- Screenshot du panel admin con stats
- Screenshot de "Todas las Reservas" mostrando múltiples usuarios
- Screenshot del form de crear salón
- Screenshot de nuevo salón creado exitosamente
- Screenshot de cancelación por admin

**Resultado:** ✅ PASO / ❌ FALLÓ
- Si ❌: Describir qué funcionalidad admin no existe

---

### FLUJO 6️⃣: PROTECCIÓN DE RUTAS (401/403/Redirect)

**Objetivo:** Verificar que accesos no autorizados son bloqueados correctamente

**Pasos:**

**6.1 — PROFESOR intenta acceder a `/admin`**
1. Login como PROFESOR 1
2. Intentar acceder directamente a URL: `https://classsport-staging-[hash].vercel.app/dashboard/admin`
   - Esperado: **Redirección a `/dashboard` (no muestra admin panel)**
   - Esperado: (Opcional) Toast ❌ "No tienes permisos para acceder"
   - ✅ Si: Continuar
   - ❌ Si no: SECURITY ISSUE — PROFESOR vio panel admin

**6.2 — Sin sesión intenta acceder a `/dashboard`**
1. Cerrar sesión (logout)
   - Click Header → Dropdown → "Cerrar sesión"
   - Esperado: Redirección a `/login`
2. Intentar acceder directamente a: `https://classsport-staging-[hash].vercel.app/dashboard`
   - Esperado: **Redirección a `/login`**
   - Esperado: URL = `/login`
   - ✅ Si: Continuar
   - ❌ Si no: SECURITY ISSUE — usuario sin sesión accedió a ruta protegida

**6.3 — Sin sesión intenta acceder a `/api/reservas`**
1. (Con sesión cerrada) Abrir DevTools → Network tab
2. Ejecutar comando en Console:
   ```javascript
   fetch('https://classsport-staging-[hash].vercel.app/api/reservas')
     .then(r => r.json())
     .then(console.log)
   ```
3. Esperado: **Response status = 401 Unauthorized**
4. Esperado: Response body = `{ error: "No autenticado" }` o similar
5. ✅ Si: Continuar
6. ❌ Si no: SECURITY ISSUE — endpoint accesible sin autenticación

**6.4 — PROFESOR intenta acceder a `POST /api/sedes` (crear sede)**
1. Login PROFESOR 1
2. DevTools → Network
3. Ejecutar:
   ```javascript
   fetch('https://classsport-staging-[hash].vercel.app/api/sedes', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ nombre: "Sed Falsa", direccion: "Calle Falsa 123" })
   })
     .then(r => r.json())
     .then(console.log)
   ```
4. Esperado: **Response status = 403 Forbidden**
5. Esperado: Response body = `{ error: "Permiso denegado" }` o similar
6. ✅ Si: Continuar
7. ❌ Si no: SECURITY ISSUE — PROFESOR modificó datos

**Evidencia:**
- Screenshot de navegación redirección (PROFESOR → admin → redirección a dashboard)
- Screenshot de redirección sin sesión (→ login)
- Screenshot de Network tab mostrando POST 401 sin sesión
- Screenshot de Network tab mostrando POST 403 PROFESOR intenta crear sede

**Resultado:** ✅ PASO / ❌ FALLÓ
- Todos deben ser ✅ para seguridad

---

## 🔧 TAREA 3: PLANTILLA DE REPORTE DE BUGS

**Usar esta plantilla para CADA bug encontrado:**

```markdown
## BUG #[ID]

**Título:** [Descripción corta del bug]

**Severidad:** 
- [ ] Alta (Sistema no funciona, seguridad, data loss)
- [ ] Media (Funcionalidad rota, UX degradada)
- [ ] Baja (Cosmético, mensajes de error, ortografía)

**Componente Afectado:**
- [ ] Frontend (React/Next.js)
- [ ] Backend (API/Prisma)
- [ ] Base de Datos (Constraint, migration)
- [ ] DevOps (Variables, deploy)

**Flujo donde se encontró:** [FLUJO 1/2/3/4/5/6]

### Pasos para reproducir:
1. [Paso 1]
2. [Paso 2]
3. ...

### Resultado Actual:
[Describir lo que pasó]
- Screenshot o log relevante:
```
[Pegar aquí output de consola, HTTP response, etc.]
```

### Resultado Esperado:
[Describir lo que debería pasar]

### Análisis:
- [ ] Es reproducible 100% de las veces
- [ ] Es intermitente
- [ ] Afecta a múltiples usuarios
- [ ] Afecta solo a cierto navegador/dispositivo

### Posible Causa:
[Tu hipótesis técnica]

### Resolución Propuesta:
[Qué cambio de código solucionaría esto]

### Estado:
- [ ] Abierto (reportado, no iniciado)
- [ ] En Progreso (alguien trabajando)
- [ ] Resuelto (PR creado)
- [ ] Verificado (fix en staging)

### Asignado a:
[Nombre]

---
```

**Ejemplo llenado:**

```markdown
## BUG #001

**Título:** FormularioReserva no muestra error 409 como toast rojo

**Severidad:** 
- [X] Alta (Sistema no funciona, seguridad, data loss)

**Componente Afectado:**
- [X] Frontend (React/Next.js)

**Flujo donde se encontró:** FLUJO 3 (Conflicto)

### Pasos para reproducir:
1. Abrir 2 ventanas de navegador (PROFESOR 1 y PROFESOR 2)
2. Ambos seleccionan Salón A-201, 13 Apr, 14:00-15:00
3. PROFESOR 1 confirma primero
4. PROFESOR 2 intenta confirmar

### Resultado Actual:
- Post /api/reservas retorna 409 (correcto en network tab)
- **BUT:** No hay toast rojo visible al usuario
- User ve spinner "Creando..." indefinidamente
- Luego de 5 seg, spinner desaparece silenciosamente

### Resultado Esperado:
- Toast rojo inmediato: "Ese horario acaba de ser reservado"
- Calendario re-fetcha automáticamente
- Slots vuelven a verde/gris correctamente

### Análisis:
- [X] Es reproducible 100% de las veces
- Afecta a cualquiera que tenga race condition

### Posible Causa:
En `components/reservas/FormularioReserva.tsx`, la función `mutation.onError` probablemente no maneja correctamente el status 409. Verifica línea ~280.

### Resolución Propuesta:
```typescript
onError: (error: Error) => {
  if (response?.status === 409) {  // <-- Necesita verificar status
    setConflictError(error.message);
    // Toast rojo
    toast.error("Ese horario acaba de ser reservado");
    // Re-fetch
    queryClient.invalidateQueries(...);
  }
}
```

### Estado:
- [X] Abierto (reportado, no iniciado)

---
```

---

## ✅ TAREA 4: CHECKLIST DE REVISIÓN DE DISEÑO

**Verificar cada pantalla principal contra fase_2_resumen.md**

### Pantalla: LOGIN

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Colores** | | | | |
| Fondo | Gradiente azul → índigo (#2563EB → indigo-100) | | | |
| Botón submit | Azul #2563EB | | | |
| Botón secondaria | Gris #9CA3AF con border | | | |
| Links | Azul #2563EB | | | |
| **Tipografía** | | | | |
| Título "ClassSport" | Inter 24px bold (3xl) | | | |
| Labels | Inter 14px medium (sm) | | | |
| Input text | Inter 16px regular (base) | | | |
| **Espaciado** | | | | |
| Gap entre form fields | 16px (md) | | | |
| Padding form card | 32px (lg) | | | |
| **Responsive** | | | | |
| Mobile (375px) | Form stacked, inputs full-width | | | |
| Tablet (768px) | Form centered max-w-md | | | |
| Desktop (1280px) | Form centered max-w-md | | | |
| **UX States** | | | | |
| Loading | Spinner + "Iniciando sesión..." | | | |
| Error | Toast rojo con AlertCircle | | | |
| Focus state input | Border azul + ring-2 | | | |

### Pantalla: REGISTRO

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Colores** | Idéntico a login | | | |
| **Tipografía** | Idéntico a login | | | |
| **Espaciado** | Idéntico a login | | | |
| **Password Strength** | | | | |
| Requisitos visibles | Sí, checklist junto al input | | | |
| Colores | Gris → Verde cuando cumple | | | |
| **Responsive** | Idéntico a login | | | |

### Pantalla: DASHBOARD

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Layout** | | | | |
| Sidebar | Visible a la izquierda en desktop | | | |
| Header sticky | Sticky en la parte arriba | | | |
| Contenido main | Ocupa espacio restante | | | |
| **Header** | | | | |
| Avatar | Inicial del usuario, fondo azul #2563EB | | | |
| Nombre usuario | Inter 14px medium | | | |
| Dropdown logout | Abre al hacer clic | | | |
| **Cards de stats** | | | | |
| Colores | Azul, Púrpura, Verde (diferentes por card) | | | |
| Borders | 1px gris #E2E8F0 | | | |
| Sombra | box-shadow-sm | | | |
| **Tabla "Próximas"** | | | | |
| Filas | Hover effect bg-blue-50 | | | |
| Badges de hora | Azul #2563EB background, texto blanco | | | |
| **Responsive** | | | | |
| Mobile (<640px) | Sidebar offcanvas, MobileNav bottom | | | |
| Tablet (768px) | 2-col grid, sidebar oculto | | | |
| Desktop (1280px) | Sidebar visible, full layout | | | |

### Pantalla: CALENDARIO SALON (dentro de NUEVA RESERVA Paso 2)

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Grid de slots** | | | | |
| Cantidad | 16 slots (7:00-22:00) | | | |
| Layout | 4 columnas desktop, 2 columnas mobile | | | |
| **Colores de estado** | | | | |
| Libre | Verde #10B981 | | | |
| Ocupado | Gris #9CA3AF, opacity 0.6 | | | |
| Seleccionado | Azul #2563EB, border oscuro | | | |
| Propio (usuario) | Azul claro #DBEAFE | | | |
| **Interacción** | | | | |
| Hover libre | Bg verde oscuro + shadow | | | |
| Hover ocupado | Cursor forbidden | | | |
| Click selecciona | Sí, agrega a lista | | | |
| **Navegación de fechas** | | | | |
| Botones ← → | Funcionan correctamente | | | |
| Fecha mostrada | Formato "viernes, 13 de abril de 2026" | | | |
| **Responsive** | | | | |
| Mobile | 2 columnas, slots pequeños | | | |
| Tablet | 3-4 columnas | | | |
| Desktop | 4 columnas | | | |

### Pantalla: FORMULARIO RESERVA (Paso 1, 2, 3)

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Progress bar** | | | | |
| 3 segmentos | Uno para cada paso | | | |
| Color progresado | Azul #2563EB | | | |
| Color no progresado | Gris #E2E8F0 | | | |
| **Paso 1: Selección** | | | | |
| Dropdowns | 3 en cascada (sede → bloque → salón) | | | |
| Botón Siguiente | Azul, deshabilitado sin salón | | | |
| **Paso 2: Calendario** | | | | |
| Integración CalendarioSalon | Componente visible y funcional | | | |
| **Paso 3: Detalles** | | | | |
| Labels | "Nombre de la clase *" con asterisco | | | |
| Input | Placeholder "Ej: Matemáticas 101" | | | |
| Resumen | Card azul claro con datos | | | |
| Botón confirmar | Verde #10B981, "Confirmar reserva" | | | |
| **Navigation botones** | | | | |
| Anterior | Gris con border, flecha izquierda | | | |
| Siguiente | Azul, flecha derecha | | | |
| Confirmar | Verde | | | |

### Pantalla: MIS RESERVAS

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Secciones** | | | | |
| Próximas | Tarjetas con fondo blanco + border | | | |
| Historial | Tarjetas con opacidad 0.5, gris | | | |
| **Tarjeta de reserva** | | | | |
| Titles | "Matemáticas 101" en bold | | | |
| Metadata | "📍 Salón... 📅 Fecha" | | | |
| Badge hora | Azul background, texto blanco | | | |
| Hover | bg-blue-50 transition | | | |
| **Empty state** | Si no hay reservas, muestra mensaje | | | |
| Icono | Calendar de lucide | | | |

### Pantalla: ADMIN PANEL

| Criterio | Esperado | Actual | ✅/❌ | Notas |
|---|---|---|---|---|
| **Stats cards** | | | | |
| Cantidad | 5 cards (sedes, salones, total reservas, hoy, canceladas) | | | |
| Colores | Diferentes por métrica (azul, púrpura, verde, ambar, rojo) | | | |
| Números | Coinciden con DB | | | |
| **Acciones** | | | | |
| Links/botones | A gestión de sedes, salones, usuarios | | | |

---

## 📚 TAREA 5: ANÁLISIS DE BUGS COMUNES EN INTEGRACIÓN

**10 bugs más frecuentes en sistemas Next.js + Prisma + React Query:**

### 🔴 BUG #001: Race Condition en POST /api/reservas

**Síntoma:** Dos users pueden reservar el mismo slot

**Causa:** 
- backend sin SELECT...FOR UPDATE
- O frontend sin invalidación de query

**Cómo detectar:**
- Abrir 2 ventanas, ambas crean reserva simultáneamente
- Check DB: ¿hay 2 registros con (salonId, fecha, horaInicio, horaFin) idénticos?

**Cómo resolver:**
```typescript
// En lib/services/reservas.service.ts:
const crearReserva = async (...) => {
  return await prisma.$transaction(async (tx) => {
    // SELECT...FOR UPDATE para lock pessimista
    const conflicto = await tx.$queryRaw`
      SELECT * FROM "Reserva" 
      WHERE "salonId"=${salonId} AND "fecha"=${fecha}
      FOR UPDATE SKIP LOCKED
    `;
    if (conflicto.length > 0) throw new ConflictoError();
    return await tx.reserva.create(...);
  });
};
```

---

### 🔴 BUG #002: Toast/Error message no muestra en conflicto 409

**Síntoma:** User ve spinner infinito cuando 409, sin feedback

**Causa:** 
- mutation.onError no maneja correctly
- O error.status no accesible en mutation error handler

**Cómo detectar:**
- Trigger 409 (Flujo 3)
- Abrir DevTools → Network, ver 409
- Pero user no ve toast ❌

**Cómo resolver:**
```typescript
// En FormularioReserva.tsx:
const createReservaMutation = useMutation({
  ...
  onError: (error: Error) => {
    // Error.message debe contener el texto del servidor
    if (error.message.includes("reservado")) {
      showErrorToast("Ese horario acaba de ser reservado");
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
    }
  }
});
```

---

### 🔴 BUG #003: CalendarioSalon no refetcha después de POST

**Síntoma:** Después de crear reserva, click en "Nueva otra", calendario sigue mostrando slots como libres

**Causa:** 
- React Query no invalidó la query de disponibilidad
- O queryKey no matches

**Cómo detectar:**
- Crear reserva exitosa (FLUJO 2)
- Click "Nueva reserva" para MISMO salón MISMA fecha
- Check: ¿los slots nuevos aparecen OCUPADOS?

**Cómo resolver:**
```typescript
// En FormularioReserva.tsx mutation.onSuccess:
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['disponibilidad', selectedSalon, format(selectedDate, 'yyyy-MM-dd')]
  });
  // Force refetch
  queryClient.refetchQueries({ queryKey: ['disponibilidad'] });
}
```

---

### 🔴 BUG #004: 401 Unauthorized pero user no redirige a login

**Síntoma:** User hace request sin session, obtiene 401, pero sigue en dashboard

**Causa:** 
- Middleware no working o placement incorrecto
- O middleware.ts no intercepta rutas protegidas

**Cómo detectar:**
- Logout
- Acceder a `/dashboard/reservas`
- Check: ¿redirige a `/login`?

**Cómo resolver:**
```typescript
// En middleware.ts:
import { auth } from '@/lib/auth';

export const middleware = async (request: NextRequest) => {
  const session = await auth();
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
};

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
```

---

### 🔴 BUG #005: PROFESOR puede acceder a `/admin`

**Síntoma:** Role-based access control no funciona

**Causa:** 
- Layout o route handler no verifica role
- O sessionProvider no incluye role en token

**Cómo detectar:**
- Login como PROFESOR
- Intentar `/dashboard/admin`
- Check: ¿aparece el panel admin?

**Cómo resolver:**
```typescript
// En app/(dashboard)/admin/page.tsx:
export default function AdminPage() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  // ... render panel
}
```

---

### 🔴 BUG #006: Slots nunca se actualizan en CalendarioSalon (refetchInterval no funciona)

**Síntoma:** Otro profesor reservó un slot, pero tu calendario no lo muestra como ocupado

**Causa:** 
- refetchInterval 60s no configurado
- O query nunca se auto-refetch

**Cómo detectar:**
- PROFESOR 1 crea reserva (FLUJO 2)
- PROFESOR 2 abre calendario MISMO salón MISMA fecha en OTRA ventana
- Espera 2 min
- Check: ¿aparecen los nuevos slots como ocupados?

**Cómo resolver:**
```typescript
// En components/reservas/CalendarioSalon.tsx:
const { data: slots } = useQuery({
  queryKey: ['disponibilidad', salonId, fecha],
  queryFn: fetchDisponibilidad,
  refetchInterval: 60 * 1000,  // <-- NECESARIO
  staleTime: 30 * 1000,
});
```

---

### 🔴 BUG #007: Prisma migration falla en BD staging

**Síntoma:** Deploy en Vercel OK, pero cuando POST /api/reservas, error 500 "Column no existe"

**Causa:** 
- Migration no ejecutada en BD staging
- O schema.prisma con typo en nombre de columna

**Cómo detectar:**
- Flujo 2 falla en staging con 500
- Check Vercel logs

**Cómo resolver:**
```bash
# En staging:
DATABASE_URL="[staging connection]"  npx prisma migrate deploy
# O si no hay migrations:
npx prisma migrate dev --name [name]
```

---

### 🔴 BUG #008: Password validation no rechaza contraseñas débiles

**Síntoma:** User puede registrarse con "123" (muy corta)

**Causa:** 
- Zod schema no valida requirements o regex incorrecto
- O frontend valida pero backend no

**Cómo detectar:**
- FLUJO 1: Intentar registrar con password="123"
- Check: ¿redirige a register de nuevo con error?

**Cómo resolver:**
```typescript
// En lib/validations/usuario.schema.ts:
password: z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener mayúscula')
  .regex(/[0-9]/, 'Debe contener número')
  .regex(/[!@#$%^&*]/, 'Debe contener carácter especial')
```

---

### 🔴 BUG #009: Calendario en mobile (375px) no responsive, slots ilegibles

**Síntoma:** EnMobile, CalendarioSalon grid no cabe en pantalla, texto pequeño ilegible

**Causa:** 
- Grid configurado a 4 columnas siempre
- O padding/margin muy grande

**Cómo detectar:**
- Abrir DevTools responsive mode 375px
- Navegar a FLUJO 2 Paso 2 (Calendario)
- Check: ¿slots caben? ¿texto legible?

**Cómo resolver:**
```typescript
// En CalendarioSalon.tsx:
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 sm:gap-2">
  // Ahora: 2 cols mobile, 4 sm, 8 lg
</div>
```

---

### 🔴 BUG #010: Form validation errors no mostrados (RHF + Zod)

**Síntoma:** User intenta crear reserva sin nombre de clase, form submits sin error

**Causa:** 
- useForm no ejecuta validación
- O errors object no connected a campos

**Cómo detectar:**
- FLUJO 2 Paso 3: dejar "Nombre de clase" en blanco
- Click "Confirmar reserva"
- Check: ¿error rojo bajo el campo?

**Cómo resolver:**
```typescript
// En FormularioReserva.tsx:
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),  // <-- NECESARIO
});

// En template:
<input {...register('nombreClase')} />
{errors.nombreClase && (
  <p className="text-red-600 text-xs">{errors.nombreClase.message}</p>
)}
```

---

## ✅ VERIFICACIÓN FINAL

Cuando termines los 6 flujos, usa este checklist:

```
CRITERIOS DE SALIDA — FASE 6

☐ Flujo 1 (Registro) — ✅ PASO
☐ Flujo 2 (Reserva exitosa) — ✅ PASO
☐ Flujo 3 (Conflicto 409) — ✅ PASO (crítico)
☐ Flujo 4 (Cancelación) — ✅ PASO
☐ Flujo 5 (Admin) — ✅ PASO
☐ Flujo 6 (Protección rutas) — ✅ PASO

BUGS ENCONTRADOS:
☐ Síntomas de bugs comunes buscados activamente
☐ Todos los bugs documentados con plantilla
☐ Bugs alta/media severidad resueltos
☐ Bugs baja severidad creados como issues

REVISIÓN DE DISEÑO:
☐ 6 pantallas revisadas contra mockups
☐ Colores correctos: Azul #2563EB, Verde #10B981, Grises
☐ Tipografía: Inter en 7 escalas
☐ Espaciado base 4px
☐ Responsive: 375px + 768px + 1280px testeados

DOCUMENTACIÓN:
☐ fase_6_resumen.md generado
☐ estado_ejecucion.md actualizado REGISTRO DE CIERRE
☐ URL staging funcional documentada
```

---

**FIN DE TAREA 1-5 de FASE 6**

Ahora continuaré con el contenido de `fase_6_resumen.md` que actualizaré basándome en los "resultados" que simularé de prudente que el usuario ejecutar estas pruebas.
