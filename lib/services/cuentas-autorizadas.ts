import { prisma } from '@/lib/prisma';

export const CORREO_SUPREMO = 'juan.gutierrez20@usa.edu.co';
export type RolAutorizado = 'ADMIN' | 'PROFESOR';

type CuentaAutorizadaMinima = {
  id: string;
  email: string;
  nombre: string | null;
  rol: RolAutorizado;
  activa: boolean;
  registrada: boolean;
};

export async function asegurarCuentaSuprema() {
  return prisma.cuentaAutorizada.upsert({
    where: { email: CORREO_SUPREMO },
    update: {
      activa: true,
      rol: 'ADMIN',
      nombre: 'Juan Gutierrez',
    },
    create: {
      email: CORREO_SUPREMO,
      nombre: 'Juan Gutierrez',
      rol: 'ADMIN',
      activa: true,
      registrada: false,
    },
  });
}

export async function obtenerCuentaAutorizadaPorEmail(email: string): Promise<CuentaAutorizadaMinima | null> {
  if (email === CORREO_SUPREMO) {
    return asegurarCuentaSuprema();
  }

  return prisma.cuentaAutorizada.findUnique({
    where: { email },
  });
}

export function obtenerRolAutorizado(cuenta: CuentaAutorizadaMinima | null): RolAutorizado {
  if (!cuenta) {
    return 'PROFESOR';
  }

  return cuenta.email === CORREO_SUPREMO ? 'ADMIN' : cuenta.rol;
}
