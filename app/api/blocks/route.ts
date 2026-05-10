import { NextResponse } from 'next/server';
import { getBlocks } from '@/lib/dataService';

export async function GET() {
  try {
    
    const blocks = await getBlocks();
    
    return NextResponse.json(blocks, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error in GET /api/blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
