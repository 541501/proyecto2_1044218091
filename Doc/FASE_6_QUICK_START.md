# ⚡ FASE 6 — QUICK START EXECUTION GUIDE
## Guía Rápida de Ejecución

---

## 🎯 OBJETIVO EN 1 LÍNEA
**Ejecutar 6 flujos críticos de usuario manualmente, detectar bugs, validar seguridad y diseño.**

---

## ✅ ANTES DE EMPEZAR — CHECKLIST PRE-DEPLOYMENT

### (5 min) Paso 1: Preparar BD Staging
```bash
# Abrir Terminal / PowerShell en raíz del proyecto

# 1. Verificar Neon.tech branch "staging" existe
# URL: https://console.neon.tech → Project ClassSport → Branches

# 2. Ejecutar migraciones
npx prisma migrate deploy

# 3. Ejecutar seed (crear 2 sedes, 26 salones, 3 usuarios de prueba)
NODE_ENV=staging npx ts-node prisma/seed.ts

# Resultado esperado: "✅ Seed completado" sin errores
```

### (3 min) Paso 2: Verificar Variables.env en Staging (Vercel/Backend)
```
NEXTAUTH_URL=https://classsport-staging-[hash].vercel.app
DATABASE_URL=[Neon staging connection string]
NEXTAUTH_SECRET=[borrado por seguridad - generar si needed]
```

### (2 min) Paso 3: Deploy en Vercel
- Abrir https://vercel.com → ClassSport proyecto
- Conectar rama `develop` a entorno staging (o hacer push a develop)
- Esperar build ✅ verde "Ready"
- Copiar URL: `https://classsport-staging-[hash].vercel.app`

---

## 👥 CUENTAS DE PRUEBA

```
PROFESOR 1:
  Email: profesor1@test.edu
  Password: Password123!

PROFESOR 2:
  Email: profesor2@test.edu
  Password: Password123!

ADMIN:
  Email: admin@test.edu
  Password: AdminPass123!
```

---

## 🎬 EJECUCIÓN DE FLUJOS (6 x ~10 min cada = 60 min total)

### FLUJO 1️⃣ — REGISTRO Y PRIMER LOGIN (10 min)

**Checklist:**
- [ ] Abrir https://classsport-staging-[hash].vercel.app
- [ ] Click "Regístrate aquí"
- [ ] Ingresar: Nombre + Email único + Password (cumplir requisitos ✓✓✓✓)
- [ ] Confirmar password
- [ ] Click "Crear cuenta"
- [ ] Ver Toast ✅ verde "¡Registro exitoso!"
- [ ] Redirección a login
- [ ] Login con email/password nuevo
- [ ] Ver dashboard (nombre en header)
- [ ] Sidebar muestra opciones PROFESSOR (sin "Administración")

**Screenshot:** Capturar: página de registro + toast "¡Registro exitoso!" + dashboard

**Resultado:**  ✅ PASO / ❌ FALLÓ
- Si ❌: Anotar: qué falló exactamente + qué viste

---

### FLUJO 2️⃣ — RESERVA EXITOSA COMPLETA (10 min)

**Checklist:**
- [ ] Login PROFESOR 1 (profesor1@test.edu)
- [ ] Click "Nueva reserva"
- [ ] PASO 1: Selecciona Sede → Bloque → Salón (ej: Sede Campus A → Bloque A-1 → Salón A-101)
- [ ] Click "Siguiente"
- [ ] PASO 2: Calendario carga (16 slots visibles)
- [ ] Cambiar fecha (click flechas) a MAÑANA
- [ ] Seleccionar 2-3 slots verdes (ej: 10:00, 11:00, 12:00)
- [ ] Click "Siguiente"
- [ ] PASO 3: Ingresar "Nombre clase": "Prueba Flujo 2"
- [ ] Ingresar descripción (opcional)
- [ ] Click "Confirmar reserva"
- [ ] Ver Toast ✅ "¡Reserva creada exitosamente!"
- [ ] Redirección a `/dashboard/reservas`
- [ ] Ver nueva reserva en sección "Próximas"

**Screenshot:** PASO 1 + PASO 2 (calendario) + PASO 3 (resumen) + Toast + Mis Reservas

**Resultado:**  ✅ PASO / ❌ FALLÓ

---

### FLUJO 3️⃣ — CONFLICTO 409 (RACE CONDITION) 🔴 CRÍTICO (15 min)

**EQUIPMENT:** 2 ventanas de navegador lado a lado

**VENTANA 1 — PROFESOR 1:**
- [ ] Login profesor1@test.edu
- [ ] Nueva reserva
- [ ] Selecciona: Sede Campus A → Bloque A-2 → Salón A-201
- [ ] Mañana (13 Apr)
- [ ] Slots: 14:00, 15:00
- [ ] Nombre: "Clase Prof 1"
- [ ] Pausa AQUÍ — NO CONFIRMAR AÚN

**VENTANA 2 — PROFESOR 2:**
- [ ] Login profesor2@test.edu
- [ ] Nueva reserva
- [ ] Selecciona: Sede Campus A → Bloque A-2 → **Salón A-201** (MISMO)
- [ ] **Mañana** (MISMA FECHA)
- [ ] **Slots: 14:00, 15:00** (MISMO HORARIO)
- [ ] Nombre: "Clase Prof 2"
- [ ] Pausa AQUÍ — NO CONFIRMAR AÚN

**SINCRONIZACIÓN:**
- [ ] Ventana 1: Click "Confirmar"
- [ ] Esperar 1 seg, deberías ver Toast ✅ "¡Reserva creada exitosamente!"
- [ ] Ventana 2: Click "Confirmar" INMEDIATAMENTE (antes de 2 seg)
- [ ] CRÍTICO: Deberías ver Toast 🔴 ROJO: "Ese horario acaba de ser reservado"
- [ ] Calendario debe refrescar automáticamente (slots 14-15 pasan a GRIS)
- [ ] Prof 2 NO redirige (sigue en PASO 2)

**Validaciones Posteriores:**
- [ ] Ventana 1: Ir a Mis Reservas → Ver "Clase Prof 1" (solo 1 reserva, no duplicada)
- [ ] Ventana 2: Ir a Mis Reservas → NO ver "Clase Prof 2" (falló)
- [ ] DevTools Network: POST /api/reservas → Prof 1: Status 201, Prof 2: Status 409

**Screenshot:** Ventana 1 confirmando (✅) + Ventana 2 error 409 (🔴) + ambas Mis Reservas + Network tab

**Resultado:**  ✅ PASO (sistema previene duplicados) / ❌ FALLÓ (ambos crearon reserva)

---

### FLUJO 4️⃣ — CANCELACIÓN DE RESERVA (10 min)

**Checklist:**
- [ ] Login PROFESOR 1
- [ ] Ir a `/dashboard/reservas`
- [ ] Buscar reserva "Prueba Flujo 2" (o "Clase Prof 1" del flujo anterior)
- [ ] Click tarjeta o botón "Cancelar"
- [ ] (Si hay modal) Confirmar "Sí, cancelar"
- [ ] Ver Toast ✅ "Reserva cancelada"
- [ ] Tarjeta desaparece de "Próximas"
- [ ] Tarjeta aparece en "Historial" con badge "Cancelada"

**Validación de Liberación:**
- [ ] Nueva reserva → mismo salón → misma fecha → calendario
- [ ] Los slots previos deben estar VERDES de nuevo (libres)

**Screenshot:** Antes de cancelar + modal de confirmación + después (Historial visible) + calendario liberado

**Resultado:**  ✅ PASO / ❌ FALLÓ

---

### FLUJO 5️⃣ — ACCESO Y ACCIONES ADMIN (10 min)

**Checklist:**
- [ ] Login ADMIN (admin@test.edu)
- [ ] Sidebar debe mostrar "Administración" (último item)
- [ ] Click "Administración"
- [ ] URL = `/dashboard/admin`
- [ ] Ver 5 stats cards (Sedes, Salones, Reservas, Hoy, Canceladas)
- [ ] Números coinciden con BD (2 sedes, 26 salones, etc.)

**Acciones Admin:**
- [ ] (Si existe UI) Crear nuevo salón:
  - Sede: Sede Campus B
  - Bloque: Bloque B-1
  - Nombre: "Laboratorio Física"
  - Capacidad: 20
  - Click Crear
  - Ver Toast ✅ "Salón creado"
  - Nuevo salón aparece en grid

**Protección Admin:**
- [ ] Logout
- [ ] Login PROFESOR 1
- [ ] Intentar acceder directo a `/admin`
- [ ] Deberías ser redirigido a `/dashboard` (NO ver panel admin)

**Screenshot:** Panel admin + stats + formulario crear salón + nuevo salón creado + redirección cuando PROFESOR intenta acceder

**Resultado:**  ✅ PASO / ❌ FALLÓ

---

### FLUJO 6️⃣ — PROTECCIÓN DE RUTAS (10 min)

**Checklist:**

**6.1 — PROFESOR no accede a `/admin`**
- [ ] Login PROFESOR 1
- [ ] Abrir URL directo: https://classsport-staging-[hash].vercel.app/dashboard/admin
- [ ] Deberías ser redirigido a `/dashboard` (barra de dirección cambia a /dashboard)

**6.2 — Sin sesión no accede a `/dashboard`**
- [ ] Logout (click avatar → "Cerrar sesión")
- [ ] Abrir URL directo: https://classsport-staging-[hash].vercel.app/dashboard
- [ ] Deberías ser redirigido a `/login` (barra de dirección cambia a /login)

**6.3 — Sin sesión obtienes 401 en API**
- [ ] Sesión cerrada
- [ ] DevTools → Network tab
- [ ] Pega en Console:
  ```javascript
  fetch('https://classsport-staging-[hash].vercel.app/api/reservas')
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] Presiona Enter
- [ ] Resultado esperado: `Status: 401 Unauthorized`

**6.4 — PROFESOR no puede POST /api/sedes**
- [ ] Login PROFESOR 1
- [ ] DevTools → Network
- [ ] Console:
  ```javascript
  fetch('https://classsport-staging-[hash].vercel.app/api/sedes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: "Sede Falsa", direccion: "Test" })
  })
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] Resultado esperado: `Status: 403 Forbidden`

**Screenshot:** Redirección PROFESOR→admin, redirección sin sesión→login, Network 401, Network 403

**Resultado:**  ✅ PASO (4/4 security checks) / ❌ FALLÓ (describir cuál falló)

---

## 🐛 SI ENCUENTRAS BUGS

**Para CADA bug:**
1. Copiar la plantilla en `Doc/fase_6_checklist_y_guias.md` sección "PLANTILLA DE REPORTE"
2. Llenar BUG #[ID] completamente
3. Guardar en archivo `Doc/BUGS_ENCONTRADOS.md`
4. Anotación acerca del bug en tabla "Bugs Encontrados" de `estado_ejecucion.md`

**Prioridad:**
- 🔴 Alta (sistema no funciona, data loss, seguridad) → Arreglar antes de continuar
- 🟡 Media (funcionalidad degradada) → Anotar, continuar
- 🟢 Baja (cosmético, tacos, mensajes) → Anotar como issue

---

## ✅ DESPUÉS DE EJECUTAR LOS 6 FLUJOS

### (5 min) Completar Registro de Cierre en `estado_ejecucion.md`

```
Buscar sección "### 🟢 Registro de Cierre" y llenar:

Fecha de cierre      : [AHORA]
Hora                 : [AHORA]
Estado final         : Completada ✅ (si todos los flujos pasaron)
Flujos pasados       : [N/6] ✅
Bugs encontrados     : [Alta: N, Media: N, Baja: N] Total: N
Bugs resueltos       : [N/bugs encontrados]
URL staging final    : https://classsport-staging-[hash].vercel.app
```

### (5 min) Llenar `Doc/fase_6_resumen.md`

Copiar números de la tabla de Flujos Críticos:
- Cambiar estados ⬜ a ✅ o ❌
- Agregar bugs encontrados si los hay
- En sección "🎯 RESULTADO FINAL" verificar 6/6 FLUJOS ✅

---

## 📊 SCORING (Auto-Checklist)

| Criteria | Expected | Points |
|---|---|---|
| Flujo 1: Registro | ✅ | 1/1 |
| Flujo 2: Reserva exitosa | ✅ | 1/1 |
| Flujo 3: Conflicto 409 | ✅ | 1/1 |
| Flujo 4: Cancelación | ✅ | 1/1 |
| Flujo 5: Admin | ✅ | 1/1 |
| Flujo 6: Seguridad | ✅ | 1/1 |
| **TOTAL** | **6/6** | **6/6** |

---

## ⏱️ TIME BUDGET

```
Pre-deployment (BD + Vercel):       10 min
Flujo 1 (Registro):                 10 min
Flujo 2 (Reserva):                  10 min
Flujo 3 (Race condition):           15 min ⭐ más tiempo
Flujo 4 (Cancelación):              10 min
Flujo 5 (Admin):                    10 min
Flujo 6 (Seguridad):                10 min
Documentación post-ejecución:       10 min
─────────────────────────────────────────
TOTAL ESTIMADO:                     85 min (1h 25 min)
```

---

## 🚀 GO!

1. Abre `Doc/fase_6_checklist_y_guias.md` para detalles completos de cada flujo
2. Sigue los pasos de arriba secuencialmente
3. Captura screenshots de cada paso
4. Documenta ANY bugs encontrados
5. Al finalizar, completa registros en estado_ejecucion.md + fase_6_resumen.md

**¡Buena suerte! Fase 6 terminación = Fase 7 (Testing) se desbloquea automáticamente 🎯**
