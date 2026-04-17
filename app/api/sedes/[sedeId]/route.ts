import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseSchema, prisma } from '@/lib/prisma';
import { handleApiError, notFound } from '@/lib/utils/errores-api';
import { handleAuthError, verificarAdmin } from '@/lib/utils/auth';
import {
  ActualizarSedeSchema,
  type ActualizarSedeInput,
  validarBody,
} from '@/lib/validations';

export async function GET(
  _req: NextRequest,
  { params }: { params: { sedeId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseSchema();
    const sede = await prisma.sede.findUnique({
      where: { id: params.sedeId },
      include: {
        bloques: {
          include: {
            salones: true,
          },
        },
      },
    });

    if (!sede) {
      return notFound('Sede no encontrada');
    }

    return NextResponse.json({
      success: true,
      data: sede,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { sedeId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseSchema();
    await verificarAdmin();
    const data = await validarBody<ActualizarSedeInput>(ActualizarSedeSchema, req);

    const sede = await prisma.sede.update({
      where: { id: params.sedeId },
      data,
    });

    return NextResponse.json({
      success: true,
      data: sede,
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { sedeId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseSchema();
    await verificarAdmin();

    await prisma.sede.delete({
      where: { id: params.sedeId },
    });

    return NextResponse.json({
      success: true,
      message: 'Sede eliminada',
    });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      return handleApiError(error);
    }
  }
}
