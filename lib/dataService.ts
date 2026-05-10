import bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';
import type {
  User,
  SafeUser,
  SystemMode,
  AuditEntry,
  Block,
  Slot,
  Room,
  Reservation,
  ReservationWithDetails,
  CreateReservationRequest,
  CancelReservationRequest,
  ReservationFilters,
  OccupancyReportRow,
} from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { appendAudit, isBlobConfigured } from './blobAudit';
import { readSeed } from './seedReader';
import { buildWeeklyCalendar } from './availabilityService';
import {
  validateReservationRules,
  checkConflict,
  type ReservationConflict,
} from './reservationService';
import { isTodayOrPastDate } from './dateUtils';

let systemMode: SystemMode | null = null;

async function determineSystemMode(): Promise<SystemMode> {
  if (systemMode) return systemMode;

  if (!isSupabaseConfigured()) {
    systemMode = 'seed';
    return 'seed';
  }

  try {
    const { data, error } = await supabase!
      .from('_migrations')
      .select('id')
      .limit(1);

    if (error || !data) {
      systemMode = 'seed';
    } else {
      systemMode = 'live';
    }
  } catch {
    systemMode = 'seed';
  }

  return systemMode;
}

export async function getSystemMode(): Promise<SystemMode> {
  return determineSystemMode();
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.users.find((u) => u.email === email) || null;
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.users.find((u) => u.id === id) || null;
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: 'profesor' | 'coordinador' | 'admin'
): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return null; // Cannot create users in seed mode
  }

  const { data, error } = await supabase!
    .from('users')
    .insert([
      {
        name,
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
        must_change_password: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
}

export async function recordAudit(entry: Omit<AuditEntry, 'id'>): Promise<void> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.log('[SEED MODE AUDIT]', entry);
    return;
  }

  if (!isBlobConfigured()) {
    console.log('[AUDIT NOT CONFIGURED]', entry);
    return;
  }

  const auditEntry: AuditEntry = {
    ...entry,
    id: crypto.randomUUID?.() || Math.random().toString(36),
  };

  await appendAudit(auditEntry);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export function toSafeUser(user: User): SafeUser {
  const { password_hash: _, ...safe } = user;
  return safe;
}

// ==================== BLOCKS ====================

export async function getBlocks(): Promise<Block[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.blocks.filter((b) => b.is_active) || [];
  }

  const { data, error } = await supabase!
    .from('blocks')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching blocks:', error);
    return [];
  }

  return data || [];
}

export async function getBlockById(id: string): Promise<Block | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.blocks.find((b) => b.id === id && b.is_active) || null;
  }

  const { data, error } = await supabase!
    .from('blocks')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data;
}

// ==================== SLOTS ====================

export async function getSlots(): Promise<Slot[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.slots.filter((s) => s.is_active).sort((a, b) => a.order_index - b.order_index) || [];
  }

  const { data, error } = await supabase!
    .from('slots')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    console.error('Error fetching slots:', error);
    return [];
  }

  return data || [];
}

// ==================== ROOMS ====================

export async function getRooms(blockId?: string): Promise<Room[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    let rooms = seed.rooms.filter((r) => r.is_active) || [];
    if (blockId) {
      rooms = rooms.filter((r) => r.block_id === blockId);
    }
    return rooms;
  }

  let query = supabase!
    .from('rooms')
    .select('*')
    .eq('is_active', true);

  if (blockId) {
    query = query.eq('block_id', blockId);
  }

  const { data, error } = await query.order('code');

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return data || [];
}

export async function getRoomById(id: string): Promise<Room | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.rooms.find((r) => r.id === id && r.is_active) || null;
  }

  const { data, error } = await supabase!
    .from('rooms')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data;
}

export async function createRoom(
  blockId: string,
  code: string,
  type: string,
  capacity: number,
  equipment?: string
): Promise<Room | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return null; // Cannot create rooms in seed mode
  }

  const { data, error } = await supabase!
    .from('rooms')
    .insert([
      {
        block_id: blockId,
        code,
        type,
        capacity,
        equipment: equipment || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    return null;
  }

  return data;
}

export async function updateRoom(
  id: string,
  updates: Partial<Omit<Room, 'id' | 'created_at'>>
): Promise<Room | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return null; // Cannot update rooms in seed mode
  }

  const { data, error } = await supabase!
    .from('rooms')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating room:', error);
    return null;
  }

  return data;
}

export async function deactivateRoom(id: string): Promise<Room | null> {
  return updateRoom(id, { is_active: false });
}

// ==================== AVAILABILITY ====================

export async function getBlockAvailability(
  blockId: string,
  date: string
): Promise<{ roomsAvailable: number; roomsTotal: number; roomDetails: any[] }> {
  const rooms = await getRooms(blockId);
  const activeRooms = rooms.filter((r) => r.is_active);

  if (activeRooms.length === 0) {
    return { roomsAvailable: 0, roomsTotal: 0, roomDetails: [] };
  }

  let availableCount = 0;
  const roomDetails = [];

  for (const room of activeRooms) {
    const weekStart = getWeekStart(date);
    const calendar = await buildWeeklyCalendar(room.id, weekStart);
    const today = calendar.days[0]; // Monday
    
    // Find today in the calendar days
    const todayIdx = calendar.days.findIndex(d => d.date === date);
    const daySlots = todayIdx >= 0 ? calendar.days[todayIdx].slots : today.slots;
    
    const availableSlots = daySlots.filter((s) => s.status === 'libre').length;
    const hasAvailability = availableSlots > 0;

    if (hasAvailability) {
      availableCount++;
    }

    roomDetails.push({
      id: room.id,
      code: room.code,
      type: room.type,
      capacity: room.capacity,
      availableSlots,
      totalSlots: daySlots.length,
    });
  }

  return {
    roomsAvailable: availableCount,
    roomsTotal: activeRooms.length,
    roomDetails,
  };
}

export async function getRoomWeeklyCalendar(
  roomId: string,
  weekStart: string
): Promise<any> {
  return buildWeeklyCalendar(roomId, weekStart);
}

// Helper function to get week start (Monday)
function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// ==================== RESERVATIONS ====================

/**
 * Get all reservations with details (used by coordinators and admins)
 * Optionally filter by status, date range, and block
 */
export async function getReservations(
  filters?: ReservationFilters
): Promise<ReservationWithDetails[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, no reservations exist
    return [];
  }

  let query = supabase!.from('reservations').select(
    `
    *,
    professor:professor_id (id, name, email, role, is_active, created_at),
    room:room_id (id, block_id, code, type, capacity, equipment, is_active, created_at, updated_at),
    slot:slot_id (id, name, start_time, end_time, order_index, is_active),
    cancelled_by_user:cancelled_by (id, name, email, role, is_active, created_at)
  `
  );

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.from_date) {
    query = query.gte('reservation_date', filters.from_date);
  }
  if (filters?.to_date) {
    query = query.lte('reservation_date', filters.to_date);
  }

  // If block_id is provided, join with rooms to filter by block
  if (filters?.block_id) {
    query = query.eq('room.block_id', filters.block_id);
  }

  const { data, error } = await query.order('reservation_date', {
    ascending: false,
  });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return data || [];
}

/**
 * Get only the user's own reservations (used by professors)
 */
export async function getMyReservations(
  userId: string,
  filters?: ReservationFilters
): Promise<ReservationWithDetails[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, no reservations exist
    return [];
  }

  let query = supabase!.from('reservations').select(
    `
    *,
    professor:professor_id (id, name, email, role, is_active, created_at),
    room:room_id (id, block_id, code, type, capacity, equipment, is_active, created_at, updated_at),
    slot:slot_id (id, name, start_time, end_time, order_index, is_active),
    cancelled_by_user:cancelled_by (id, name, email, role, is_active, created_at)
  `
  );

  query = query.eq('professor_id', userId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.from_date) {
    query = query.gte('reservation_date', filters.from_date);
  }
  if (filters?.to_date) {
    query = query.lte('reservation_date', filters.to_date);
  }

  const { data, error } = await query.order('reservation_date', {
    ascending: false,
  });

  if (error) {
    console.error('Error fetching my reservations:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new reservation with full validation and conflict detection.
 * 
 * Flow:
 * 1. Validate business rules (RN-02, RN-03)
 * 2. Check for conflicts (RN-01)
 * 3. Insert into database (Postgres UNIQUE index as second line of defense)
 * 4. Record audit entry (RN-08)
 * 
 * Returns: Reservation object or throws error with appropriate HTTP status code
 */
export async function createReservation(
  userId: string,
  userEmail: string,
  userRole: string,
  data: CreateReservationRequest
): Promise<{ reservation: Reservation; conflict?: ReservationConflict }> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot create reservations in seed mode');
  }

  // Step 1: Validate business rules (RN-02, RN-03)
  const validationErrors = validateReservationRules(data.reservation_date);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors[0]);
    (error as any).statusCode = 400;
    (error as any).validationErrors = validationErrors;
    throw error;
  }

  // Step 2: Check for conflicts (RN-01)
  const conflict = await checkConflict(
    data.room_id,
    data.slot_id,
    data.reservation_date
  );
  if (conflict) {
    const error = new Error('Slot already reserved');
    (error as any).statusCode = 409;
    (error as any).conflict = conflict;
    throw error;
  }

  // Step 3: Insert into database
  let insertedReservation: Reservation;
  try {
    const { data: result, error } = await supabase!
      .from('reservations')
      .insert([
        {
          room_id: data.room_id,
          slot_id: data.slot_id,
          professor_id: userId,
          reservation_date: data.reservation_date,
          subject: data.subject,
          group_name: data.group_name,
          status: 'confirmada',
          created_by: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      // Check if it's a UNIQUE constraint violation (race condition)
      if (error.code === '23505') {
        // Retry the conflict check to get the conflicting reservation details
        const conflictRetry = await checkConflict(
          data.room_id,
          data.slot_id,
          data.reservation_date
        );
        const retryError = new Error('Slot already reserved');
        (retryError as any).statusCode = 409;
        (retryError as any).conflict = conflictRetry;
        throw retryError;
      }
      throw error;
    }

    insertedReservation = result;
  } catch (err) {
    if ((err as any).statusCode) {
      throw err;
    }
    console.error('Error creating reservation:', err);
    throw err;
  }

  // Step 4: Record audit entry (RN-08)
  const room = await getRoomById(data.room_id);
  const slot = await (async () => {
    const slots = await getSlots();
    return slots.find((s) => s.id === data.slot_id);
  })();

  await recordAudit({
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_email: userEmail,
    user_role: userRole as 'profesor' | 'coordinador' | 'admin',
    action: 'create_reservation',
    entity: 'reservation',
    entity_id: insertedReservation.id,
    summary: `Reserva creada: ${room?.code || 'N/A'} - ${slot?.name || 'N/A'} - ${data.subject}`,
    metadata: {
      room_id: data.room_id,
      slot_id: data.slot_id,
      reservation_date: data.reservation_date,
    },
  });

  return { reservation: insertedReservation };
}

/**
 * Cancel a reservation with role-based validation.
 * 
 * Rules:
 * - Professors: can only cancel their own reservations, only if date > TODAY (RN-04, RN-05)
 * - Coordinators/Admins: can cancel any reservation if they provide a reason
 * 
 * Returns: Updated reservation object or throws error
 */
export async function cancelReservation(
  reservationId: string,
  userId: string,
  userEmail: string,
  userRole: 'profesor' | 'coordinador' | 'admin',
  data?: CancelReservationRequest
): Promise<Reservation> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot cancel reservations in seed mode');
  }

  // Fetch the reservation to validate permissions
  const { data: reservation, error: fetchError } = await supabase!
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (fetchError || !reservation) {
    const error = new Error('Reservation not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // If professor, apply additional restrictions
  if (userRole === 'profesor') {
    // RN-05: Can only cancel own reservations
    if (reservation.professor_id !== userId) {
      const error = new Error('Cannot cancel reservations of other professors');
      (error as any).statusCode = 403;
      throw error;
    }

    // RN-04: Can only cancel future reservations
    if (isTodayOrPastDate(reservation.reservation_date)) {
      const error = new Error(
        'Cannot cancel reservations for today or past dates. Only future reservations can be cancelled.'
      );
      (error as any).statusCode = 409;
      throw error;
    }
  }

  // For coordinators and admins, reason is optional but good practice
  const cancellationReason = data?.cancellation_reason || '';

  // Update the reservation
  const { data: updatedReservation, error: updateError } = await supabase!
    .from('reservations')
    .update({
      status: 'cancelada',
      cancellation_reason: cancellationReason,
      cancelled_by: userId,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (updateError || !updatedReservation) {
    console.error('Error cancelling reservation:', updateError);
    const error = new Error('Failed to cancel reservation');
    (error as any).statusCode = 500;
    throw error;
  }

  // Record audit entry (RN-08)
  await recordAudit({
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_email: userEmail,
    user_role: userRole,
    action: 'cancel_reservation',
    entity: 'reservation',
    entity_id: reservationId,
    summary: `Reserva cancelada por ${userRole === 'profesor' ? 'profesor' : 'administrador'}. Motivo: ${cancellationReason || 'Sin especificar'}`,
    metadata: {
      reservation_id: reservationId,
      cancellation_reason: cancellationReason,
    },
  });

  return updatedReservation;
}

// ==================== REPORTS ====================

/**
 * Get occupancy report data for a date range and optional block filter.
 * 
 * Retrieves confirmed reservations with all related information (professor, room, block, slot).
 * Used for CSV export and JSON preview.
 */
export async function getOccupancyReport(
  fromDate: string,
  toDate: string,
  blockId?: string
): Promise<OccupancyReportRow[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, no real reservations
    return [];
  }

  // Build query with all joins
  let query = supabase!
    .from('reservations')
    .select(
      `
      id,
      reservation_date,
      subject,
      group_name,
      status,
      professor:professor_id (name),
      room:room_id (
        id,
        code,
        block_id,
        block:block_id (name)
      ),
      slot:slot_id (name)
    `
    )
    .eq('status', 'confirmada')
    .gte('reservation_date', fromDate)
    .lte('reservation_date', toDate)
    .order('reservation_date', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching occupancy report:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Transform the query results into OccupancyReportRow format
  let rows = data
    .filter((row: any) => {
      // Filter by block if provided
      if (blockId) {
        return row.room?.block_id === blockId;
      }
      return true;
    })
    .map((row: any) => {
      const date = new Date(row.reservation_date);
      const fecha = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

      return {
        fecha,
        bloque: row.room?.block?.name || 'N/A',
        salon: row.room?.code || 'N/A',
        codigo: row.room?.code || 'N/A',
        franja: row.slot?.name || 'N/A',
        profesor: row.professor?.name || 'N/A',
        materia: row.subject || 'N/A',
        grupo: row.group_name || 'N/A',
        estado: row.status === 'confirmada' ? 'Confirmada' : 'Cancelada',
      };
    });

  return rows;
}

// ==================== USER MANAGEMENT ====================

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<SafeUser[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seed = await readSeed();
    return seed.users.map(toSafeUser) || [];
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return (data || []).map(toSafeUser);
}

/**
 * Create a new user with temporary password.
 * 
 * - Generates a random 12-character password
 * - Hashes it with bcrypt
 * - Sets must_change_password=true
 * - Returns the temporary password in plain text (once)
 */
export async function createUserWithTemporaryPassword(
  name: string,
  email: string,
  role: 'profesor' | 'coordinador' | 'admin'
): Promise<{ user: SafeUser; temporaryPassword: string } | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return null; // Cannot create users in seed mode
  }

  // Generate temporary password
  const temporaryPassword = randomBytes(6).toString('hex'); // 12 hex chars = 6 bytes

  // Hash the password
  const passwordHash = await hashPassword(temporaryPassword);

  // Create the user
  const { data, error } = await supabase!
    .from('users')
    .insert([
      {
        name,
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
        must_change_password: true,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return {
    user: toSafeUser(data),
    temporaryPassword,
  };
}

/**
 * Update a user (admin only)
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'password_hash' | 'created_at'>>
): Promise<SafeUser | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return null; // Cannot update users in seed mode
  }

  const { data, error } = await supabase!
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return toSafeUser(data);
}

/**
 * Toggle user active status (admin only)
 */
export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<SafeUser | null> {
  return updateUser(userId, { is_active: isActive });
}

/**
 * Change password for authenticated user
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return false; // Cannot change passwords in seed mode
  }

  // Fetch the user
  const user = await getUserById(userId);
  if (!user) {
    return false;
  }

  // Verify current password
  const passwordMatch = await verifyPassword(currentPassword, user.password_hash);
  if (!passwordMatch) {
    return false;
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password and clear must_change_password flag
  const { error } = await supabase!
    .from('users')
    .update({
      password_hash: newPasswordHash,
      must_change_password: false,
    })
    .eq('id', userId);

  return !error;
}

