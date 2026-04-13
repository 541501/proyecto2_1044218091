# ✅ CHECKLIST PRE-DEPLOY DE PRODUCCIÓN
## Verificaciones críticas ANTES de hacer merge develop → main

**Ejecutado por:** DevOps / Fullstack Senior  
**Fecha:** 13 Abril 2026  
**Duración:** ~30 min

---

## 📋 CHECKLIST PRE-DEPLOY

### A. VERIFICACIÓN DE CÓDIGO & TESTS

- [ ] **Todos los tests PASANDO localmente**
  ```bash
  pnpm test:unit       # Debe pasar 47+ tests
  pnpm test:integration # Debe pasar 8 tests
  pnpm test:e2e        # Debe pasar 11 tests (note: puede tomar 2-3 min)
  ```
  - ✅ Resultado esperado: "X tests passed"
  - ❌ Si falla: Fix bugs ANTES de continuar

- [ ] **Build SIN errores**
  ```bash
  pnpm build
  ```
  - ✅ Resultado esperado: "Compiled successfully"
  - ✅ No TypeScript errors
  - ✅ No build warnings críticos
  - ❌ Si falla: Fix TypeScript errors + rebuild

- [ ] **Lint Y format limpio**
  ```bash
  pnpm lint
  pnpm format:check
  ```
  - ✅ Resultado esperado: "No issues found"
  - ❌ Si hay errores: `pnpm format` para auto-fix

- [ ] **TypeScript strict mode**
  ```bash
  pnpm typecheck
  ```
  - ✅ Resultado esperado: "No errors"
  - ❌ Si hay errores: Fix antes de deploy

- [ ] **PR checks en GitHub pasando**
  - ✅ Ir a https://github.com/[repo]/pulls
  - ✅ Si PR develop→main abierto: verificar que CI/CD es verde
  - ✅ Todos los checks: ✅ (Lint, Test, Build)
  - ❌ Si alguno es rojo: Fix y re-push

### B. BASE DE DATOS DE PRODUCCIÓN

- [ ] **BD connectable desde Vercel**
  - ✅ DATABASE_URL válida en Vercel environment variables
  - ✅ DIRECT_URL definida (requerida para Prisma en serverless)
  - ✅ Credentials de BD production anotadas en bóveda segura

- [ ] **Migrations ejecutadas en BD production**
  ```bash
  # Este comando se ejecutará en BD production branch de Neon
  pnpm prisma migrate deploy --skip-generate
  ```
  - ✅ Resultado esperado: "All migrations completed" o "Database schema is up to date"
  - ✅ Tablas creadas: usuarios, sedes, bloques, salones, reservas
  - ❌ Si falla: Revisar error + ejecutar rollback y reintentar

- [ ] **Seed ejecutado en BD production**
  ```bash
  pnpm prisma db seed
  ```
  - ✅ Resultado esperado: "Database has been seeded"
  - ✅ Datos verificables:
    - 2 sedes (Campus A, Campus B)
    - 6 bloques (A-1, A-2, B-1, B-2, B-3, B-4)
    - 26 salones (con capacidades correctas)
    - 3+ usuarios de prueba (PROFESSOR, ADMIN roles)

- [ ] **Verificar datos BD production**
  ```sql
  -- Query verificación rápida:
  SELECT COUNT(*) as total_sedes FROM sedes;
  SELECT COUNT(*) as total_salones FROM salones;
  SELECT COUNT(*) as total_usuarios FROM usuarios;
  SELECT COUNT(*) as total_reservas FROM reservas;
  ```
  - ✅ sedes: 2
  - ✅ salones: 26
  - ✅ usuarios: 3+
  - ✅ reservas: 0 (clean slate para prod)

### C. VARIABLES DE ENTORNO

- [ ] **NEXTAUTH_SECRET generado y único (producción)**
  ```bash
  # Generar con:
  openssl rand -base64 32
  # Ejemplo output: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  ```
  - ✅ Secret copiado a Vercel environment (Production)
  - ✅ Anotado en bóveda segura
  - ✅ **NUNCA** compartir en repositorio

- [ ] **NEXTAUTH_URL correcto**
  - ✅ Vercar: `https://classsport.vercel.app` (o dominio custom real)
  - ✅ NO incluir trailing slash

- [ ] **Variables de BD verificadas en Vercel**
  - ✅ DATABASE_URL: `postgresql://...`
  - ✅ DIRECT_URL: `postgresql://...` (para serverless)
  - ✅ No expuestas en el navegador (check en DevTools Network → response headers)

- [ ] **Otras variables requeridas**
  - ✅ NODE_ENV: `production`
  - ✅ NEXTAUTH_DEBUG: `false` (production)
  - ✅ API_URL: `https://classsport.vercel.app` (self-reference)

### D. SEGURIDAD

- [ ] **API Keys & secrets NO en código**
  ```bash
  # Verificar que no hay hardcodedvalues:
  grep -r "apiKey\|secret\|password" app/ lib/ --include="*.ts" --include="*.tsx"
  # Resultado esperado: sin matches en source code
  ```

- [ ] **CORS configurado para producción ONLY**
  - ✅ middleware.ts: solo `https://classsport.vercel.app` (o dominio real)

- [ ] **Rate limiting en API Routes** (si aplica)
  - ✅ POST /api/auth/* limitado a 5 intentos por IP, 15 min

- [ ] **Contraseñas de test users cambiadas o removidas**
  - ✅ ADMIN user production tiene contraseña fuerte (20+ chars, mix case/numbers/symbols)
  - ✅ Anotada en bóveda segura, accesible solo a admins

### E. INFRASTRUCTURE & DEPLOYMENT

- [ ] **Vercel project configurado correctamente**
  - ✅ Framework Preset: Next.js
  - ✅ Build Command: `pnpm build`
  - ✅ Output Directory: `.next`
  - ✅ Install Command: `pnpm install`

- [ ] **Vercel environment variables sincronizadas**
  - ✅ Ir a Vercel Dashboard → Settings → Environment Variables
  - ✅ Production env vars set: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
  - ✅ Presionar "Deploy" para aplicar cambios

- [ ] **GitHub personal access token si aplica**
  - ✅ Si usando GitHub private repos para dependencies

- [ ] **Dominio custom configurado (si aplica)**
  - ✅ Si no: usar default `classsport.vercel.app`
  - ✅ Si sí: DNS records configurados, SSL válido

### F. MONITOREO & LOGGING

- [ ] **Vercel Analytics habilitado**
  - ✅ Dashboard → Analytics
  - ✅ Web Vitals tracking enabled

- [ ] **Error tracking configurado (si aplica)**
  - ✅ Sentry, DataDog, o similar conectado
  - ✅ DSN configurado en Vercel env

### G. BACKUP & ROLLBACK

- [ ] **Backup de BD production realizado**
  - ✅ Neon.tech: branch `main` tiene backup automático (enabled por default)
  - ✅ Branch `develop` creada como fallback (si aplica)

- [ ] **Plan de rollback definido**
  - ✅ Documentado en ROLLBACK_PLAN.md
  - ✅ Equipo familiarizado con procedimiento

### H. COMUNICACIÓN & DOCUMENTACIÓN

- [ ] **README actualizado**
  - ✅ URL de producción incluida
  - ✅ Stack tecnológico listado
  - ✅ Instrucciones de desarrollo local actualizadas

- [ ] **Guías de usuario completadas**
  - ✅ ADMIN_GUIDE.md creado y revisado
  - ✅ USER_GUIDE.md (para profesores) creado y revisado

- [ ] **Equipo notificado**
  - ✅ Stakeholders informados de go-live time
  - ✅ Support team entrenado en proceso de rollback

---

## ✨ if ALL checks ✅ PASSED: Proceder al siguiente paso (Merge & Deploy)

## ❌ If ANY check FAILED: FIX ANTES de continuar. DO NOT MERGE to main.

---

**Checklist completado:** ☐ (marcar cuando esté 100% listo)
**Ejecutado por:** _________________ (nombre)
**Fecha/Hora:** _________________ 
**Tiempo total:** ~30 min
**Status:** 🟢 LISTO PARA MERGE

