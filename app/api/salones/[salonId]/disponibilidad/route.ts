/**
 * app/api/salones/[salonId]/disponibilidad/route.ts
 *
 * GET: Obtener disponibilidad horaria de un salón en una fecha
 *
 * Query params: ?fecha=YYYY-MM-DD
 * Retorna: array de slots disponibles
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  badRequest,
} from '@/lib/utils/errores-api';
import {
  obtenerDisponibilidad,
} from '@/lib/services/reservas.service';

/**
 * GET /api/salones/[salonId]/disponibilidad?fecha=2026-04-14
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { salonId: string } }
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');

    if (!fecha) {
      return badRequest(
        'Query param "fecha" requerido (YYYY-MM-DD)'
      );
    }

    // Validar formato fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return badRequest(
        'Formato de fecha inválido (YYYY-MM-DD)'
      );
    }

    const slots =
      await obtenerDisponibilidad(
        params.salonId,
        fecha
      );

    return NextResponse.json({
      success: true,
      data: {
        salonId: params.salonId,
        fecha,
        slotsDisponibles: slots,
        count: slots.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
