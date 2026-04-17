import { NextResponse } from 'next/server';
import { mapearErrorPrisma } from './errores';

/**
 * Manejador unificado de errores para API Routes
 * Convierte cualquier error a NextResponse
 */
export function handleApiError(
  error: unknown
): NextResponse {
  console.error('[API Error]', error);

  const mapped = mapearErrorPrisma(error);

  return NextResponse.json(
    {
      error: mapped.message,
      code: mapped.code,
      status: mapped.status,
    },
    { status: mapped.status }
  );
}

/**
 * Helper para retornar 401 Unauthorized
 */
export function unauthorized(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: message || 'Debes estar autenticado',
      code: 'UNAUTHORIZED',
      status: 401,
    },
    { status: 401 }
  );
}

/**
 * Helper para retornar 403 Forbidden
 */
export function forbidden(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: message || 'No tienes permiso para esta acción',
      code: 'FORBIDDEN',
      status: 403,
    },
    { status: 403 }
  );
}

/**
 * Helper para retornar 404 Not Found
 */
export function notFound(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: message || 'Recurso no encontrado',
      code: 'NOT_FOUND',
      status: 404,
    },
    { status: 404 }
  );
}

/**
 * Helper para retornar 409 Conflict
 */
export function conflict(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: message || 'Conflicto de horario',
      code: 'CONFLICT',
      status: 409,
    },
    { status: 409 }
  );
}

/**
 * Helper para retornar 400 Bad Request
 */
export function badRequest(
  message?: string,
  details?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      error: message || 'Solicitud inválida',
      code: 'BAD_REQUEST',
      status: 400,
      ...(details && { details }),
    },
    { status: 400 }
  );
}
