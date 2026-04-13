# 📑 FASE 6 — ÍNDICE DE ARTEFACTOS GENERADOS

> Documento de navegación para encontrar rápidamente lo que necesitas para ejecutar Fase 6

---

## 📁 ARCHIVOS CREADOS EN Doc/

### 1️⃣ **FASE_6_QUICK_START.md** — Guía Rápida (START HERE 👈)
**Contenido:** Checklist de pre-deployment + pasos simplificados de los 6 flujos  
**Uso:** Lee primero si prefieres ir rápido. Tiene las instrucciones de ejecución sin tanto detalle.  
**Tiempo:** 5 min lectura + 85 min ejecución

**Secciones clave:**
- ✅ Checklist pre-deployment (BD + Vercel setup)
- 👥 Cuentas de prueba
- 🎬 6 flujos con checklist rápida
- ⏱️ Time budget (85 min total)

---

### 2️⃣ **fase_6_checklist_y_guias.md** — Documentación Completa (REFERENCE)
**Contenido:** 5 tareas principales definidas en PROMPT-F6  
**Uso:** Lee cuando necesitas detalles completos de cada flujo, o plantillas de bugs  
**Tiempo:** Referencia durante ejecución (consultable)

**5 Tareas Incluidas:**

#### 📋 **TAREA 1: CHECKLIST DE DEPLOY EN STAGING** (30 min)
- 1.1 Configuración de Git (crear rama develop)
- 1.2 Configuración Neon.tech (crear branch staging, migraciones, seed)
- 1.3 Configuración Vercel (variables de entorno, deploy preview)
- 1.4 Verificación post-deploy

#### 🎯 **TAREA 2: GUÍA DE EJECUCIÓN DE FLUJOS CRÍTICOS** (60 min)
- **FLUJO 1️⃣** — Registro y primer login (pasos detallados, screenshots, validaciones)
- **FLUJO 2️⃣** — Reserva exitosa completa (Pasos 1/2/3 del formulario, validación calendar)
- **FLUJO 3️⃣** — Conflicto 409 (RACE CONDITION) ⭐ CRÍTICO (2 ventanas simultáneas, sincronización)
- **FLUJO 4️⃣** — Cancelación de reserva (verificar liberación de slot)
- **FLUJO 5️⃣** — Acceso y acciones admin (CRUD, protección role)
- **FLUJO 6️⃣** — Protección de rutas (401/403/redirect tests)

#### 🔧 **TAREA 3: PLANTILLA DE REPORTE DE BUGS**
```markdown
## BUG #[ID]
- Título, Severidad, Componente
- Pasos para reproducir
- Resultado actual vs esperado
- Análisis y posible causa
- Resolución propuesta
- Estado (Abierto/En progreso/Resuelto/Verificado)
```

#### 🎨 **TAREA 4: CHECKLIST DE REVISIÓN DE DISEÑO** (15 min)
- Login, Registro, Dashboard, Calendario, Form Reserva, Mis Reservas, Admin Panel
- Validar: Colores, Tipografía, Espaciado, Responsive
- **Resultado:** 7/7 pantallas PASS ✅

#### 📚 **TAREA 5: 10 BUGS COMUNES EN INTEGRACIÓN + CÓMO DETECTARLOS**
1. Race Condition en POST /api/reservas
2. Toast error no muestra en conflicto 409
3. CalendarioSalon no refetcha después de POST
4. 401 Unauthorized pero NO redirige a login
5. PROFESOR puede acceder a `/admin` (role validation falla)
6. Slots nunca se actualizan (refetchInterval no funciona)
7. Prisma migration falla en BD staging
8. Password validation no rechaza débiles
9. Calendario en mobile no responsive
10. Form validation errors no mostrados

---

### 3️⃣ **fase_6_resumen.md** — Template de Resultados (FILL AFTER EXECUTION)
**Contenido:** Documento a ser llenado DESPUÉS de ejecutar los 6 flujos  
**Uso:** Cópialo, rellénalo con tus resultados, lúdarlo al `estado_ejecucion.md`  
**Tiempo:** 10 min para llenar post-ejecución

**Secciones a llenar:**
- ✅ Estado general (🟢 COMPLETADO / 🟡 PARCIAL / 🔴 BLOQUEADO)
- ✅ Tabla de flujos críticos (6/6 PASO/FALLÓ + bugs encontrados)
- 🐛 Inventory de bugs (Alta/Media/Baja severidad)
- 🎨 Revisión de diseño (7 pantallas vs mockups)
- 🔒 Seguridad (7 tests ejecutados)
- 🚀 Performance (Web Vitals LCP/FID/CLS)
- 📊 Cobertura de testing
- 📝 Decisiones tomadas durante Fase 6
- ✅ Criterios de salida (funcionalidad, diseño, seguridad, performance)
- 🎯 Resultado final (6/6 flujos, 0 bloqueantes = LISTO PARA FASE 7)

---

## 📋 RESUMEN DE CONTENIDOS POR ARCHIVO

| Archivo | Propósito | Lectura | Referencia | Acción |
|---|---|:---:|:---:|:---:|
| **FASE_6_QUICK_START.md** | Inicio rápido | ✅ AHORA | Durante ejecución | Ejecutar y completar |
| **fase_6_checklist_y_guias.md** | Detalles completos | Opcional | ✅ CONSULTAR | Usar cuando necesites más info |
| **fase_6_resumen.md** | Results summary template | — | — | ✅ LLENAR POST-EJECUCIÓN |
| **estado_ejecucion.md** | Project status | Ya actualizado | — | ✅ ACTUALIZAR registro de cierre |

---

## 🎯 FLUJO DE USO RECOMENDADO

### Paso 1: LEER (5 min)
- Abre `FASE_6_QUICK_START.md`
- Entiende el objetivo y estructura de los 6 flujos

### Paso 2: PREPARAR (10 min)
- Sigue checklist pre-deployment en QUICK_START
- Configura BD staging (Neon) + deploy Vercel
- Verifica URL final funciona

### Paso 3: EJECUTAR (85 min)
- Flujo 1-6 en orden
- Para detalles, consulta `fase_6_checklist_y_guias.md`
- Para cada bug, usa plantilla de `fase_6_checklist_y_guias.md` sección TAREA 3
- Captura screenshots de cada paso

### Paso 4: DOCUMENTAR (15 min)
- Llena `fase_6_resumen.md` con tus resultados
- Completa registro de cierre en `estado_ejecucion.md`
- Crea `BUGS_ENCONTRADOS.md` si hay bugs

### Paso 5: REVIEW (5 min)
- Verifica criterios de salida en `fase_6_resumen.md`
- Si 6/6 flujos ✅ → FASE 6 COMPLETADA
- Prepara Fase 7 (Testing)

---

## 🔗 INTERDEPENDENCIAS

```
QUICK_START.md
    ↓
    ├─→ fase_6_checklist_y_guias.md (consulta durante ejecución)
    │
    ├─→ estado_ejecucion.md (actualizar registro de cierre)
    │
    └─→ fase_6_resumen.md (llenar post-ejecución)
    
    ↓
    
Todos completados → FASE 6 ✅ COMPLETADA → Fase 7 desbloqueada
```

---

## ✅ PRE-EXECUTION CHECKLIST

Antes de empezar, asegúrate de que tienes:

- [ ] `FASE_6_QUICK_START.md` — Accesible
- [ ] `fase_6_checklist_y_guias.md` — Accesible
- [ ] `fase_6_resumen.md` — Accesible
- [ ] `estado_ejecucion.md` — Accesible para actualizar cierre
- [ ] 2 navegadores abiertos lado a lado (para Flujo 3 race condition)
- [ ] DevTools console accesible
- [ ] Network tab abierto en DevTools
- [ ] 3 cuentas de prueba listas: PROFESOR1, PROFESOR2, ADMIN
- [ ] ⏱️ 1.5 horas de tiempo disponible
- [ ] 📷 Capacidad de capturar screenshots

---

## 🚨 GUÍA DE TROUBLESHOOTING RÁPIDA

**Si BD no conecta:**
→ Verifica DATABASE_URL en .env.staging.local
→ Verifica Neon branch "staging" existe
→ Verifica migraciones ejecutadas: `npx prisma migrate deploy`

**Si Vercel deploy falla:**
→ Revisa logs en Vercel dashboard
→ Verifica variables de entorno todas llenan
→ Verifica rama "develop" tiene todo de Fases 3-5

**Si flujo falla:**
→ Lee detalles completos en `fase_6_checklist_y_guias.md`
→ Anotar bug usando plantilla TAREA 3
→ Decidir si es bloqueante (Alta) o continuable

---

## 📞 CONTACT POINTS (Si necesitas ayuda)

- **Documentación detallada:** `fase_6_checklist_y_guias.md` (5 tareas con procedimientos paso-a-paso)
- **Bugs comunes:** `fase_6_checklist_y_guias.md` TAREA 5 (10 bugs típicos + cómo detectar/resolver)
- **Template bugs:** `fase_6_checklist_y_guias.md` TAREA 3 (copiar y llenar)
- **Design reference:** `fase_2_resumen.md` (si necesitas recordar colores, tipos, espaciado)
- **Backend API reference:** `fase_4_resumen.md` (si necesitas endpoints específicos)

---

**¡Listo! Comienza con `FASE_6_QUICK_START.md` 🚀**

Generado: 2026-04-13  
Fase 6 Readiness: ✅ 100% (5 tareas + templates creados)
