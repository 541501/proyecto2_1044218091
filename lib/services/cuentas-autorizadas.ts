import { prisma } from '@/lib/prisma';

export const CORREO_SUPREMO = 'juan.gutierrez20@usa.edu.co';
export type RolAutorizado = 'ADMIN' | 'ESCUELA' | 'PROFESOR';

type CuentaAutorizadaMinima = {
  id: string;
  email: string;
  nombre: string | null;
  rol: RolAutorizado;
  escuela?: string | null;
  activa: boolean;
  registrada: boolean;
  persistida?: boolean;
};

function crearCuentaSupremaVirtual(): CuentaAutorizadaMinima {
  return {
    id: 'supremo-juan-gutierrez',
    email: CORREO_SUPREMO,
    nombre: 'Juan Gutierrez',
    rol: 'ADMIN',
    escuela: null,
    activa: true,
    registrada: false,
    persistida: false,
  };
}

export async function asegurarCuentaSuprema() {
  try {
    return await prisma.cuentaAutorizada.upsert({
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
  } catch {
    return crearCuentaSupremaVirtual();
  }
}

export async function obtenerCuentaAutorizadaPorEmail(email: string): Promise<CuentaAutorizadaMinima | null> {
  if (email === CORREO_SUPREMO) {
    return asegurarCuentaSuprema();
  }

  try {
    return await prisma.cuentaAutorizada.findUnique({
      where: { email },
    });
  } catch {
    return null;
  }
}

export function obtenerRolAutorizado(cuenta: CuentaAutorizadaMinima | null): RolAutorizado {
  if (!cuenta) {
    return 'PROFESOR';
  }

  return cuenta.email === CORREO_SUPREMO ? 'ADMIN' : cuenta.rol;
}
