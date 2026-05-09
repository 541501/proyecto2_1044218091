import { NextResponse } from 'next/server';
import type { JWTPayload } from './types';

type Role = 'profesor' | 'coordinador' | 'admin';

export function withRole(allowedRoles: Role[]) {
  return (user: JWTPayload | null) => {
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return null;
  };
}
