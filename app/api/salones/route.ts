/**
 * app/api/salones/route.ts
 *
 * GET: Listar salones (con filtros por sede/bloque) (público)
 * POST: Crear salón (solo ADMIN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
} from '@/lib/utils/errores';
import {
  verificarAdmin,
  handleAuthError,
} from '@/lib/utils/auth';
import {
  validarBody,
  CrearSalonSchema,
} from '@/lib/validations';

/**
 * GET /api/salones?sedeId=X&bloqueId=Y
 * Listar salones con filtros opcionales
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const sedeId = searchParams.get('sedeId');
    const bloqueId = searchParams.get(
      'bloqueId'
    );

    const salones = await prisma.salon.findMany({
      where: {
        ...(bloqueId && {
          bloqueId,
        }),
        ...(sedeId && !bloqueId && {
          bloque: { sedeId },
        }),
      },
      include: {
        bloque: {
          include: { sede: true },
        },
      },
      orderBy: [
        { bloque: { nombre: 'asc' } },
        { nombre: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: salones,
      count: salones.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/salones
 * Crear salón (solo ADMIN)
 *
 * Body:
 * {
 *   "nombre": "A101",
 *   "capacidad": 40,
 *   "bloqueId": "cuid..."
 * }
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse> {
  try {
    await verificarAdmin();

    const data = await validarBody(
      CrearSalonSchema,
      req
    );

    const salon = await prisma.salon.create({
      data,
      include: {
        bloque: {
          include: { sede: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: salon,
      },
      { status: 201 }
    );
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
