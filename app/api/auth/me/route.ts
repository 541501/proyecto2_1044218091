import { NextRequest, NextResponse } from 'next/server';
import { withAuth, addNoStoreHeaders } from '@/lib/withAuth';
import { getUserById, toSafeUser } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  const { user } = await withAuth(request);

  if (!user) {
    return addNoStoreHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }

  const fullUser = await getUserById(user.userId);

  if (!fullUser) {
    return addNoStoreHeaders(
      NextResponse.json({ error: 'User not found' }, { status: 404 })
    );
  }

  return addNoStoreHeaders(NextResponse.json(toSafeUser(fullUser)));
}
