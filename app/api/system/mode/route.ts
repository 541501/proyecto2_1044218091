import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';
import { addNoStoreHeaders } from '@/lib/withAuth';

export async function GET() {
  const mode = await getSystemMode();
  const response = NextResponse.json({ mode });
  return addNoStoreHeaders(response);
}
