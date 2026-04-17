/**
 * lib/utils/auth.ts
 *
 * Utilidades de autenticacion y autorizacion para API Routes
 */

import { auth } from '@/auth';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { ForbiddenError, UnauthorizedError } from './errores';

type SessionWithUser = Session & {
  user: Session['user'] & {
    id: string;
    role: string;
  };
};

function getSessionUser(session: Session | null): SessionWithUser['user'] {
  if (!session?.user?.id || !session.user.role) {
    throw new UnauthorizedError(
      'No se encontraron los datos de usuario en la sesion'
    );
  }

  return session.user as SessionWithUser['user'];
}

export async function obtenerSesion() {
  const session = await auth();
  return session;
}

export async function verificarSesion(): Promise<SessionWithUser> {
  const session = await obtenerSesion();

  if (!session || !session.user) {
    throw new UnauthorizedError(
      'Debes estar autenticado para acceder a este recurso'
    );
  }

  getSessionUser(session);
  return session as SessionWithUser;
}

export async function obtenerUserId(): Promise<string> {
  const session = await verificarSesion();
  return getSessionUser(session).id;
}

export async function obtenerRolUsuario(): Promise<'ADMIN' | 'PROFESOR'> {
  const session = await verificarSesion();
  return getSessionUser(session).role as 'ADMIN' | 'PROFESOR';
}

export async function verificarAdmin() {
  const session = await verificarSesion();
  const role = getSessionUser(session).role;

  if (role !== 'ADMIN') {
    throw new ForbiddenError(
      'Solo administradores pueden acceder a este recurso'
    );
  }

  return session;
}

export async function verificarOwnerOAdmin(
  resourceUserId: string
): Promise<boolean> {
  const session = await verificarSesion();
  const { id: userId, role } = getSessionUser(session);

  if (role === 'ADMIN') {
    return true;
  }

  return userId === resourceUserId;
}

export function handleAuthError(error: unknown): NextResponse {
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

  throw error;
}
