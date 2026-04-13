# ✅ CHECKLIST VALIDACIÓN POST-DEPLOY
## Validación exhaustiva en URL de producción (https://classsport.vercel.app)

**Ejecutado por:** DevOps / QA  
**Prerequisitos:** Deploy completado, status "Ready" en Vercel  
**Duración:** ~30 min  
**Criticidad:** 🔴 CRÍTICA — primera validación en producción real

---

## 📋 CHECKLIST POST-DEPLOY

### A. FUNCIONALIDAD CORE — Autenticación

- [ ] **Page Login carga sin errores**
  - URL: `https://classsport.vercel.app/login`
  - Visual: Formulario email + password visible
  - CSS: Estilos aplican correctamente
  - ✅ Resultado esperado: login page responsive, sin errores

- [ ] **Login exitoso con admin @ production**
  - Email: `admin@classsport.edu`
  - Password: `[tu contraseña de producción]`
  - Click "Ingresar"
  - ✅ Resultado esperado: Redirige a `/dashboard`
  - ✅ Sidebar muestra "Administración" (admin-only)

- [ ] **Login fallido: Contraseña incorrecta**
  - Same email, wrong password
  - Click "Ingresar"
  - ✅ Resultado esperado: Toast de error "Email o contraseña incorrecta"
  - ✅ Permanece en `/login`, NO redirije

- [ ] **Login fallido: Usuario no existe**
  - Email: `nonexistent@test.com`
  - Password: `anything`
  - Click "Ingresar"
  - ✅ Resultado esperado: Toast error "Email o contraseña incorrecta"
  - ✅ Same behavior como contraseña incorrecta (security best practice)

- [ ] **Logout funciona**
  - En dashboard: click menu → "Logout" / "Cerrar sesión"
  - ✅ Resultado esperado: Redirige a `/login`
  - ✅ Session cleared (no cookie visible en DevTools)

- [ ] **Protección de rutas: URL directo /dashboard sin sesión**
  - Abrir nueva pestaña (incognito) o logout
  - Navegar a: `https://classsport.vercel.app/dashboard`
  - ✅ Resultado esperado: Redirige a `/login`

- [ ] **Protección de rutas: URL directo /admin sin sesión**
  - Same: ir a `/admin`
  - ✅ Resultado esperado: Redirige a `/login`

### B. FUNCIONALIDAD CORE — Dashboard & Sedes

- [ ] **Dashboard carga sin errores**
  - Login exitoso → URL: `/dashboard`
  - ✅ Página carga < 2 segundos
  - ✅ Sin 500 errors en consola (DevTools Network)

- [ ] **Sidebar muestra dos sedes**
  - Sidebar izquierda lista:
    - [ ] Campus A
    - [ ] Campus B
  - Click en cada sede → carga correctamente
  - ✅ Resultado esperado: Página actualiza con contenido de esa sede

- [ ] **Vista de Sede: Bloques visibles**
  - Click "Campus A" (o Campus B)
  - ✅ Resultado esperado: Lista de bloques aparece
  - ✅ Cantidad correcta (ej: 3 bloques en Campus A)
  - ✅ Nombres: A-1, A-2, A-Biblioteca (o los del seed)

- [ ] **Vista de Bloque: Salones visibles**
  - Click en un bloque (ej: A-1)
  - ✅ Resultado esperado: Lista de salones aparece
  - ✅ Cada salón muestra: nombre, capacidad, ubicación
  - ✅ Cantidad correcta (ej: 5-6 salones por bloque)

### C. FUNCIONALIDAD CORE — Crear Reserva

- [ ] **Crear nueva reserva: Acceso al formulario**
  - Click botón "Nueva Reserva" (o similar)
  - ✅ Resultado esperado: Modal/Page con formulario abre
  - ✅ Paso 1/3: Seleccionar sede + bloque + salón visible

- [ ] **Paso 1: Seleccionar Sede**
  - Select dropdown "Sede" aparece
  - Options: Campus A, Campus B
  - Select Campus A
  - ✅ Resultado esperado: Bloques de Campus A aparecen

- [ ] **Paso 1: Seleccionar Bloque**
  - Select dropdown "Bloque" aparece con bloques de Campus A
  - Select un bloque (ej: A-1)
  - ✅ Resultado esperado: Salones de ese bloque aparecen

- [ ] **Paso 1: Seleccionar Salón**
  - Select dropdown "Salón" aparece con salones del bloque
  - Select un salón (ej: A-101)
  - Click "Siguiente" o similar
  - ✅ Resultado esperado: Avanza a Paso 2/3 (Calendario)

- [ ] **Paso 2: Calendario con disponibilidad**
  - URL: todavía en proceso de reserva
  - Calendario visible (semanal o diario)
  - Slots horarios mostrados con colores:
    - Verde: disponible (clickeable)
    - Gris: ocupado (no clickeable)
  - ✅ Resultado esperado: Al menos 80% de slots verdes (sistema nuevo)

- [ ] **Paso 2: Seleccionar horario disponible**
  - Click en slot VERDE (ej: 10:00-11:00)
  - ✅ Resultado esperado: Slot se resalta (ej: borde azul, relleno claro)
  - ✅ Botón "Siguiente" habilita

- [ ] **Paso 3: Detalles de la reserva**
  - Llega a Paso 3/3
  - Campos visibles:
    - [ ] Nombre de clase (requerido)
    - [ ] Descripción (opcional)
    - [ ] Resumen (read-only): Sede + Salón + Horario
  - Ingresa "Matemáticas 101" en nombre
  - Click "Confirmar" o "Crear Reserva"
  - ✅ Resultado esperado: Toast de éxito "Reserva creada exitosamente!"
  - ✅ Redirige a página de "Mis Reservas"
  - ✅ La nueva reserva aparece en lista

- [ ] **Verificar reserva en "Mis Reservas"**
  - Página "Mis Reservas" carga
  - Tarjeta de la reserva creada visible con:
    - [ ] Nombre: "Matemáticas 101"
    - [ ] Sede: "Campus A"
    - [ ] Salón: "A-101"
    - [ ] Horario: "10:00 - 11:00"
    - [ ] Estado: "Confirmada" (green badge)
    - [ ] Botón "Cancelar"

### D. FUNCIONALIDAD CORE — Conflicto de Horarios (409)

- [ ] **Intenta crear reserva en horario ocupado**
  - Mismo salón (A-101), mismo horario (10:00-11:00)
  - Sigue flujo: Paso 1 → 2 → 3
  - Click "Confirmar"
  - ✅ Resultado esperado: Toast de ERROR "Ese horario ya está reservado"
  - ✅ HTTP Response: 409 Conflict (ver DevTools Network)
  - ✅ Permanece en formulario, NO redirije a Mis Reservas

- [ ] **Calendario se refresca post-409**
  - Después del error, el slot en Paso 2 debe estar:
  - ✅ Gris (ocupado)
  - ✅ No clickeable
  - ✅ React Query actualizó automáticamente (sin recargar página)

- [ ] **Solapamiento parcial retorna 409**
  - Crear reserva en Salón A-102, 10:30-11:30 (parcial overlap con 10:00-11:00)
  - ✅ Resultado esperado: Error 409 (conflicto parcial también bloqueado)

- [ ] **Adyacentes permitidas**
  - Crear reserva en Salón A-103, 14:00-15:00
  - ✅ Exitoso
  - Intentar crear otra en MISMO salón-misma-fecha: 15:00-16:00 (adyacente)
  - ✅ Resultado esperado: EXITOSO (fin==inicio no es conflicto)
  - Justificación: cambio de profesor permitido

### E. FUNCIONALIDAD CORE — Cancelación

- [ ] **Cancelar reserva propia**
  - En "Mis Reservas", click botón "Cancelar" de una tarjeta
  - Modal de confirmación aparece: "¿Cancelar esta reserva?"
  - Click "Sí, cancelar"
  - ✅ Resultado esperado: Toast "Reserva cancelada exitosamente"
  - ✅ Tarjeta desaparece de "Próximas Reservas"
  - ✅ Aparece en "Historial" con badge rojo "Cancelada"

- [ ] **Slot liberado vuelve a disponible**
  - Intenta reservar MISMO salón + horario de la reserva cancelada
  - Paso 2: Calendario
  - ✅ Resultado esperado: Slot es VERDE (disponible), clickeable
  - ✅ Puede crear nueva reserva exitosamente

### F. FUNCIONALIDAD CORE — Admin Features

- [ ] **Admin puede ver todas las reservas**
  - Login como admin
  - Sidebar: Click "Administración"
  - Página "/admin" carga
  - Tabla/lista "Todas las Reservas" visible
  - ✅ Resultado esperado: Muestra reservas de TODOS los usuarios
  - ✅ Columnas: Usuario, Salón, Horario, Estado, Acciones

- [ ] **Admin puede cancelar reserva de otro usuario**
  - En tabla de admin, selecciona una reserva NO del admin
  - Click botón "Cancelar"
  - Modal: "Cancelar esta reserva?" (incluye nombre del usuario)
  - Click "Sí, cancelar"
  - ✅ Resultado esperado: Toast "Cancelada por administrador"
  - ✅ Reserva actualiza a estado "Cancelada"

- [ ] **Professor NO ve botón Cancelar en reservas ajenas**
  - Login como professor (no admin)
  - Ir a "Mis Reservas"
  - Solo ve sus propias reservas
  - ✅ NO hay botón "Cancelar" visible
  - (Validación: asegurar row-level security en BD y API)

- [ ] **Professor NO puede acceder /admin**
  - Login como professor
  - Navega directamente a: `https://classsport.vercel.app/admin`
  - ✅ Resultado esperado: Redirige a `/dashboard`
  - ✅ Sidebar NO muestra "Administración"

### G. RENDIMIENTO & TÉCNICO

- [ ] **API response < 2 segundos**
  - DevTools → Network tab
  - Crear una reserva
  - XHR POST `/api/reservas` debería responder:
  - ✅ Tiempo: < 2000 ms típicamente
  - ✅ Status 201 (success) o 409 (conflict pero endpoint respondió rápido)

- [ ] **Responsividad: Mobile (375px)**
  - Abrir DevTools → Responsive Design Mode
  - Ancho: 375px (iPhone)
  - Navega por todas las páginas:
    - [ ] Login: botones clickeables, no overflow
    - [ ] Dashboard: sidebar puede minimizarse o hamburger menu
    - [ ] Formulario: inputs a tamaño apropiado, no horizontal scroll
    - [ ] Calendario: slots visible sin scroll horizontal
  - ✅ Resultado esperado: TODO legible y funcional en mobile

- [ ] **Responsividad: Tablet (768px)**
  - Ancho: 768px
  - Idem validación de mobile
  - ✅ Layout debe ser tablet-friendly

- [ ] **Responsividad: Desktop (1280px+)**
  - Ancho: 1920px
  - Máxima información visible sin scroll vertical/horizontal
  - ✅ Usa espacio disponible sin dejar sectores vacíos

- [ ] **Console limpia (DevTools)**
  - Abrir DevTools: F12 (Chrome), Elementos/Consola
  - Navega por varias páginas
  - ✅ Resultado esperado: Sin errores JavaScript
  - ✅ Warnings OK (tercer-partidos, etc.), pero sin Critical errors (rojo)
  - ✅ Sin console.error en app code

- [ ] **Network: Sin 404/500 errors**
  - Network tab
  - Toda la navegación
  - Status de requests:
    - [ ] HTML, JS, CSS: 200 (OK)
    - [ ] API requests: 200 o 201 (success), 409 (conflict esperado), nunca 500
  - ✅ Resultado esperado: Sin 404 (not found) o 500 (server error) inesperados

- [ ] **Imágenes / Assets cargan correctamente**
  - Logos, iconos, assets del sistema
  - ✅ No hay broken image icons (imagen con X)
  - ✅ Todos los recursos cargan desde CDN/Vercel

- [ ] **SSL/HTTPS funciona**
  - URL: `https://classsport.vercel.app`
  - Lock icon en navegador → "Secure"
  - Certificate válido
  - ✅ Resultado esperado: Conexión HTTPS segura (A+ en SSL Labs si aplica)

### H. SEGURIDAD

- [ ] **Credenciales NO expuestas en Network**
  - DevTools → Network → Responses
  - Ver requests a `/api/**`
  - ✅ Contraseñas NO visibles en JSON
  - ✅ Tokens JWT presentes en cookies (HttpOnly si posible)

- [ ] **CSRF tokens presentes** (si aplica NextAuth CSRF)
  - Form POST a `/api/auth/signin`
  - ✅ Token CSRF presente en headers

- [ ] **Rate limiting funcionando** (si implementado)
  - Intentar login 10 veces rápidamente con contraseña incorrecta
  - ✅ Después de N intentos: 429 Too Many Requests o error similar

### I. CONFIGURACIÓN

- [ ] **Variables de entorno NO expuestas**
  - View page source (Ctrl+U)
  - Buscar: DATABASE_URL, NEXTAUTH_SECRET, etc.
  - ✅ Resultado esperado: NO encontrados
  - ✅ Only public env vars (si hay) visibles (prefixed con NEXT_PUBLIC_)

- [ ] **NODE_ENV es 'production'**
  - Browser console: `window.location.hostname`
  - ✅ Es `classsport.vercel.app` (o dominio production)
  - (NODE_ENV no accesible desde client, pero verificable en Vercel logs)

### J. DATOS DE TESTING

- [ ] **Dataset seed verificable**
  - Sidebar: Ver ambas sedes listadas
  - [ ] Campus A
  - [ ] Campus B
  - Click en cada sede
  - [ ] Bloques de Campus A visible
  - [ ] Bloques de Campus B visible
  - [ ] Salones de cada bloque visible (26 total)
  - ✅ Cantidad matches seed (2 sedes, 6 bloques, 26 salones)

---

## ✨ RESUMEN DE VALIDACIÓN

**Total Validaciones:** 60+ items  
**Estimado Tiempo:** 25-30 minutos  

### Criterios de Salida (ALL must be ✅)

- ✅ Funcionalidad core: 100% funcionando
- ✅ Conflictos de horarios: Detectados correctamente (409)
- ✅ Admin features: Accesibles solo a ADMIN
- ✅ Rendimiento: API < 2s
- ✅ Responsividad: Mobile/Tablet/Desktop OK
- ✅ Security: Credenciales protegidas
- ✅ Database: Conectada, seed verificable
- ✅ UI/UX: Responsive, intuitive, libre de errores

### If ANY ❌: 

No proceder con post-deploy. Ejecutar rollback o hotfix según ROLLBACK_PLAN.md

---

**Validación POST-DEPLOY completada:** ☐
**Ejecutado por:** _________________ (nombre)
**Fecha/Hora:** _________________
**Production URL:** https://classsport.vercel.app
**Status:** 🟢 VALIDACIÓN EXITOSA — LISTO PARA PÚBLICO

