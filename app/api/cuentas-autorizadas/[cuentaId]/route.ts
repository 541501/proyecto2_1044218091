import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, conflict, notFound } from '@/lib/utils/errores-api';
import { handleAuthError, verificarAdmin } from '@/lib/utils/auth';
import { CORREO_SUPREMO } from '@/lib/services/cuentas-autorizadas';

interface RouteContext {
  params: {
    cuentaId: string;
  };
}

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    await verificarAdmin();

    const cuenta = await prisma.cuentaAutorizada.findUnique({
      where: { id: params.cuentaId },
    });

    if (!cuenta) {
      return notFound('Cuenta autorizada no encontrada');
    }

    if (cuenta.email === CORREO_SUPREMO) {
      return conflict('No se puede eliminar la cuenta suprema');
    }

    await prisma.cuentaAutorizada.delete({
      where: { id: params.cuentaId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
