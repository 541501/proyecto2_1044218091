import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { createToken } from '@/lib/auth';
import {
  getUserByEmail,
  verifyPassword,
  recordAudit,
  toSafeUser,
} from '@/lib/dataService';
import { addNoStoreHeaders } from '@/lib/withAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const user = await getUserByEmail(validated.email);

    if (!user || !user.is_active) {
      return addNoStoreHeaders(
        NextResponse.json(
          { error: 'Correo o contraseña incorrectos' },
          { status: 401 }
        )
      );
    }

    const passwordMatch = await verifyPassword(
      validated.password,
      user.password_hash
    );

    if (!passwordMatch) {
      return addNoStoreHeaders(
        NextResponse.json(
          { error: 'Correo o contraseña incorrectos' },
          { status: 401 }
        )
      );
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      mustChangePassword: user.must_change_password,
    });

    const response = NextResponse.json({
      user: toSafeUser(user),
      token,
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Record audit in background
    recordAudit({
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      action: 'login',
      entity: 'system',
      summary: `${user.name} (${user.role}) inició sesión`,
    });

    return addNoStoreHeaders(response);
  } catch (error) {
    console.error('Login error:', error);
    return addNoStoreHeaders(
      NextResponse.json(
        { error: 'Error en el servidor' },
        { status: 500 }
      )
    );
  }
}
