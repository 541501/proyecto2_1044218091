# 🛢️ GUÍA: SETUP BASE DE DATOS PRODUCCIÓN
## Secuencia exacta de comandos para provisionar BD de producción en Neon.tech

**Ejecutado por:** DevOps / Fullstack Senior  
**Requisitos:** Acceso Neon.tech account + CLI local + pnpm  
**Duración:** ~15 min  
**Criticidad:** 🔴 CRÍTICA — BD de producción es source of truth

---

## 📋 PASOS

### PASO 1: Crear BD de Producción en Neon.tech

1. **Abrir Neon.tech dashboard**
   - URL: https://console.neon.tech
   - Login con tus credenciales

2. **Crear branch `main` (si no existe)**
   - Proyecto ClassSport → Branches
   - Click "Create branch" 
   - Name: `main`
   - Parent: `dev` (o crear desde scratch)
   - Guardar

3. **Obtener CONNECTION STRING de branch main**
   - Branches → main → Connection string (copy)
   - Ejemplo formato:
     ```
     postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require
     ```

4. **Obtener CONNECTION STRING DIRECT (para serverless)**
   - Same branch → "Direct Connection" (copy)
   - Ejemplo formato:
     ```
     postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require&directConnection=true
     ```

### PASO 2: Configurar ambiente local para BD production

1. **Crear archivo `.env.production.local` (LOCAL ONLY, NO en git)**
   ```bash
   cat > .env.production.local << 'EOF'
   DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require"
   DIRECT_URL="postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require&directConnection=true"
   NODE_ENV="production"
   EOF
   ```

2. **Verificar conexión a BD production**
   ```bash
   # Reemplazar con CONNECTION STRING real:
   psql "postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require" \
        -c "SELECT version();"
   ```
   - ✅ Resultado esperado: Version de PostgreSQL (ej: PostgreSQL 15.2)
   - ❌ Si "connection refused": verificar CONNECTION STRING, firewall rules

### PASO 3: Ejecutar Prisma Migrations en BD Production

```bash
# Step 3a: Verificar migraciones pendientes
DIRECT_URL=$(cat .env.production.local | grep DIRECT_URL | cut -d '"' -f 2)
DATABASE_URL=$(cat .env.production.local | grep DATABASE_URL | cut -d '"' -f 2)

export DATABASE_URL DIRECT_URL

# Step 3b: Ver migraciones pendientes (dry-run)
pnpm prisma migrate status

# Resultado esperado: "Following migrations have not yet been applied:"
# (lista de migraciones a aplicar)

# Step 3c: Aplicar migraciones
pnpm prisma migrate deploy --skip-generate

# Resultado esperado:
# ✓ Applied migration `timestamp_create_tables`
# ✓ Applied migration `timestamp_add_constraints`
# etc...
```

- ✅ Todas las migraciones aplicadas correctamente
- ❌ Si error: `pnpm prisma migrate resolve --rolled-back timestamp_xxx` + retry

### PASO 4: Ejecutar Seed en BD Production

1. **Ejecutar prisma db seed**
   ```bash
   export DATABASE_URL=$(cat .env.production.local | grep DATABASE_URL | cut -d '"' -f 2)
   export DIRECT_URL=$(cat .env.production.local | grep DIRECT_URL | cut -d '"' -f 2)
   
   pnpm prisma db seed
   ```

2. **Resultado esperado:**
   ```
   Database has been seeded.
   ✓ Created Sedes:
     - Campus A (id: uuid1)
     - Campus B (id: uuid2)
   ✓ Created Bloques: 6 bloques
   ✓ Created Salones: 26 salones
   ✓ Created Usuarios: 3 usuarios
   ```

3. **Verificar seed ejecutado**
   ```sql
   SELECT COUNT(*) FROM sedes;           -- Esperado: 2
   SELECT COUNT(*) FROM bloques;         -- Esperado: 6
   SELECT COUNT(*) FROM salones;         -- Esperado: 26
   SELECT COUNT(*) FROM usuarios;        -- Esperado: 3
   SELECT COUNT(*) FROM reservas;        -- Esperado: 0
   ```

### PASO 5: Crear Admin User Manual (Producción)

1. **Generar hash de contraseña segura**
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('TU_CONTRASEÑA_SUPER_FUERTE', 10));"
   ```
   - ✅ Copiar el hash generado

2. **Insertar Admin user en BD**
   ```sql
   INSERT INTO usuarios (
     id,
     email,
     nombre,
     password,
     rol,
     created_at,
     updated_at
   ) VALUES (
     gen_random_uuid(),
     'admin@classsport.edu',
     'Administrador ClassSport',
     '$2a$10$[HASH_DE_ARRIBA]',
     'ADMIN',
     NOW(),
     NOW()
   );
   ```

3. **Verificar admin user creado**
   ```sql
   SELECT id, email, nombre, rol FROM usuarios WHERE role = 'ADMIN';
   ```
   - ✅ Resultado: 1 fila con admin@classsport.edu

### PASO 6: Guardar Credentials de Producción

1. **Crear documento seguro con BD credentials**
   ```
   PRODUCTION DATABASE CREDENTIALS
   ==============================
   
   DATABASE_URL: postgresql://[FULL_URL]
   DIRECT_URL: postgresql://[FULL_URL_DIRECT]
   
   ADMIN USER:
   - Email: admin@classsport.edu
   - Password: [CONTRASEÑA_FUERTE]
   - Rol: ADMIN
   
   These credentials are:
   ☑ Stored in secure vault only (NOT in git, NOT in code)
   ☑ Communicated securely to authorized personel
   ☑ Backed up in disaster recovery location
   ```

2. **Upload a bóveda segura**
   - Keeper, 1Password, Azure KeyVault, etc.
   - Compartir acceso solo con DevOps team

### PASO 7: Sincronizar amb Vercel

1. **Login a Vercel dashboard**
   - https://vercel.com/dashboard

2. **ClassSport project → Settings → Environment Variables**
   - Click "Add"
   - Name: `DATABASE_URL`
   - Value: `postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require`
   - Environment: **Production**
   - Click "Save & Deploy"

3. **Add DIRECT_URL**
   - Name: `DIRECT_URL`
   - Value: `postgresql://username:password@ep-xyz.us-east-1.neon.tech/classsport_main?sslmode=require&directConnection=true`
   - Environment: **Production**
   - Click "Save & Deploy"

4. **Add NEXTAUTH_SECRET**
   - Generate: `openssl rand -base64 32`
   - Name: `NEXTAUTH_SECRET`
   - Value: [generated secret]
   - Environment: **Production**
   - Click "Save & Deploy"

5. **Add NEXTAUTH_URL**
   - Name: `NEXTAUTH_URL`
   - Value: `https://classsport.vercel.app` (or custom domain)
   - Environment: **Production**
   - Click "Save & Deploy"

6. **Verify variables in Vercel**
   - Go to Deployments → Select latest
   - Logs should show "Environment variables loaded"

### PASO 8: Verificar BD desde Vercel (Test Connection)

1. **Deploy a staging primero (opcional pero recomendado)**
   - Push a rama `staging` o `preview`
   - Vercel auto-deploy a preview environment
   - Test con BD production credentials

2. **Conectar a BD production desde Vercel function**
   - Crear test endpoint: `POST /api/health`
   - Listar cantidad de sedes

3. **El endpoint debe responder OK:**
   ```json
   {
     "status": "ok",
     "database": "connected",
     "sedes": 2,
     "salones": 26
   }
   ```

---

## ✨ Si TODO OK: BD de producción está lista ✅

## ❌ Si ALGÚN paso falla:
- Rollback: borrar datos, recrear branch, reintentar
- Soporte: contactar Neon.tech support
- NO PROCEDER al deploy hasta resolver

---

**BD Production Setup completado:** ☐
**Ejecutado por:** _________________ (nombre)
**Fecha/Hora:** _________________
**Status:** 🟢 LISTO PARA DEPLOY

