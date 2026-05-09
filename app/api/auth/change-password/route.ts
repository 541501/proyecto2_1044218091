import { NextRequest, NextResponse } from 'next/server';
import { withAuth, addNoStoreHeaders } from '@/lib/withAuth';
import { changePasswordSchema } from '@/lib/schemas';
import {
  getUserById,
  verifyPassword,
  hashPassword,
} from '@/lib/dataService';
import { supabase } from '@/lib/supabase';

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

    const currentUser = await getUserById(user.userId);

    if (!currentUser) {
      return addNoStoreHeaders(
        NextResponse.json({ error: 'User not found' }, { status: 404 })
      );
    }

    const passwordMatch = await verifyPassword(
      validated.currentPassword,
      currentUser.password_hash
    );

    if (!passwordMatch) {
      return addNoStoreHeaders(
        NextResponse.json(
          { error: 'Contraseña actual incorrecta' },
          { status: 400 }
        )
      );
    }

    const newHash = await hashPassword(validated.newPassword);

    if (supabase) {
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: newHash,
          must_change_password: false,
        })
        .eq('id', user.userId);

      if (error) {
        throw error;
      }
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
