/**
 * app/api/salones/[salonId]/route.ts
 *
 * GET: Obtener detalle del salón con capacidad y ubicación
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  notFound,
} from '@/lib/utils/errores-api';

/**
 * GET /api/salones/[salonId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { salonId: string } }
): Promise<NextResponse> {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: params.salonId },
      include: {
        bloque: {
          include: { sede: true },
        },
      },
    });

    if (!salon) {
      return notFound('Salón no encontrado');
    }

    return NextResponse.json({
      success: true,
      data: salon,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
