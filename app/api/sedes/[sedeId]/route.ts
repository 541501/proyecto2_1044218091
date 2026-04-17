/**
 * app/api/sedes/[sedeId]/route.ts
 *
 * GET: Obtener detalle de sede
 * PUT: Actualizar sede (solo ADMIN)
 * DELETE: Eliminar sede (solo ADMIN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores-api';
import {
  verificarAdmin,
  handleAuthError,
} from '@/lib/utils/auth';
import {
  validarBody,
  ActualizarSedeSchema,
} from '@/lib/validations';

/**
 * GET /api/sedes/[sedeId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sedeId: string } }
): Promise<NextResponse> {
  try {
    const sede = await prisma.sede.findUnique({
      where: { id: params.sedeId },
      include: {
        bloques: {
          include: {
            salones: true,
          },
        },
      },
    });

    if (!sede) {
      return notFound('Sede no encontrada');
    }

    return NextResponse.json({
      success: true,
      data: sede,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/sedes/[sedeId]
 * Actualizar sede (solo ADMIN)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { sedeId: string } }
): Promise<NextResponse> {
  try {
    await verificarAdmin();

    const data = await validarBody(
      ActualizarSedeSchema,
      req
    );

    const sede = await prisma.sede.update({
      where: { id: params.sedeId },
      data,
    });

    return NextResponse.json({
      success: true,
      data: sede,
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}

/**
 * DELETE /api/sedes/[sedeId]
 * Eliminar sede (solo ADMIN)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sedeId: string } }
): Promise<NextResponse> {
  try {
    await verificarAdmin();

    await prisma.sede.delete({
      where: { id: params.sedeId },
    });

    return NextResponse.json({
      success: true,
      message: 'Sede eliminada',
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
