import { NextRequest, NextResponse } from 'next/server';
import { conflict, handleApiError } from '@/lib/utils/errores-api';
import { handleAuthError, verificarSesion } from '@/lib/utils/auth';
import {
  CrearReservaSchemaRefinado,
  type CrearReservaInput,
  validarBody,
} from '@/lib/validations';
import {
  crearReserva,
  listarReservasUsuario,
  listarTodasReservas,
} from '@/lib/services/reservas.service';
import { ConflictoHorarioError } from '@/lib/utils/errores';

function normalizarEstadoReserva(estado: string | null) {
  if (!estado) {
    return undefined;
  }

  if (estado === 'ACTIVA') {
    return 'CONFIRMADA' as const;
  }

  if (estado === 'CANCELADA' || estado === 'CONFIRMADA') {
    return estado;
  }

  return undefined;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sesion = await verificarSesion();
    const rol = sesion.user.role;
    const usuarioId = sesion.user.id;

    const { searchParams } = new URL(req.url);
    const estado = normalizarEstadoReserva(searchParams.get('estado'));
    const fechaDesde = searchParams.get('fechaDesde') || undefined;
    const fechaHasta = searchParams.get('fechaHasta') || undefined;

    const reservas =
      rol === 'ADMIN'
        ? await listarTodasReservas({ estado, fechaDesde, fechaHasta })
        : await listarReservasUsuario(usuarioId, { estado, fechaDesde, fechaHasta });

    return NextResponse.json({
      success: true,
      data: reservas,
      count: reservas.length,
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
    const sesion = await verificarSesion();
    const usuarioId = sesion.user.id;
    const data = await validarBody<CrearReservaInput>(CrearReservaSchemaRefinado, req);

    const reserva = await crearReserva({
      usuarioId,
      salonId: data.salonId,
      fecha: data.fecha,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      nombreClase: data.nombreClase,
      descripcion: data.descripcion,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reserva creada exitosamente',
        data: reserva,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ConflictoHorarioError) {
      return conflict(error.message);
    }

    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
