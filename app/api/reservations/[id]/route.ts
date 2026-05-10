import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSystemMode } from '@/lib/dataService';

/**
 * GET /api/reservations/[id]
 * Retrieve a specific reservation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reservationId } = await params;
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Extract user info from token
  let userId: string;
  let userRole: string;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userId = payload.userId;
    userRole = payload.role;
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  const mode = await getSystemMode();
  if (mode === 'seed') {
    return NextResponse.json(
      { error: 'No reservations in seed mode' },
      { status: 404 }
    );
  }

  try {
    const { data, error } = await supabase!
      .from('reservations')
      .select(
        `
        *,
        professor:professor_id (id, name, email, role, is_active, created_at),
        room:room_id (id, block_id, code, type, capacity, equipment, is_active, created_at, updated_at),
        slot:slot_id (id, name, start_time, end_time, order_index, is_active),
        cancelled_by_user:cancelled_by (id, name, email, role, is_active, created_at)
      `
      )
      .eq('id', reservationId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Professors can only view their own reservations
    if (
      userRole === 'profesor' &&
      data.professor_id !== userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to view this reservation' },
        { status: 403 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}
