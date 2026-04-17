CREATE TYPE "Rol" AS ENUM ('ADMIN', 'PROFESOR');
CREATE TYPE "EstadoReserva" AS ENUM ('CONFIRMADA', 'CANCELADA');

CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "rol" "Rol" NOT NULL DEFAULT 'PROFESOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sesiones" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sedes" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "ubicacion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bloques" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "sedeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bloques_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "salones" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "capacidad" INTEGER NOT NULL,
  "sedeId" TEXT NOT NULL,
  "bloqueId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "salones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reservas" (
  "id" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "fecha" TIMESTAMP(3) NOT NULL,
  "horaInicio" TEXT NOT NULL,
  "horaFin" TEXT NOT NULL,
  "descripcion" TEXT,
  "estado" "EstadoReserva" NOT NULL DEFAULT 'CONFIRMADA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");
CREATE UNIQUE INDEX "sesiones_sessionToken_key" ON "sesiones"("sessionToken");
CREATE INDEX "sesiones_userId_idx" ON "sesiones"("userId");
CREATE UNIQUE INDEX "sedes_nombre_key" ON "sedes"("nombre");
CREATE UNIQUE INDEX "bloques_sedeId_nombre_key" ON "bloques"("sedeId", "nombre");
CREATE INDEX "bloques_sedeId_idx" ON "bloques"("sedeId");
CREATE UNIQUE INDEX "salones_sedeId_nombre_key" ON "salones"("sedeId", "nombre");
CREATE INDEX "salones_sedeId_idx" ON "salones"("sedeId");
CREATE INDEX "salones_bloqueId_idx" ON "salones"("bloqueId");
CREATE UNIQUE INDEX "reservas_salonId_fecha_horaInicio_horaFin_key" ON "reservas"("salonId", "fecha", "horaInicio", "horaFin");
CREATE INDEX "reservas_salonId_idx" ON "reservas"("salonId");
CREATE INDEX "reservas_usuarioId_idx" ON "reservas"("usuarioId");
CREATE INDEX "reservas_fecha_idx" ON "reservas"("fecha");

ALTER TABLE "sesiones"
ADD CONSTRAINT "sesiones_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "usuarios"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bloques"
ADD CONSTRAINT "bloques_sedeId_fkey"
FOREIGN KEY ("sedeId") REFERENCES "sedes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "salones"
ADD CONSTRAINT "salones_sedeId_fkey"
FOREIGN KEY ("sedeId") REFERENCES "sedes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "salones"
ADD CONSTRAINT "salones_bloqueId_fkey"
FOREIGN KEY ("bloqueId") REFERENCES "bloques"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reservas"
ADD CONSTRAINT "reservas_salonId_fkey"
FOREIGN KEY ("salonId") REFERENCES "salones"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reservas"
ADD CONSTRAINT "reservas_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
