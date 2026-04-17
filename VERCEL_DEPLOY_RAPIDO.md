# 🚀 DEPLOY A VERCEL - INSTRUCCIONES RÁPIDAS

**Estado:** ✅ CÓDIGO PREPARADO Y EN GITHUB

---

## 3 PASOS SIMPLES

### ✅ PASO 1: Ir a Vercel y Conectar GitHub

1. Abre https://vercel.com
2. **Login** con GitHub (o crea cuenta)
3. Click **"Add New Project"**
4. Conecta tu cuenta de GitHub
5. Busca el repositorio: **`proyecto2_1044218091`**
6. Click **"Import"**

---

### ✅ PASO 2: Configurar Variables de Entorno

Vercel te pedirá agregar variables. **IMPORTANTE - Agregar TODAS estas:**

```
DATABASE_URL
DIRECT_URL  
NEXTAUTH_URL
NEXTAUTH_SECRET
NODE_ENV=production
```

**¿Dónde obtener los valores?**

| Variable | Valor | Origen |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Base de datos PostgreSQL (Neon.tech) |
| `DIRECT_URL` | `postgresql://...` | Igual que DATABASE_URL |
| `NEXTAUTH_URL` | `https://[tu-app].vercel.app` | Será el URL de Vercel |
| `NEXTAUTH_SECRET` | genera con abajo 👇 | Genera en terminal |
| `NODE_ENV` | `production` | Fijo |

**Generar NEXTAUTH_SECRET (en tu terminal):**
```bash
openssl rand -base64 32
```

Copia el output y pégalo como `NEXTAUTH_SECRET`.

---

### ✅ PASO 3: Deploy Automático

1. Vercel detectará:
   - Framework: **Next.js 14** ✅
   - Build command: **`pnpm run build`** ✅
   - Output directory: **`.next`** ✅

2. Click **"Deploy"** - Vercel compilará automáticamente

3. **Espera 3-5 minutos** ⏳

4. ✅ **¡LISTO!** Tu app estará en: `https://[nombre].vercel.app`

---

## ⚙️ SI LA BD ESTÁ VACÍA (Optional)

Después del primer deploy, ejecuta **una sola vez**:

```bash
# En tu máquina local:
pnpm prisma migrate deploy --skip-generate
pnpm prisma db seed
```

Esto creará las tablas y agregará datos de prueba.

---

## 🔑 Credenciales de Prueba (después de seed)

```
Email:    admin@classsport.local
Password: password123
```

o

```
Email:    profesor1@classsport.local  
Password: password123
```

---

## ❓ ¿QUÉ PASA SI FALLA?

**Error: "Cannot find module X"**
→ Vercel instalará dependencias automáticamente (está en package.json)

**Error: "DATABASE_URL not configured"**
→ Asegúrate de agregar la variable en Vercel Settings → Environment Variables

**Error: "NEXTAUTH_SECRET not defined"**
→ Genera uno con `openssl rand -base64 32` y agrégalo

**Error: "Prisma migration failed"**
→ Ejecuta en tu local: `pnpm prisma migrate deploy`

---

## 📊 Checklist Final

Antes de hacer click en "Deploy":

- [ ] Repositorio en GitHub: ✅ https://github.com/541501/proyecto2_1044218091
- [ ] DATABASE_URL configurado: ✅
- [ ] NEXTAUTH_SECRET generado: ✅
- [ ] NEXTAUTH_URL correcto: ✅
- [ ] NODE_ENV = production: ✅

---

## 🎉 ¡LISTO!

Tu app ClassSport estará en producción en Vercel.

**URL:** `https://[tu-app].vercel.app`

---

*Para más detalles, lee: [Doc/SOLUCION_VERCEL.md](Doc/SOLUCION_VERCEL.md)*
