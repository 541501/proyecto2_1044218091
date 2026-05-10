import { NextRequest, NextResponse } from 'next/server';
import { getBlockById, getBlockAvailability } from '@/lib/dataService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if this is an availability request
    const url = new URL(request.url);
    const isAvailability = url.pathname.includes('/availability');
    
    if (isAvailability) {
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
    }

    // Regular block detail request
    const block = await getBlockById(id);
    
    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(block, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error in GET /api/blocks/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
