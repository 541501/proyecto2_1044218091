import { NextRequest, NextResponse } from 'next/server';
import { getBlockAvailability } from '@/lib/dataService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Missing date parameter' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const availability = await getBlockAvailability(id, date);

    return NextResponse.json(availability, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error in GET /api/blocks/[id]/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
