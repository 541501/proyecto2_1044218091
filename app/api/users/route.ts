import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUserWithTemporaryPassword, recordAudit } from '@/lib/dataService';
import { createUserSchema } from '@/lib/schemas';

/**
 * GET /api/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Extract user info from token
  let userRole: string;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userRole = payload.role;
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Check authorization
  if (userRole !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 * 
 * Body: { name, email, role }
 * Returns: { user, temporaryPassword }
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Extract user info from token
  let userId: string;
  let userEmail: string;
  let userRole: string;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userId = payload.userId;
    userEmail = payload.email;
    userRole = payload.role;
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Check authorization
  if (userRole !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createUserSchema.parse(body);

    // Create user with temporary password
    const result = await createUserWithTemporaryPassword(
      validatedData.name,
      validatedData.email,
      validatedData.role
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Record audit entry
    await recordAudit({
      timestamp: new Date().toISOString(),
      user_id: userId,
      user_email: userEmail,
      user_role: userRole as 'profesor' | 'coordinador' | 'admin',
      action: 'create_user',
      entity: 'user',
      entity_id: result.user.id,
      summary: `Usuario creado: ${validatedData.name} (${validatedData.email}) - Rol: ${validatedData.role}`,
      metadata: {
        user_email: validatedData.email,
        user_role: validatedData.role,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
