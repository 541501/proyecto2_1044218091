CREATE TABLE "cuentas_autorizadas" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "nombre" TEXT,
  "rol" "Rol" NOT NULL DEFAULT 'PROFESOR',
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "registrada" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "cuentas_autorizadas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cuentas_autorizadas_email_key" ON "cuentas_autorizadas"("email");
CREATE INDEX "cuentas_autorizadas_email_activa_idx" ON "cuentas_autorizadas"("email", "activa");
