import { NextRequest, NextResponse } from 'next/server';
import { getMyReservations } from '@/lib/dataService';
import type { ReservationFilters } from '@/lib/types';

/**
 * GET /api/reservations/my
 * Retrieve the current user's reservations (professors only)
 * Query params: status, from_date, to_date
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Extract user info from token
  let userId: string;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userId = payload.userId;
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const filters: ReservationFilters = {};
  if (searchParams.has('status')) {
    filters.status = searchParams.get('status') as 'confirmada' | 'cancelada';
  }
  if (searchParams.has('from_date')) {
    filters.from_date = searchParams.get('from_date') || undefined;
  }
  if (searchParams.has('to_date')) {
    filters.to_date = searchParams.get('to_date') || undefined;
  }

  try {
    const reservations = await getMyReservations(userId, filters);
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching my reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
