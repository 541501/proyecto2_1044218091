import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, notFound } from '@/lib/utils/errores-api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { salonId: string } }
): Promise<NextResponse> {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: params.salonId },
      include: {
        bloque: {
          include: { sede: true },
        },
      },
    });

    if (!salon) {
      return notFound('Salon no encontrado');
    }

    return NextResponse.json({
      success: true,
      data: salon,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
