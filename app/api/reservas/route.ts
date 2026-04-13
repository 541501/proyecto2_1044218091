/**
 * app/api/reservas/route.ts
 *
 * GET: Listar reservas (propias para PROFESOR, todas para ADMIN)
 * POST: Crear nueva reserva — LÓGICA CRÍTICA TRIPLE-CAPA
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  conflict,
} from '@/lib/utils/errores-api';
import {
  verificarSesion,
  obtenerUserId,
  obtenerRolUsuario,
  handleAuthError,
} from '@/lib/utils/auth';
import {
  validarBody,
  CrearReservaSchemaRefinado,
} from '@/lib/validations';
import {
  crearReserva,
  listarReservasUsuario,
  listarTodasReservas,
} from '@/lib/services/reservas.service';
import {
  ConflictoHorarioError,
} from '@/lib/utils/errores';

/**
 * GET /api/reservas
 * - PROFESOR: Ve solo sus reservas
 * - ADMIN: Ve todas las reservas
 *
 * Query params (opcional):
 * ?estado=ACTIVA
 * ?fechaDesde=2026-04-14
 * ?fechaHasta=2026-04-20
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const sesion = await verificarSesion();
    const rol = (sesion.user as any).rol;
    const usuarioId = (sesion.user as any).id;

    const { searchParams } = new URL(req.url);
    const estado =
      (searchParams.get(
        'estado'
      ) as 'ACTIVA' | 'CANCELADA') || undefined;
    const fechaDesde =
      searchParams.get('fechaDesde') || undefined;
    const fechaHasta =
      searchParams.get('fechaHasta') || undefined;

    let reservas;

    if (rol === 'ADMIN') {
      // ADMIN ve todas
      reservas = await listarTodasReservas({
        estado,
        fechaDesde,
        fechaHasta,
      });
    } else {
      // PROFESOR ve las suyas
      reservas = await listarReservasUsuario(
        usuarioId,
        { estado, fechaDesde, fechaHasta }
      );
    }

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

/**
 * POST /api/reservas
 * Crear nueva reserva
 *
 * IMPLEMENTACIÓN DE TRIPLE CAPA ANTI-CONFLICTOS:
 * Capa 1: UI (calendario) previene conflictos en tiempo real
 * Capa 2: SERVICIO (transacción + SELECT FOR UPDATE) — aquí
 * Capa 3: BD (UNIQUE constraint) — fallback final
 *
 * Body:
 * {
 *   "salonId": "cuid...",
 *   "fecha": "2026-04-14",
 *   "horaInicio": "09:00",
 *   "horaFin": "10:00",
 *   "nombreClase": "Matemáticas I",
 *   "descripcion": "Grupo A"
 * }
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const sesion = await verificarSesion();
    const usuarioId = (sesion.user as any).id;

    // Validar body contra schema con refinamientos
    const data = await validarBody(
      CrearReservaSchemaRefinado,
      req
    );

    // Llamar al servicio que maneja la transacción atómica
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
        message:
          'Reserva creada exitosamente',
        data: reserva,
      },
      { status: 201 }
    );
  } catch (error) {
    // Capturar ConflictoHorarioError y retornar 409
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
