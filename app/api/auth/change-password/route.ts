import { NextRequest, NextResponse } from 'next/server';
import { withAuth, addNoStoreHeaders } from '@/lib/withAuth';
import { changePasswordSchema } from '@/lib/schemas';
import { changeUserPassword } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  const { user } = await withAuth(request);

  if (!user) {
    return addNoStoreHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }

  try {
    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    const success = await changeUserPassword(
      user.userId,
      validated.currentPassword,
      validated.newPassword
    );

    if (!success) {
      return addNoStoreHeaders(
        NextResponse.json(
          { error: 'Contraseña actual incorrecta o error al cambiar' },
          { status: 400 }
        )
      );
    }

    return addNoStoreHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Change password error:', error);
    return addNoStoreHeaders(
      NextResponse.json(
        { error: 'Error en el servidor' },
        { status: 500 }
      )
    );
  }
}
