import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, conflict } from '@/lib/utils/errores-api';
import { handleAuthError, verificarAdmin } from '@/lib/utils/auth';
import { validarBody, CuentaAutorizadaSchema, type CuentaAutorizadaInput } from '@/lib/validations';
import { CORREO_SUPREMO, asegurarCuentaSuprema } from '@/lib/services/cuentas-autorizadas';

export async function GET(): Promise<NextResponse> {
  try {
    await verificarAdmin();
    await asegurarCuentaSuprema();

    const cuentas = await prisma.cuentaAutorizada.findMany({
      orderBy: [{ rol: 'asc' }, { email: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: cuentas,
      count: cuentas.length,
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await verificarAdmin();
    const data = await validarBody<CuentaAutorizadaInput>(CuentaAutorizadaSchema, req);

    if (data.email === CORREO_SUPREMO && data.rol !== 'ADMIN') {
      return conflict('El correo supremo siempre debe conservar permisos de administrador');
    }

    const existente = await prisma.cuentaAutorizada.findUnique({
      where: { email: data.email },
    });

    const cuenta = existente
      ? await prisma.cuentaAutorizada.update({
          where: { id: existente.id },
          data: {
            nombre: data.nombre ?? existente.nombre,
            rol: data.email === CORREO_SUPREMO ? 'ADMIN' : data.rol,
            escuela: data.rol === 'ESCUELA' ? data.escuela ?? existente.escuela : null,
            activa: true,
          },
        })
      : await prisma.cuentaAutorizada.create({
          data: {
            nombre: data.nombre,
            email: data.email,
            rol: data.email === CORREO_SUPREMO ? 'ADMIN' : data.rol,
            escuela: data.rol === 'ESCUELA' ? data.escuela : null,
            activa: true,
          },
        });

    return NextResponse.json(
      {
        success: true,
        data: cuenta,
      },
      { status: existente ? 200 : 201 }
    );
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
