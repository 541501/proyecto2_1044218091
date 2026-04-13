# 🔄 ROLLBACK_PLAN.md — Plan de Rollback en Producción

**Criticidad:** 🔴 CRÍTICA — Use ONLY en caso de fallo en producción  
**Tiempo de Aplicación:** 2-5 min  
**Responsable:** DevOps / Fullstack Senior  

---

## 1. Cuándo Hacer Rollback

### Escenarios BLOQUEANTES (rollback INMEDIATO)

- ❌ App no carga (500 errors) en **>50% de requests**
- ❌ Database NO se conecta en Vercel
- ❌ Login NO funciona (auth bloqueada)
- ❌ Reservas NO se pueden crear (API error 500)
- ❌ Data corruption o pérdida de datos

### Escenarios NO-BLOQUEANTES (Hotfix en lugar de rollback)

- ⚠️ Bug visual menor (CSS, UI)
- ⚠️ Typo en mensaje de error
- ⚠️ Performance lenta (< crítico)
- ⚠️ Feature nueva tiene bug pequeño

**Criterio:** Si 10%+ de usuarios son impactados NEGATIVAMENTE → rollback. Si <5% → fix hotfix.

---

## 2. Rollback de Deploy Vercel (Rápido)

### Opción A: Revertir a Deploy Anterior (Recomendado)

**Tiempo:** ~2 min

1. **Abrir Vercel Dashboard**
   ```
   https://vercel.com/dashboard/[team]/[project]/deployments
   ```

2. **Buscar el deploy anterior** (último que funcionaba)
   - Scroll arriba en lista de deployments
   - Busca uno reciente con status "Ready" que sabes funciona

3. **Click en ese deployment**
   - Se abre detalles
   - Button PROMOTE TO PRODUCTION (o similar)

4. **Confirmar**
   ```
   ✅ Status debería cambiar a "Ready" en unos segundos
   ✅ App vuelve a estado anterior
   ```

5. **Verificar que funciona**
   ```bash
   curl https://classsport.vercel.app/api/health
   # Resultado esperado: {status: "ok", database: "connected"}
   ```

### Opción B: Force Push a Commit Anterior (Nuclear)

**Tiempo:** ~5 min (includes Git operations)

**⚠️ CUIDADO:** Solo si Opción A no funciona

1. **Git reset to working commit**
   ```bash
   # Ver commits recientes
   git log --oneline -10
   
   # Encontrar commit bueno (ej: abc123d)
   # Hacer reset
   git reset --hard abc123d
   ```

2. **Force push**
   ```bash
   git push origin main -f
   ```

3. **Vercel detectará y re-deploy**
   - Automático en ~1 min
   - Esperarlock status "Ready" en dashboard

4. **Verificar**
   ```bash
   curl https://classsport.vercel.app
   ```

---

## 3. Rollback de Base de Datos Producción

### Escenario: Data Corrupted o Pérdida de Datos

**⚠️ IMPORTANTE:** Este es el más delicado. Requiere acceso Neon.tech.

### Opción A: Neon.tech Automatic Backups (Recomendado)

Neon.tech mantiene backups automáticos de los últimos 7 días.

1. **Abrir Neon.tech Console**
   ```
   https://console.neon.tech
   ```

2. **Seleccionar proyecto ClassSport**

3. **Ir a "Branches" → branch "main"**

4. **Buscar "Backups" o "Recovery"**
   - Debería listar snapshots de los últimos días
   - Selecciona snapshot anterior a la corrupción
   - Click "Restore"

5. **Verificar BD restaurada**
   ```sql
   SELECT COUNT(*) FROM reservas;  -- Debería coincidir con backup
   ```

### Opción B: Manual Restore from SQL Dump

Si tienes backup manual guardado:

1. **Obtener archivo SQL del backup**
   ```bash
   ls -la backup-*.sql
   # ej: backup-20260413.sql
   ```

2. **Conectar a BD production**
   ```bash
   psql postgresql://user:password@ep-xyz.neon.tech/classsport_main \
       -f backup-20260413.sql
   ```

3. **Verificar datos**
   ```sql
   SELECT COUNT(*) FROM sedes;    -- Debería estar bien
   SELECT COUNT(*) FROM reservas; -- Verificar integridad
   ```

### ⚠️ Advertencia: Datos Entre Backup y Ahora

**Se PIERDEN reservas o cambios entre:**
- Última backup restaurada
- Momento presente

Ejemplo:
- Backup de 13-Apr-10:00
- Error en 13-Apr-15:00
- Reservas de 10:00-15:00 se pierden

**Decisión:** ¿Aceptable perder datos? Si no → intentar fix sin rollback DB.

---

## 4. Rollback Combinado (Full Stack)

### Pasos Simultáneos

1. **Git reset** (Opción B anterior)
   ```bash
   git reset --hard [good-commit]
   git push origin main -f
   ```

2. **Esperar Vercel re-deploy** (~2 min)

3. **Si BD también corrupta: Restaurar BD** (Opción A anterior)

4. **Verificar todo conecta**
   ```bash
   # Esperar 1 min para Vercel redeploy
   curl https://classsport.vercel.app/api/health
   ```

---

## 5. Comunicación Durante Rollback

### Equipo Interno
```
🚨 PRODUCTION INCIDENT — Rollback Iniciado

Timestamp: [fecha/hora]
Incident: [descripción breve del problema]
Action: Reverting to [commit hash / deploy hash]
ETA: 2-5 minutos
Impact: [% de usuarios sin servicio]
Status: Rolling back...
```

### Usuarios (Opcional)
- Si downtime > 5 min: Publicar status en sitio o email
- Mensaje: "Mantenimiento en progreso. Volvemos en breve."

---

## 6. Post-Rollback Investigación

### Después que está estable:

1. **Root Cause Analysis**
   - ¿Qué causó el problema?
   - ¿Code change? ¿Infrastructure? ¿Data?
   - Revisar logs en Vercel y Neon

2. **Fix Offline**
   - Crear rama `hotfix/[description]`
   - Reproducir problema localmente
   - Fix
   - Test exhaustivo (unit + e2e)

3. **Re-deploy**
   - PR hotfix → develop
   - Merge develop → main  
   - Deploy a producción normalmente

4. **Post-Mortem (Opcional)**
   - Documentar: qué pasó, por qué, cómo prevenir

---

## 7. Checklist Post-Rollback

- [ ] App carga sin errores
- [ ] Login funciona con admin user
- [ ] Puedo crear una reserva
- [ ] Conflicto de horarios detectado (409)
- [ ] Admin panel accessible
- [ ] Todos los datos visibles (sedes, salones, etc.)
- [ ] No hay console errors (DevTools F12)
- [ ] Lighthouse scores ≥ 85 (si tienes tiempo)
- [ ] Equipo notificado: SISTEMA ESTABLE

---

## 8. Comandos Rápidos de Referencia

```bash
# Ver últimos 5 commits
git log --oneline -5

# Ver logs de deployment Vercel
vercel logs --tail

# Conectar a BD production
psql "postgresql://user:pass@host/db"

# Verificar health
curl -X GET https://classsport.vercel.app/api/health

# Check commits no-matched
git status

# Force-push (⚠️ cuidado)
git push origin main -f
```

---

## 9. Prevention para el Futuro

### Evitar Necesidad de Rollback

✅ **Do:**
- Ejecutar tests localmente antes de push
- Ejecutar checklist pre-deploy completamente
- Deploy a staging primero si posible
- Monitorear alertas post-deploy por 1 hora
- Tener runbook (este documento)

❌ **Don't:**
- Push directo a main sin PR
- Skip pre-deploy checklist
- Deploy a las 3 AM sin backup plan
- Ignorar test failures

---

## 10. Escalation

### Si Rollback NO Funciona

```
🚨 CRITICAL: Rollback failed, situation escalating

1. Contact Neon.tech support (https://neon.tech/support)
2. Contact Vercel support (https://vercel.com/support)
3. Try Opción B (nuclear rollback) if not already
4. Consider manual database recovery from external backup
5. Last resort: Rebuild from production snapshot
```

**Support Contacts:**
- Neon.tech: support@neon.tech
- Vercel: support@vercel.com
- Internal: [DevOps lead phone]

---

**Plan Actualizado:** 13 Abril 2026  
**Versión:** 1.0  
**Status:** 🟢 READY TO USE (esperamos nunca necesitarlo)

