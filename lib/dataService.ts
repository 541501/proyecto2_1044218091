import bcryptjs from 'bcryptjs';
import type { User, SafeUser, SystemMode, AuditEntry } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { appendAudit, isBlobConfigured } from './blobAudit';
import { readSeed } from './seedReader';

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
