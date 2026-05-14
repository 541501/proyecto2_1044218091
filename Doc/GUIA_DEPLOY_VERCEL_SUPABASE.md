# Guía Completa: Deploy en Vercel + Setup Supabase

> Proyecto ClassSport  
> Estado: Fase 6 - Pulido Final  
> Fecha: 14 de mayo de 2026

---

## 📋 Resumen de Pasos

Tu proyecto está **100% completo** y listo para producción. Para hacerlo funcionar en Vercel:

1. **Obtener credenciales de Supabase**
2. **Configurar variables de entorno en Vercel**
3. **Esperar redeploy automático**
4. **Crear tablas en Supabase**
5. **Probar la conexión**

Tiempo estimado: **5-10 minutos**

---

## Paso 1: Obtener Credenciales de Supabase

### 1.1 Acceder a Supabase Dashboard

1. Ve a https://app.supabase.com
2. Haz login con tu cuenta
3. Selecciona tu proyecto `proyecto2_1044218091`

### 1.2 Obtener NEXT_PUBLIC_SUPABASE_URL

**Ubicación:**
- En Supabase → **Settings** → **API**
- Busca la sección **Project URL**

**Ejemplo:**
```
https://otqhrpbxhxkrhrnjqbba.supabase.co
```

**Copiar y guardar en un documento temporal**

### 1.3 Obtener NEXT_PUBLIC_SUPABASE_ANON_KEY

**Ubicación:**
- Mismo lugar: **Settings** → **API**
- Busca **anon public** key

**Ejemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWhycGJ4aHhrcmhybmpxYmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU3MTE2OTMsImV4cCI6MTk0NzI2NzY5M30.abc123xyz...
```

### 1.4 Obtener SUPABASE_SERVICE_ROLE_KEY

**⚠️ IMPORTANTE: Este es un secreto. No lo compartas ni commits en Git.**

**Ubicación:**
- **Settings** → **API**
- Busca **service_role secret** (abajo del anon key)

**Ejemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWhycGJ4aHhrcmhybmpxYmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTcxMTY5MywiZXhwIjoxOTQ3MjY3NjkzfQ.xyz789abc...
```

### 1.5 Obtener DATABASE_URL

**Ubicación:**
- **Settings** → **Database**
- Busca la sección **Connection Pooler**
- Usa la opción **Supabase CLI: Session mode** o copia directamente

**Formato esperado:**
```
postgresql://postgres.otqhrpbxhxkrhrnjqbba:your_db_password@db.otqhrpbxhxkrhrnjqbba.supabase.co:5432/postgres?sslmode=require
```

**Importante:** Cambia al final `?pgbouncer` por `?sslmode=require`

---

## Paso 2: Configurar Variables en Vercel

### 2.1 Acceder a Vercel Dashboard

1. Ve a https://vercel.com
2. Haz login
3. Selecciona proyecto **proyecto2_1044218091**
4. Ve a **Settings** → **Environment Variables**

### 2.2 Agregar Variables (Método 1: UI)

Para cada variable abajo, haz clic en "Add New":

| Variable | Valor | Ambientes |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key | Production, Preview, Development |
| `DATABASE_URL` | Tu connection string | Production, Preview, Development |

### 2.3 Agregar Variables (Método 2: CLI - Alternativo)

Si prefieres usar la terminal:

```bash
# Configurar Vercel CLI (si no lo tienes)
npm i -g vercel
vercel login

# Ir al directorio del proyecto
cd c:\Users\juanj\Documents\proyecto2_1044218091

# Agregar secretos
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL

# Redeploy
vercel redeploy --prod
```

### 2.4 Guardar y Verificar

1. Click **Save** o espera a que se agreguen con CLI
2. Vercel redeploya automáticamente (~2-3 min)
3. Verifica en **Deployments** que dice ✅ Production

---

## Paso 3: Esperar Deploy (2-3 min)

**Indicadores de que está funcionando:**

- ✅ Deployment status: "Ready"
- ✅ URL del proyecto activa (ej: https://proyecto2-1044218091.vercel.app)
- ✅ Sin logs de error en la consola

---

## Paso 4: Crear Tablas en Supabase

Una vez que Vercel esté listo:

### 4.1 Abrir Setup Database

```
https://proyecto2-1044218091.vercel.app/setup-database
```

(Reemplaza `proyecto2-1044218091` con tu dominio real de Vercel)

### 4.2 Hacer Clic en Botones (en orden)

**1️⃣ Botón: "📋 Test Connection"**

Deberías ver:
```
✅ Connected to Supabase successfully!

📊 Table Status
  users        ❌ Not found
  blocks       ❌ Not found
  slots        ❌ Not found
  rooms        ❌ Not found
  reservations ❌ Not found
```

**Si ves error:**
- ❌ Verifica que las variables de entorno estén correctas en Vercel
- ❌ Espera 1-2 minutos más (a veces demora el redeploy)
- ❌ Recarga la página (Ctrl+F5)

**2️⃣ Botón: "🗄️ Create Tables"**

La página mostrará el progreso:

```
⏳ Create users table and _migrations
⏳ Create blocks, slots, and rooms tables
⏳ Create reservations table
⏳ Create audit_entries table
⏳ Enable Row Level Security (RLS)
⏳ Create RLS policies for service_role
⏳ Notify PostgREST to reload schema
⏳ Insert seed users
⏳ Insert seed blocks
⏳ Insert seed slots
⏳ Insert seed rooms
```

Espera a que todos muestren ✅ (~30-60 segundos)

**Status Final Esperado:**
```
✅ Database setup completed successfully!
```

---

## Paso 5: Probar Funcionalidad

### 5.1 Login

Ve a: `https://tu-dominio.vercel.app/login`

**Credencial de demo:**
- Email: `admin@classsport.edu`
- Password: `Admin@2024`

### 5.2 Dashboard

Deberías ver el dashboard con roles y bloques disponibles.

### 5.3 Otros Tests

- **Bloques:** `/blocks` → Deberías ver 3 bloques de prueba
- **Reservas:** `/reservations` → Deberías poder crear reservas
- **Admin:** `/admin/db-setup` → Deberías ver las tablas creadas

---

## 📋 Checklist de Finalización

- [ ] Credenciales de Supabase obtenidas
- [ ] Variables de entorno agregadas a Vercel
- [ ] Vercel deployó exitosamente (status: Ready)
- [ ] Test Connection en `/setup-database` muestra ✅
- [ ] Create Tables completó exitosamente
- [ ] Login funciona con `admin@classsport.edu`
- [ ] Puedes navegar entre páginas sin errores
- [ ] Bloques aparecen en `/blocks`

---

## 🚨 Troubleshooting

### Error: "Failed to connect to Supabase"

**Causa:** Variables de entorno incorrectas o no configuradas

**Solución:**
1. Ve a Vercel Settings → Environment Variables
2. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén presentes
3. Copia los valores EXACTAMENTE desde Supabase (sin espacios extras)
4. Haz un redeploy manual: `vercel redeploy --prod`

### Error: "Tables not found" después de Create Tables

**Causa:** Migración SQL no ejecutó correctamente

**Solución:**
1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta manualmente los SQL de `supabase/migrations/`
3. O intenta "Create Tables" de nuevo

### Error: "Authentication failed" en login

**Causa:** JWT no está configurado

**Verificar:**
1. El archivo `lib/auth.ts` existe
2. `next.config.ts` tiene headers de seguridad
3. Las variables de entorno están disponibles en el contenedor de Vercel

---

## 📞 Contacto / Soporte

Si algo no funciona:

1. Revisa los logs de Vercel: **Deployments** → **Logs**
2. Revisa la consola del navegador (F12 → Console)
3. Verifica que tu proyecto en Supabase está activo y no limitado

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu proyecto ClassSport estará:

- ✅ Deployado en producción
- ✅ Conectado a Supabase
- ✅ Con todas las tablas creadas
- ✅ Listo para usar

**Dominio:** https://tu-proyecto.vercel.app

**Fecha de finalización:** 14 de mayo de 2026

