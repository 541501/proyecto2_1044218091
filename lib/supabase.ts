import { createClient, SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

let _client: SupabaseClient | null = null;
let _checked = false;

/**
 * Build-safe Supabase client.
 * Returns null if not configured (no error thrown).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null; // Already checked, no config

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  _checked = true;

  if (!url || !key) {
    console.warn(
      '[supabase] Not configured — returning null (build-safe)'
    );
    return null;
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

/**
 * Requires Supabase to be configured.
 * Throws error if config is missing.
 */
export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return client;
}

/**
 * Execute raw SQL queries (DDL like CREATE TABLE).
 * Requires DATABASE_URL to be set.
 */
export async function executeSql(query: string): Promise<void> {
  const connString = process.env.DATABASE_URL;

  if (!connString) {
    throw new Error('DATABASE_URL not configured');
  }

  const sql = postgres(connString, {
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
  });

  try {
    await sql.unsafe(query);
  } finally {
    await sql.end();
  }
}

/**
 * Legacy exports for backward compatibility
 */
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseClient();

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
