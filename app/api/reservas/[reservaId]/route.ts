import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/errores-api';
import { handleAuthError, verificarSesion } from '@/lib/utils/auth';
import {
  CancelarReservaSchema,
  type CancelarReservaInput,
  validarBody,
} from '@/lib/validations';
import {
  cancelarReserva,
  obtenerReserva,
} from '@/lib/services/reservas.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: { reservaId: string } }
): Promise<NextResponse> {
  try {
    await verificarSesion();
    const reserva = await obtenerReserva(params.reservaId);

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

export async function PUT(
  req: NextRequest,
  { params }: { params: { reservaId: string } }
): Promise<NextResponse> {
  try {
    const sesion = await verificarSesion();
    const usuarioId = sesion.user.id;
    const rol = sesion.user.role;

    await validarBody<CancelarReservaInput>(CancelarReservaSchema, req);

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
