import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/errores-api';
import { handleAuthError, verificarAdmin } from '@/lib/utils/auth';
import {
  CrearSalonSchema,
  type CrearSalonInput,
  validarBody,
} from '@/lib/validations';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const sedeId = searchParams.get('sedeId');
    const bloqueId = searchParams.get('bloqueId');

    const salones = await prisma.salon.findMany({
      where: {
        ...(bloqueId && { bloqueId }),
        ...(sedeId && !bloqueId && { bloque: { sedeId } }),
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await verificarAdmin();
    const data = await validarBody<CrearSalonInput>(CrearSalonSchema, req);

    const bloque = await prisma.bloque.findUnique({
      where: { id: data.bloqueId },
      select: { sedeId: true },
    });

    if (!bloque) {
      throw new Error('Bloque no encontrado');
    }

    const salon = await prisma.salon.create({
      data: {
        nombre: data.nombre,
        capacidad: data.capacidad,
        bloqueId: data.bloqueId,
        sedeId: bloque.sedeId,
      },
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
