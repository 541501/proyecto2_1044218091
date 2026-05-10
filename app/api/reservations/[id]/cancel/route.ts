import { NextRequest, NextResponse } from 'next/server';
import { cancelReservation } from '@/lib/dataService';
import { cancelReservationSchema } from '@/lib/schemas';

/**
 * POST /api/reservations/[id]/cancel
 * Cancel a reservation
 * Body: { cancellation_reason? }
 */
export async function POST(
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
  let userEmail: string;
  let userRole: string;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userId = payload.userId;
    userEmail = payload.email;
    userRole = payload.role;
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = cancelReservationSchema.parse(body);

    // Cancel the reservation
    const updatedReservation = await cancelReservation(
      reservationId,
      userId,
      userEmail,
      userRole as any,
      validatedData
    );

    return NextResponse.json(updatedReservation);
  } catch (error: any) {
    console.error('Error cancelling reservation:', error);

    if (error.statusCode === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.statusCode === 409) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error.statusCode === 500) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
