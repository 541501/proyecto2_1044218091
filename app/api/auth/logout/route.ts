import { NextRequest, NextResponse } from 'next/server';
import { withAuth, addNoStoreHeaders } from '@/lib/withAuth';
import { recordAudit } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  const { user } = await withAuth(request);

  if (user) {
    recordAudit({
      timestamp: new Date().toISOString(),
      user_id: user.userId,
      user_email: user.email,
      user_role: user.role,
      action: 'logout',
      entity: 'system',
      summary: `${user.email} cerró sesión`,
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');

  return addNoStoreHeaders(response);
}
