# 🚀 GUÍA: MERGE Y DEPLOY A PRODUCCIÓN
## Secuencia exacta de comandos Git + Vercel para deploy

**Ejecutado por:** DevOps / Fullstack Senior  
**Prerequisitos:** Pre-deploy checklist ✅, BD production setup ✅, Vercel project linked  
**Duración:** ~10 min (+ 5-10 min build en Vercel)  
**Criticidad:** 🔴 CRÍTICA — punto de no retorno

---

## 📋 PASOS

### PASO 1: Verificar Estado Local

```bash
# Step 1a: Estar en rama develop
git status
# Resultado esperado: "On branch develop"

# Step 1b: Todos los cambios committed
git status
# Resultado esperado: "working tree clean"

# Step 1c: Última versión de develop
git pull origin develop
# Resultado esperado: "Already up to date" o pull de últimos cambios

# Step 1d: Verificar que no hay conflictos
git log --oneline -5
# Resultado esperado: últimos commits visibles
```

### PASO 2: Actualizar rama main con últimos cambios de develop

```bash
# Step 2a: Cambiar a rama main
git checkout main

# Step 2b: Traer últimos cambios de remoto
git pull origin main

# Step 2c: Verificar estado
git status
# Resultado esperado: "On branch main, your branch is up to date"
```

### PASO 3: Hacer merge de develop → main

```bash
# Step 3a: Hacer merge de develop
git merge develop

# Posibles resultados:
# 1. "Fast-forward" — sin conflictos, merge automático
#    ✅ Continuar al Step 3b
# 
# 2. "Merge conflict" — hay conflictos
#    ❌ PARAR: resolver conflictos antes de continuar
#    Comandos útil para resolver:
#    - git status (ver conflictos)
#    - abrir archivos conflictivos en editor
#    - buscar secciones <<<<<<, ======, >>>>>> 
#    - elegir versión correcta
#    - git add .
#    - git commit -m "Resolve merge conflicts"

# Step 3b: Verificar merge fue exitoso
git log --oneline -3
# Resultado esperado: ver commits de develop en main
```

### PASO 4: Push a main (trigger automático de deploy)

```bash
# Step 4a: Push a main
git push origin main

# Resultado esperado:
# Counting objects: X
# Delta compression using Y
# Writing objects: Z
# Total X (delta U)
# To github.com:user/repo.git
#    [hash]  develop -> main
#
# ✅ EXITOSO: push completado

# Step 4b: Verificar push en GitHub
# Abrir https://github.com/[user]/[repo]/branches
# - main debe mostrar último commit
# - Debe desaparecer "diverged" si estaba
```

### PASO 5: Monitorear GitHub Actions CI/CD

```bash
# Step 5a: Abrir PR o commits tab en GitHub
# URL: https://github.com/[user]/[repo]

# Step 5b: Buscar el check run para el push
# Debe mostrar:
# ☑ ESLint (passing)
# ☑ TypeScript typecheck (passing)
# ☑ pnpm build (passing)
# ☑ Unit tests (passing)
# ☑ Integration tests (passing)
# etc...

# Step 5c: Esperar resultados
# Tiempo típico: 3-5 minutos
# Resultado esperado: ✅ ALL CHECKS PASSED

# Step 5d: Si algún check falla
# ❌ NO PROCEDER
# Acción: rollback, fix error, re-push
# Comandos:
git reset --hard HEAD~1  # Deshacer último commit
git push origin main -f  # Force push (CUIDADO, solo si necesario)
```

### PASO 6: Monitorear Vercel Deploy

```bash
# Step 6a: Abrir Vercel dashboard
# URL: https://vercel.com/dashboard/[team]/[project]

# Step 6b: Buscar latest deployment
# Debe mostrar:
# - Source: GitHub push to main
# - Status: Building (esperando)

# Step 6c: Esperar que status cambie a "Ready"
# Tiempo típico: 2-5 minutos
# Estados posibles:
# - Building → Initializing → Building → Ready ✅
# - Building → Error ❌

# Step 6d: Monitorear logs en Vercel
# Haz click en el deployment
# Ir a "Logs" → "Build"
# Buscar:
#   ✅ "vercel build" completado sin errores
#   ✅ "Installing dependencies"
#   ✅ "Running build scripts"
#   ✅ "Created all serverless functions"
#   ✅ Output: "Ready [X.XXs]"

# Step 6e: Si error en build
# Leer logs completos:
# - Next.js build error
# - Prisma generate error
# - Environment variable missing
# Acciones:
#   1. Revisar logs
#   2. Fix el issue localmente
#   3. git add, git commit, git push
#   4. Vercel re-triggers automáticamente
```

### PASO 7: Verificación Post-Deploy Rápida

```bash
# Step 7a: Obtener URL de production de Vercel
# Dashboard → Deployment → URL (copiar)
# Típicamente: https://classsport.vercel.app

# Step 7b: Verificar que app responde
curl https://classsport.vercel.app
# Resultado esperado: HTML del login page

# Step 7c: Verificar API endpoint
curl -X POST https://classsport.vercel.app/api/health
# Resultado esperado:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2026-04-13T23:XX:XX.000Z"
# }

# Step 7d: Abrir en navegador para UI check
# URL: https://classsport.vercel.app
# ✅ Login page carga correctamente
# ✅ No hay errores en consola (DevTools F12)
# ✅ CSS/imágenes cargan correctamente

# Step 7e: Test login
# Email: admin@classsport.edu
# Password: [tu contraseña de admin creada en BD setup]
# ✅ Login exitoso
# ✅ Redirige a /dashboard
# ✅ Ve las dos sedes (Campus A, Campus B)
```

### PASO 8: Declarar Deploy Exitoso

```bash
# Step 8a: Crear message de comunicación
MESSAGE="✅ ClassSport deployed to production!
- Status: Ready
- URL: https://classsport.vercel.app
- Deployed at: [timestamp]
- Commit: [hash]
- Environment: production"

# Step 8b: Notificar al equipo
# Slack / Email / Jira
# Mensaje incluye: URL, status, cualquier issue encontrado

# Step 8c: Crear tag en Git (opcional pero útil)
git tag -a "v1.0-production" -m "Production release v1.0"
git push origin "v1.0-production"

# Step 8d: Actualizar documentación
# README.md → URL de producción
# DEPLOYMENT.md → registro de deploy
```

---

## 🔍 TROUBLESHOOTING

### Escenario A: GitHub Actions falla

```bash
# Problema: ESLint, TypeScript, o Tests fallan en CI

# Acción 1: Verificar que no hay cambios no-committed
git status
git add .
git commit -m "Fix CI issues"

# Acción 2: Ejecutar localmente el mismo check que falló
pnpm lint           # Si ESLint falló
pnpm typecheck      # Si TypeScript falló
pnpm test:unit      # Si Unit tests fallaron

# Acción 3: Fix el error
# ... editar archivo, rebuild, test

# Acción 4: Re-push
git push origin main
```

### Escenario B: Vercel build falla

```bash
# Problema: Vercel build logs muestran error

# Acción 1: Leer logs completos en Vercel dashboard
# Click en deployment → Logs → Build

# Acción 2: Reproducir localmente
pnpm install
pnpm build
# Ver error idéntico

# Acción 3: Arreglar localmente
# ... fix

# Acción 4: Commit + Push
git add .
git commit -m "Fix Vercel build error"
git push origin main
```

### Escenario C: Deploy es "Ready" pero API no responde

```bash
# Problema: Site carga pero /api/[route] retorna 500 or timeout

# Acción 1: Verificar logs de Functions en Vercel
# Dashboard → Logs → Functions

# Acción 2: Verificar envvars están presentes
# Settings → Environment variables
# ✅ DATABASE_URL presente
# ✅ DIRECT_URL presente
# ✅ NEXTAUTH_SECRET presente

# Acción 3: Verificar BD connection
# ¿Can Vercel functions alcanzar BD?
# Aplicar IP allowlist en Neon si aplica

# Acción 4: Check logs BD
# Neon.tech → Monitoring
# ¿Connection errors?

# Acción 5: Rollback (ver PASO 9 abajo)
```

### Escenario D: Necesito hacer rollback URGENTE

```bash
# Ver ROLLBACK_PLAN.md para detalles completos

# Quick rollback (30 segundos):
git reset --hard HEAD~1
git push origin main -f

# Vercel verá el reset + lo re-deploya automáticamente
# Status vuelve al deploy anterior exitoso
```

---

## ✨ Checklist Final

- [ ] GitHub Actions: ALL GREEN ✅
- [ ] Vercel status: "Ready" ✅
- [ ] App carga en navegador ✅
- [ ] API responde correctamente ✅
- [ ] Login funciona con admin user ✅
- [ ] Base de datos accesible ✅
- [ ] Equipo notificado ✅
- [ ] URL documentada en README ✅

---

**Merge & Deploy completado:** ☐
**Ejecutado por:** _________________ (nombre)
**Fecha/Hora:** _________________
**Production URL:** https://classsport.vercel.app
**Status:** 🟢 DEPLOYED TO PRODUCTION ✅

