import { NextRequest, NextResponse } from 'next/server';
import { getRooms } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const blockId = url.searchParams.get('block');

    const rooms = await getRooms(blockId || undefined);

    return NextResponse.json(rooms, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error in GET /api/rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
