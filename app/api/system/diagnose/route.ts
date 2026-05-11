import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Get Supabase client
    const client = getSupabaseClient();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase not configured',
          config: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
            hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          },
        },
        { status: 503 }
      );
    }

    // Try a simple query to verify connection
    const { error } = await client
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to database',
          details: error.message,
          config: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
            hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        config: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
        database: {
          connected: true,
          userTableExists: true,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
