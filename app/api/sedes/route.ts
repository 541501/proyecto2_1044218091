/**
 * app/api/sedes/route.ts
 *
 * GET: Listar todas las sedes (público)
 * POST: Crear sede (solo ADMIN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  badRequest,
} from '@/lib/utils/errores';
import {
  verificarAdmin,
  handleAuthError,
} from '@/lib/utils/auth';
import {
  validarBody,
  CrearSedeSchema,
} from '@/lib/validations';

/**
 * GET /api/sedes
 * Listar todas las sedes (público)
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const sedes = await prisma.sede.findMany({
      include: {
        bloques: {
          include: {
            salones: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: sedes,
      count: sedes.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/sedes
 * Crear nueva sede (solo ADMIN)
 *
 * Body:
 * {
 *   "nombre": "Sede Sur",
 *   "descripcion": "Campus sur",
 *   "direccion": "Av. Caracas 60-80"
 * }
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse> {
  try {
    // Verificar admin
    await verificarAdmin();

    // Validar body
    const data = await validarBody(
      CrearSedeSchema,
      req
    );

    // Crear sede
    const sede = await prisma.sede.create({
      data,
    });

    return NextResponse.json(
      {
        success: true,
        data: sede,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique')) {
      return badRequest(
        'Ya existe una sede con ese nombre'
      );
    }
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
