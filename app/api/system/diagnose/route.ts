import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

export async function GET(request: NextRequest) {
  const { user } = await withAuth(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const roleCheck = withRole(['admin'])(user);
  if (roleCheck) return roleCheck;

  // Placeholder diagnostic response
  // In Fase 3+, this will actually query database status
  return NextResponse.json(
    {
      supabaseConnected: false,
      blobConnected: false,
      migrationsApplied: [],
      pendingMigrations: [
        '0001_init_users.sql',
        '0002_init_spaces.sql',
        '0003_init_reservations.sql',
      ],
      tableCount: {
        users: 0,
        blocks: 0,
        slots: 0,
        rooms: 0,
        reservations: 0,
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
