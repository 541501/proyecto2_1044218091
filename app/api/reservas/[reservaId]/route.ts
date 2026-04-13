/**
 * app/api/reservas/[reservaId]/route.ts
 *
 * GET: Obtener detalle de una reserva
 * PUT: Cancelar una reserva (validar autorización)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
} from '@/lib/utils/errores-api';
import {
  verificarSesion,
  handleAuthError,
} from '@/lib/utils/auth';
import {
  validarBody,
  CancelarReservaSchema,
} from '@/lib/validations';
import {
  obtenerReserva,
  cancelarReserva,
} from '@/lib/services/reservas.service';

/**
 * GET /api/reservas/[reservaId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { reservaId: string } }
): Promise<NextResponse> {
  try {
    const sesion = await verificarSesion();
    const reserva = await obtenerReserva(
      params.reservaId
    );

    return NextResponse.json({
      success: true,
      data: reserva,
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
 * PUT /api/reservas/[reservaId]
 * Cancelar una reserva
 *
 * Validaciones:
 * - Usuario debe ser dueño o ADMIN
 * - Reserva debe estar ACTIVA
 *
 * Body (opcional):
 * {
 *   "razon": "Cambio de horario"
 * }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { reservaId: string } }
): Promise<NextResponse> {
  try {
    const sesion = await verificarSesion();
    const usuarioId = (sesion.user as any).id;
    const rol = (sesion.user as any).rol;

    // El body es opcional
    await validarBody(
      CancelarReservaSchema,
      req
    );

    // Cancelar (validará autorización)
    const reserva = await cancelarReserva(
      params.reservaId,
      usuarioId,
      rol === 'ADMIN'
    );

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada',
      data: reserva,
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
