# Deployment a Vercel — Setup Supabase en Producción

## Pre-requisitos

- ✅ Código pushed a GitHub (rama `main`)
- ✅ Proyecto conectado en Vercel (redeploy automático)
- ✅ Proyecto creado en Supabase

---

## Paso 1: Configurar Variables de Entorno en Vercel

### 1.1 Acceder a Vercel Dashboard

1. Ve a https://vercel.com
2. Selecciona tu proyecto (`proyecto2_1044218091`)
3. Ve a **Settings** → **Environment Variables**

### 1.2 Agregar las 3 Variables Requeridas

**De tu integración Supabase en Vercel, agrega:**

```
NEXT_PUBLIC_SUPABASE_URL         = https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY        = eyJhbG...
DATABASE_URL                     = postgresql://postgres.xxx:password@...
```

**Encontrar estos valores:**

1. **NEXT_PUBLIC_SUPABASE_URL:**
   - Supabase Dashboard → Settings → API
   - Copiar "Project URL"

2. **SUPABASE_SERVICE_ROLE_KEY:**
   - Supabase Dashboard → Settings → API
   - Copiar "service_role secret"

3. **DATABASE_URL:**
   - Supabase Dashboard → Settings → Database → Connection Pooler
   - Copiar la URL completa (con contraseña)
   - Cambiar `?pgbouncer` al final a `?sslmode=require`

### 1.3 Guardar y Redeploy

- Click **Save**
- Vercel redeploya automáticamente (espera ~2-3 min)
- Verifica el deploy en **Deployments**

---

## Paso 2: Probar Conexión en Vercel

### 2.1 Abrir /setup-database

```
https://tu-proyecto.vercel.app/setup-database
```

Deberías ver una página con:
- Botón "📋 Test Connection"
- Botón "🗄️ Create Tables"
- Sección de instrucciones

### 2.2 Click "Test Connection"

**Resultado esperado:**

```
✅ Connected to Supabase successfully!

📊 Table Status
  users        ❌ Not found
  blocks       ❌ Not found
  slots        ❌ Not found
  rooms        ❌ Not found
  reservations ❌ Not found
```

(Las tablas no existen aún, es normal)

**Si ves error "Failed to connect":**
- ❌ Verificar variables de entorno en Vercel
- ❌ Esperar a que Vercel termine el redeploy
- ❌ Recargar la página (F5)

---

## Paso 3: Crear Todas las Tablas

### 3.1 Click "Create Tables"

La página comenzará a mostrar los PASOS en tiempo real:

```
⏳ Create users table and _migrations
⏳ Create blocks, slots, and rooms tables
⏳ Create reservations table
⏳ Create audit_entries table
⏳ Enable Row Level Security (RLS)
⏳ Create RLS policies for service_role
⏳ Notify PostgREST to reload schema
⏳ Insert seed users
...
```

### 3.2 Esperar a Completación

Después de ~30-60 segundos, todos los PASOS deben mostrar ✅:

```
✅ Create users table and _migrations
✅ Create blocks, slots, and rooms tables
✅ Create reservations table
✅ Create audit_entries table
✅ Enable Row Level Security (RLS)
✅ Create RLS policies for service_role
✅ Notify PostgREST to reload schema
✅ Insert seed users
✅ Insert seed blocks
✅ Insert seed slots
✅ Insert seed rooms
```

**Status Final:**
```
✅ Database setup completed successfully!
```

### 3.3 Verificar Errores

Si algún PASO muestra ❌, verifica:

| PASO que falla | Causa probable | Solución |
|---|---|---|
| Create users table | Tabla ya existe (OK) | Verificar en Supabase Dashboard |
| Enable RLS | Tabla no existe | Revisar STEP anterior |
| Create RLS policies | Política ya existe (OK) | Usar DO $$ para idempotencia |
| NOTIFY pgrst | PostgREST no responde | Intentar de nuevo |
| Insert seed | Datos duplicados | Verifica si seed ya fue insertado |

---

## Paso 4: Verificar Tablas en Supabase

### 4.1 Supabase Dashboard

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### 4.2 Ejecutar Query de Verificación

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Resultado esperado:**
```
audit_entries
blocks
rooms
reservations
slots
users
_migrations
```

### 4.3 Verificar RLS Habilitado

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('users', 'blocks', 'slots', 'rooms', 'reservations', 'audit_entries')
ORDER BY tablename;
```

**Resultado esperado:**
```
tablename      | rowsecurity
audit_entries  | t
blocks         | t
reservations   | t
rooms          | t
slots          | t
users          | t
```

### 4.4 Verificar Datos Seed

```sql
SELECT COUNT(*) as total FROM users;
SELECT COUNT(*) as total FROM blocks;
SELECT COUNT(*) as total FROM slots;
SELECT COUNT(*) as total FROM rooms;
```

**Resultado esperado:**
```
users:    1 (admin user)
blocks:   3 (A, B, C)
slots:    6 (07:00-09:00, 09:00-11:00, ...)
rooms:    4 (A-101, A-102, B-201, C-301)
```

---

## Paso 5: Test Conexión Final en Vercel

### 5.1 Recargar /setup-database

```
https://tu-proyecto.vercel.app/setup-database
```

### 5.2 Click "Test Connection" Nuevamente

**Resultado esperado:**

```
✅ Connected to Supabase successfully!

📊 Table Status
  users        ✅ 1 rows
  blocks       ✅ 3 rows
  slots        ✅ 6 rows
  rooms        ✅ 4 rows
  reservations ✅ 0 rows
  audit_entries ✅ 0 rows
```

---

## Paso 6: Limpiar y Finalizar

### 6.1 Eliminar /setup-database (OPCIONAL)

Después de verificar que todo funciona, puedes:

**Opción A: Eliminar la página completamente**
```bash
rm -r app/setup-database
git add . && git commit -m "Remove temporary setup-database page" && git push
```

**Opción B: Proteger con autenticación**
```typescript
// Cambiar app/setup-database/page.tsx a:
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

export async function GET(request: NextRequest) {
  const { user } = await withAuth(request);
  if (!user) return redirect('/login');
  
  const roleCheck = withRole(['admin'])(user);
  if (roleCheck) return roleCheck;
  
  // ... resto del código
}
```

### 6.2 Verificar Que Todo Está Funcionando

Prueba otros endpoints:

```bash
# Test endpoint de diagnóstico (sin auth)
curl https://tu-proyecto.vercel.app/api/system/diagnose

# Test endpoint de bloques (sin auth, debería estar en seed mode)
curl https://tu-proyecto.vercel.app/api/blocks
```

---

## Solución de Problemas

| Síntoma | Causa | Solución |
|---|---|---|
| **Build falla en Vercel** | Variables de entorno faltantes | Verificar que existen en Settings → Env Variables |
| **"Supabase not configured"** | `NEXT_PUBLIC_SUPABASE_URL` no existe | Agregar en Vercel |
| **"Failed to connect to database"** | `SUPABASE_SERVICE_ROLE_KEY` incorrecto | Regenerar en Supabase Dashboard |
| **"DATABASE_URL not configured"** | Variable de entorno faltante | Agregar en Vercel |
| **"Could not find table in schema cache"** | NOTIFY pgrst falló | Reintenta "Create Tables" |
| **"relation does not exist"** | Tabla no creada | Reintenta "Create Tables" |
| **"RLS Disabled" en Dashboard** | ALTER TABLE ENABLE RLS falló | Reintenta "Create Tables" |
| **Seed data duplicado** | Ya existe en BD | Ejecuta TRUNCATE antes de reintentar |

---

## Próximos Pasos

Una vez que setup-database funciona:

1. **Eliminar la página:** `rm -r app/setup-database`
2. **Implementar dataService.ts:** Conversiones rowToEntity
3. **Crear endpoints protegidos:** Agregar `withAuth` y `withRole`
4. **Implementar auditoría:** Insertar en audit_entries
5. **Pruebas end-to-end:** Login → Crear reserva → Cancelar

---

## Checklist Final

- [ ] ✅ Variables de entorno configuradas en Vercel
- [ ] ✅ Deploy exitoso en Vercel
- [ ] ✅ /setup-database accesible sin errores
- [ ] ✅ "Test Connection" muestra "Connected"
- [ ] ✅ "Create Tables" completa todos los PASOS
- [ ] ✅ Supabase Dashboard muestra 6 tablas
- [ ] ✅ RLS habilitado en todas las tablas
- [ ] ✅ Seed data insertado (1 user, 3 blocks, 6 slots, 4 rooms)
- [ ] ✅ /setup-database eliminada o protegida

---

## URL Útiles

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Tu Proyecto en Vercel: https://tu-proyecto.vercel.app
- Setup Database: https://tu-proyecto.vercel.app/setup-database
