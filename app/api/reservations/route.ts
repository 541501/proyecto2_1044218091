import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import {
  getReservations,
  createReservation,
} from '@/lib/dataService';
import { createReservationSchema } from '@/lib/schemas';
import type { ReservationFilters } from '@/lib/types';

/**
 * GET /api/reservations
 * Retrieve all reservations (coordinators and admins only)
 * Query params: status, from_date, to_date, block_id
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'coordinador' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
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
    if (searchParams.has('block_id')) {
      filters.block_id = searchParams.get('block_id') || undefined;
    }

    const reservations = await getReservations(filters);
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Create a new reservation
 * Body: { room_id, slot_id, reservation_date, subject, group_name }
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'profesor' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createReservationSchema.parse(body);

    // Create the reservation
    const result = await createReservation(
      user.userId,
      user.email,
      user.role,
      validatedData
    );

    return NextResponse.json(result.reservation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reservation:', error);

    if (error.statusCode === 400) {
      return NextResponse.json(
        {
          error: error.message,
          validationErrors: error.validationErrors || [error.message],
        },
        { status: 400 }
      );
    }

    if (error.statusCode === 409) {
      return NextResponse.json(
        {
          error: 'Slot already reserved',
          conflict: error.conflict,
        },
        { status: 409 }
      );
    }

    if (error.zodErrors) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.zodErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
