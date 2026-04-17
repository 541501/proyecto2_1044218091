/**
 * lib/utils/auth.ts
 *
 * Utilidades de autenticación y autorización para API Routes
 */

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { UnauthorizedError, ForbiddenError } from './errores';

/**
 * Obtener sesión del usuario actual
 * Retorna null si no está autenticado
 */
export async function obtenerSesion() {
  const session = await auth();
  return session;
}

/**
 * Verificar que el request tiene sesión válida
 * Lanza UnauthorizedError si no
 * Retorna la sesión
 */
export async function verificarSesion(req?: NextRequest) {
  const session = await obtenerSesion();

  if (!session || !session.user) {
    throw new UnauthorizedError(
      'Debes estar autenticado para acceder a este recurso'
    );
  }

  return session;
}

/**
 * Obtener el userId de la sesión actual
 * Usado en queries para filtrar por usuario
 */
export async function obtenerUserId(): Promise<string> {
  const session = await verificarSesion();
  const userId = (session.user as any)?.id;

  if (!userId) {
    throw new UnauthorizedError(
      'No se encontró el ID de usuario en la sesión'
    );
  }

  return userId;
}

/**
 * Obtener el rol del usuario actual
 */
export async function obtenerRolUsuario(): Promise<
  'ADMIN' | 'PROFESOR'
> {
  const session = await verificarSesion();
  const rol = (session.user as any)?.rol;

  if (!rol) {
    throw new UnauthorizedError(
      'No se encontró el rol de usuario'
    );
  }

  return rol;
}

/**
 * Verificar que el usuario es ADMIN
 * Lanza ForbiddenError si es PROFESOR
 * Retorna la sesión
 */
export async function verificarAdmin() {
  const session = await verificarSesion();
  const rol = (session.user as any)?.rol;

  if (rol !== 'ADMIN') {
    throw new ForbiddenError(
      'Solo administradores pueden acceder a este recurso'
    );
  }

  return session;
}

/**
 * Verificar autorización: el usuario es dueño del recurso o es ADMIN
 * Útil para cancelar reserva propia o como admin
 */
export async function verificarOwnerOAdmin(
  resourceUserId: string
): Promise<boolean> {
  const session = await verificarSesion();
  const userId = (session.user as any)?.id;
  const rol = (session.user as any)?.rol;

  // ADMIN siempre puede
  if (rol === 'ADMIN') {
    return true;
  }

  // PROFESOR solo puede si es dueño
  if (userId === resourceUserId) {
    return true;
  }

  return false;
}

/**
 * Middleware helper: retorna 401 o 403 NextResponse
 * Usado como catch en API Routes
 */
export function handleAuthError(error: any): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'UNAUTHORIZED',
        status: 401,
      },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'FORBIDDEN',
        status: 403,
      },
      { status: 403 }
    );
  }

  throw error; // Re-throw para handleApiError
}
