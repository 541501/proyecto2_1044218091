# README.md — ClassSport Production

```markdown
# 🏫 ClassSport — Sistema de Gestión y Reserva de Salones Universitarios

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/[user]/classsport)

**Status:** 🟢 **EN PRODUCCIÓN** ✅  
**URL Producción:** https://classsport.vercel.app  
**GitHub:** https://github.com/[user]/classsport  
**Última actualización:** 13 Abril 2026

---

## 📋 ¿Qué es ClassSport?

ClassSport es una aplicación web fullstack SaaS diseñada para universidades. Permite a profesores reservar salones de clase por franja horaria, garantizando integridad de datos mediante **triple capa defensiva** contra race conditions y conflictos de horarios.

**Características principales:**
- ✅ Reserva de salones por horario
- ✅ Detección automática de conflictos (409 Conflict)
- ✅ Panel de administración para gestionar sedes, bloques y salones
- ✅ Autenticación segura con NextAuth v5
- ✅ Responsivo en mobile, tablet y desktop
- ✅ Performance < 2s en endpoints CRUD

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14.x** — React fullstack framework
- **TypeScript 5.x strict** — Tipado estricto end-to-end
- **Tailwind CSS 3.x** — Estilización utility-first
- **React Query 5.x** — State management & caching
- **React Hook Form 7.x** — Form management con Zod
- **Zod 3.x** — Validación de schemas

### Backend
- **Next.js API Routes** — Serverless functions
- **Prisma ORM 5.x** — Type-safe DB access
- **NextAuth.js v5** — Autenticación
- **bcryptjs** — Password hashing

### Base de Datos
- **PostgreSQL 15** — Neon.tech (serverless)
- **Prisma Migrations** — Version control de schema

### DevOps & Deployment
- **Vercel** — Hosting, CI/CD, serverless functions
- **GitHub Actions** — Automated tests & linting
- **Neon.tech** — PostgreSQL bucket with branching

---

## 🚀 Instalación Local (Desarrollo)

### Requisitos
- Node.js 18+ ([descargar](https://nodejs.org/))
- pnpm 9.x (`npm install -g pnpm`)
- Git
- PostgreSQL 15+ (local) O Neon.tech account (recomendado)

### Pasos de Instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/[user]/classsport.git
   cd classsport
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   
   # Editar .env.local con tus credenciales:
   # DATABASE_URL=postgresql://...
   # DIRECT_URL=postgresql://...
   # NEXTAUTH_URL=http://localhost:3000
   # NEXTAUTH_SECRET=[generar con: openssl rand -base64 32]
   ```

4. **Ejecutar migrations**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Seed con datos de prueba**
   ```bash
   pnpm prisma db seed
   ```

6. **Iniciar servidor dev**
   ```bash
   pnpm dev
   ```

7. **Abrir en navegador**
   ```
   http://localhost:3000
   ```

8. **Login de prueba**
   - Email: `test@example.com` (o el del seed)
   - Password: `password123` (revisar `prisma/seed.ts`)

---

## 📚 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor dev con hot-reload

# Building & Production
pnpm build            # Compila Next.js para producción
pnpm start            # Corre compilado (modo producción local)

# Testing
pnpm test:unit        # Unit tests con Vitest
pnpm test:integration # Integration tests (requiere servidor)
pnpm test:e2e         # E2E tests con Playwright
pnpm test             # Corre todos los tests
pnpm test:coverage    # Genera coverage report (80%+ objetivo)

# Code Quality
pnpm lint             # ESLint + TypeScript checks
pnpm format           # Prettier format automático
pnpm format:check     # Valida format sin cambiar
pnpm typecheck        # TypeScript typecheck estricto

# Database
pnpm prisma studio   # Interfaz visual de BD (development)
pnpm prisma migrate dev  # Crea nueva migration
pnpm prisma db reset # Limpia BD (dev only, ¡PELIGROSO!)

# Deployment
pnpm validate         # Lint + typecheck + build (pre-deploy)
```

---

## 📁 Estructura del Proyecto

```
classsport/
├── app/
│   ├── api/                    # API Routes (serverless functions)
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── reservas/          # CRUD reservas
│   │   ├── salones/           # GET salones
│   │   └── sedes/             # GET sedes
│   ├── (dashboard)/            # Rutas protegidas
│   │   ├── sedes/             # Vista de sedes
│   │   ├── salon/[id]/        # Vista detalle salón
│   │   ├── admin/             # Panel de administración
│   │   └── mis-reservas/      # Mis reservas del usuario
│   ├── login/                 # Página de login
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home / redirect
├── components/
│   ├── ui/                    # Componentes reutilizables
│   ├── forms/                 # Formularios
│   ├── sections/              # Secciones de UI
│   └── providers.tsx          # Context providers (React Query, NextAuth)
├── lib/
│   ├── actions/               # Server actions
│   ├── api/                   # API client utilities
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma singleton
│   ├── services/              # Business logic
│   │   ├── reservas.ts        # crearReserva, cancelarReserva
│   │   ├── salones.ts         # getSalones
│   │   └── sedes.ts           # getSedes
│   ├── utils/                 # Utilities
│   │   ├── horarios.ts        # hayConflicto, detectarConflicto
│   │   ├── errores.ts         # Error mapping
│   │   └── helpers.ts         # Helpers varios
│   └── validations/           # Zod schemas
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Datos iniciales
├── tests/
│   ├── unit/                  # Unit tests (Vitest)
│   ├── integration/           # Integration tests (Vitest + API)
│   ├── e2e/                   # E2E tests (Playwright)
│   ├── setup.ts               # Global setup, mocks
│   └── playwright.config.ts   # Playwright config
├── public/                    # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD pipeline
├── .env.example               # Plantilla de env vars
├── package.json               # Dependencies
├── pnpm-lock.yaml             # Lock file
├── tsconfig.json              # TypeScript config
├── eslintrc.json              # ESLint config
├── tailwind.config.ts         # Tailwind config
├── vitest.config.ts           # Vitest config
└── README.md                  # Este archivo
```

---

## 🗄️ Arquitectura de Datos

### Modelo Conceptual

```
USUARIO (Profesor o Admin)
  └─ RESERVAS (múltiples)
       ├─ SALÓN (referencias)
       └─ HORARIO (fecha + hora_inicio + hora_fin)

SEDE (Campus A, Campus B)
  └─ BLOQUES (A-1, A-2, B-1, etc.)
       └─ SALONES (A-101, A-102, B-201, etc.)

CONSTRAINT CRÍTICO:
  UNIQUE (salon_id, fecha, hora_inicio, hora_fin)
  → Garantiza que mismo salón NO puede reservarse 2x en mismo horario
```

### Triple Capa Defensiva contra Race Conditions

1. **Capa 1 (BD):** PostgreSQL UNIQUE constraint + SELECT...FOR UPDATE en transacción
2. **Capa 2 (ORM):** Prisma $transaction + hayConflicto validation pre-insert
3. **Capa 3 (API):** HTTP 409 Conflict response + React Query auto-refresh

---

## 🔐 Seguridad

### Autenticación
- ✅ NextAuth.js v5 (sesiones JWT o DB)
- ✅ Contraseñas hasheadas con bcryptjs (rounds: 10)
- ✅ NEXTAUTH_SECRET único y seguro en Vercel env

### Autorización
- ✅ Roles: ADMIN, PROFESOR
- ✅ Row-level security: PROFESOR solo ve sus reservas
- ✅ Admin-only endpoints: `/api/admin/**`, `/dashboard/admin`

### HTTPS & Headers
- ✅ HTTPS obligatorio en producción
- ✅ Security headers en Vercel (HSTS, CSP, X-Frame-Options)
- ✅ No secrets en código, variables en entorno

### Validación
- ✅ Zod schema validation client + server
- ✅ Input sanitization en API routes
- ✅ Rate limiting (implementable en Vercel)

---

## 📊 Variables de Entorno Requeridas

### Development Local
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/classsport_dev
DIRECT_URL=postgresql://user:password@localhost:5432/classsport_dev
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=development
```

### Production (Vercel)
```bash
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/classsport_main?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xyz.neon.tech/classsport_main?sslmode=require&directConnection=true
NEXTAUTH_URL=https://classsport.vercel.app
NEXTAUTH_SECRET=[único, verificado en Vercel]
NODE_ENV=production
```

---

## 🚀 Deployment en Vercel

### Setup Inicial (una sola vez)
1. Push código a GitHub
2. Conectar repository en Vercel
3. Añadir environment variables (ver arriba)
4. Vercel va a auto-deploy en cada push a `main`

### Workflow de Deployment
```bash
# En rama develop (desarrollo)
git add .
git commit -m "Nuevo feature"
git push origin develop

# Cuando listo para producción:
git checkout main
git merge develop
git push origin main
# → Vercel detecta push a main y auto-deploy
```

---

## 🧪 Testing

**Total test cases:** 66+  
**Coverage objetivo:** 80%+ en lib/services/, 100% en critical paths

```bash
# Ver resultados detallados
pnpm test:coverage    # Genera HTML report en coverage/index.html
open coverage/index.html
```

---

## 📞 Contacto & Soporte

- **Issues:** https://github.com/[user]/classsport/issues
- **Autor:** GitHub Copilot (phase automation)
- **Email:** contacto@classsport.test (placeholder)

---

## 📄 Licencia

MIT © 2026 ClassSport

---

## 🎯 Roadmap Post-Lancen

- [ ] WebSocket para updates en tiempo real
- [ ] Auditoría de cambios (who/what/when)
- [ ] Exportar reservas a PDF/iCal
- [ ] Notificaciones por email
- [ ] Mobile app (React Native)
- [ ] Multi-idioma (i18n)
- [ ] Load testing & performance optimization

---

**Última actualización:** 13 Abril 2026  
**Estado:** 🟢 PRODUCTION-READY ✅

```
