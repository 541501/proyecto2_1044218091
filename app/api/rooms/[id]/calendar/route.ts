import { NextRequest, NextResponse } from 'next/server';
import { getRoomWeeklyCalendar } from '@/lib/dataService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const weekStart = url.searchParams.get('weekStart');

    if (!weekStart) {
      return NextResponse.json(
        { error: 'Missing weekStart parameter' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const calendar = await getRoomWeeklyCalendar(id, weekStart);

    return NextResponse.json(calendar, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error in GET /api/rooms/[id]/calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
