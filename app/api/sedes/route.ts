import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, handleApiError } from '@/lib/utils/errores-api';
import { handleAuthError, verificarAdmin } from '@/lib/utils/auth';
import {
  CrearSedeSchema,
  type CrearSedeInput,
  validarBody,
} from '@/lib/validations';

export async function GET(_req: NextRequest): Promise<NextResponse> {
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await verificarAdmin();
    const data = await validarBody<CrearSedeInput>(CrearSedeSchema, req);

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
      return badRequest('Ya existe una sede con ese nombre');
    }
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
