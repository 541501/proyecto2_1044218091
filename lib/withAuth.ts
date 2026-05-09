import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import type { JWTPayload } from './types';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function withAuth(
  request: NextRequest
): Promise<{ user: JWTPayload | null; response?: NextResponse }> {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return { user: null };
  }

  const user = await verifyToken(token);

  if (!user) {
    return { user: null };
  }

  return { user };
}

export function withAuthRequired(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}

export function addNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
