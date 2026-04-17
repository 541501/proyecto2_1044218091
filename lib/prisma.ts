import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaSchemaReady?: Promise<void>;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

async function bootstrapDatabaseSchema() {
  await prisma.$executeRawUnsafe(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Rol') THEN
    CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ESCUELA', 'PROFESOR');
  END IF;
END $$;
`);

  await prisma.$executeRawUnsafe(`
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Rol') THEN
    BEGIN
      ALTER TYPE "Rol" ADD VALUE 'ESCUELA';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
`);

  await prisma.$executeRawUnsafe(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoReserva') THEN
    CREATE TYPE "EstadoReserva" AS ENUM ('CONFIRMADA', 'CANCELADA');
  END IF;
END $$;
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "usuarios" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "rol" "Rol" NOT NULL DEFAULT 'PROFESOR',
  "escuela" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);
`);

  await prisma.$executeRawUnsafe(`
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "escuela" TEXT;
`);

  await prisma.$executeRawUnsafe(`
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_email_key" ON "usuarios"("email");
CREATE INDEX IF NOT EXISTS "usuarios_email_idx" ON "usuarios"("email");
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "sesiones" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);
`);

  await prisma.$executeRawUnsafe(`
CREATE UNIQUE INDEX IF NOT EXISTS "sesiones_sessionToken_key" ON "sesiones"("sessionToken");
CREATE INDEX IF NOT EXISTS "sesiones_userId_idx" ON "sesiones"("userId");
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "sedes" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "ubicacion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "sedes_nombre_key" ON "sedes"("nombre");
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "bloques" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "sedeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bloques_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "bloques_sedeId_nombre_key" ON "bloques"("sedeId", "nombre");
CREATE INDEX IF NOT EXISTS "bloques_sedeId_idx" ON "bloques"("sedeId");
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "salones" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "capacidad" INTEGER NOT NULL,
  "sedeId" TEXT NOT NULL,
  "bloqueId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "salones_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "salones_sedeId_nombre_key" ON "salones"("sedeId", "nombre");
CREATE INDEX IF NOT EXISTS "salones_sedeId_idx" ON "salones"("sedeId");
CREATE INDEX IF NOT EXISTS "salones_bloqueId_idx" ON "salones"("bloqueId");
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "reservas" (
  "id" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "fecha" TIMESTAMP(3) NOT NULL,
  "horaInicio" TEXT NOT NULL,
  "horaFin" TEXT NOT NULL,
  "descripcion" TEXT,
  "estado" "EstadoReserva" NOT NULL DEFAULT 'CONFIRMADA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "reservas_salonId_fecha_horaInicio_horaFin_key" ON "reservas"("salonId", "fecha", "horaInicio", "horaFin");
CREATE INDEX IF NOT EXISTS "reservas_salonId_idx" ON "reservas"("salonId");
CREATE INDEX IF NOT EXISTS "reservas_usuarioId_idx" ON "reservas"("usuarioId");
CREATE INDEX IF NOT EXISTS "reservas_fecha_idx" ON "reservas"("fecha");
`);

  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "cuentas_autorizadas" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "nombre" TEXT,
  "rol" "Rol" NOT NULL DEFAULT 'PROFESOR',
  "escuela" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "registrada" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cuentas_autorizadas_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "cuentas_autorizadas" ADD COLUMN IF NOT EXISTS "escuela" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "cuentas_autorizadas_email_key" ON "cuentas_autorizadas"("email");
CREATE INDEX IF NOT EXISTS "cuentas_autorizadas_email_activa_idx" ON "cuentas_autorizadas"("email", "activa");
`);
}

export async function ensureDatabaseSchema() {
  if (!globalForPrisma.prismaSchemaReady) {
    globalForPrisma.prismaSchemaReady = bootstrapDatabaseSchema().catch((error) => {
      globalForPrisma.prismaSchemaReady = undefined;
      throw error;
    });
  }

  return globalForPrisma.prismaSchemaReady;
}
