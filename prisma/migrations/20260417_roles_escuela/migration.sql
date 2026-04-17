ALTER TYPE "Rol" ADD VALUE IF NOT EXISTS 'ESCUELA';

ALTER TABLE "usuarios"
ADD COLUMN "escuela" TEXT;

ALTER TABLE "cuentas_autorizadas"
ADD COLUMN "escuela" TEXT;
