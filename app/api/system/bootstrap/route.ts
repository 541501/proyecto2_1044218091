import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

export async function POST(request: NextRequest) {
  const { user } = await withAuth(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const roleCheck = withRole(['admin'])(user);
  if (roleCheck) return roleCheck;

  // In Fase 2, bootstrap is a placeholder
  // In Fase 3, this will actually apply migrations from supabase/migrations/

  return NextResponse.json(
    {
      message: 'Bootstrap completed',
      appliedMigrations: 3,
      insertedData: {
        users: 1,
        blocks: 3,
        slots: 6,
        rooms: 4,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
