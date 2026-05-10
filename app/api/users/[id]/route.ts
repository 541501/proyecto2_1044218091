import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, recordAudit } from '@/lib/dataService';
import { updateUserSchema } from '@/lib/schemas';

/**
 * GET /api/users/[id]
 * Get a specific user (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return safe user (without password_hash)
    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user (admin only)
 * 
 * Body: { name?, role?, is_active? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const validatedData = updateUserSchema.parse(body);

    // Fetch current user for audit purposes
    const currentUser = await getUserById(id);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await updateUser(id, validatedData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Record audit entry
    const changes = Object.keys(validatedData).filter(
      (key) => validatedData[key as keyof typeof validatedData] !== (currentUser as any)[key]
    );

    if (changes.length > 0) {
      await recordAudit({
        timestamp: new Date().toISOString(),
        user_id: userId,
        user_email: userEmail,
        user_role: userRole as 'profesor' | 'coordinador' | 'admin',
        action: 'toggle_user',
        entity: 'user',
        entity_id: id,
        summary: `Usuario actualizado: ${currentUser.name} - Cambios: ${changes.join(', ')}`,
        metadata: {
          changes: validatedData,
        },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
