import bcryptjs from 'bcryptjs';
import type { User, SafeUser, SystemMode, AuditEntry, Block, Slot, Room } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { appendAudit, isBlobConfigured } from './blobAudit';
import { readSeed } from './seedReader';
import { buildWeeklyCalendar } from './availabilityService';

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
