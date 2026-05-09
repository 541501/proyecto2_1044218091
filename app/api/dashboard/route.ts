import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

export async function GET(request: NextRequest) {
  const { user } = await withAuth(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check role authorization
  const roleCheck = withRole(['profesor', 'coordinador', 'admin'])(user);
  if (roleCheck) return roleCheck;

  // Note: In seed mode, this returns empty data. In live mode, queries Postgres.
  // For Fase 2, we return the structure without actual data.

  if (user.role === 'profesor') {
    // Professor: today's reservations + next 7 days
    return NextResponse.json(
      {
        mode: 'seed',
        todayReservations: [],
        upcomingReservations: [],
        message: 'Cargando reservas...',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }

  if (user.role === 'coordinador' || user.role === 'admin') {
    // Coordinator/Admin: today's reservation counts by block
    return NextResponse.json(
      {
        mode: 'seed',
        blockStats: [
          { blockId: 'A', blockName: 'Bloque A', activeReservations: 0, totalSlots: 18 },
          { blockId: 'B', blockName: 'Bloque B', activeReservations: 0, totalSlots: 18 },
          { blockId: 'C', blockName: 'Bloque C', activeReservations: 0, totalSlots: 18 },
        ],
        message: 'Cargando estadísticas del día...',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }

  return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
}
