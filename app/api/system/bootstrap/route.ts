import { NextResponse } from 'next/server';
import { executeSql, getSupabaseClient } from '@/lib/supabase';
import seedData from '@/data/seed.json';

export async function POST() {
  try {
    // Create all tables via executeSql (requires DATABASE_URL)
    const migrations = [
      // 0001_init_users.sql
      `CREATE TABLE IF NOT EXISTS users (
        id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        email                VARCHAR(255) UNIQUE NOT NULL,
        password_hash        TEXT         NOT NULL,
        role                 VARCHAR(15)  NOT NULL
                             CHECK (role IN ('profesor', 'coordinador', 'admin')),
        is_active            BOOLEAN      DEFAULT true,
        must_change_password BOOLEAN      DEFAULT false,
        last_login_at        TIMESTAMPTZ,
        created_at           TIMESTAMPTZ  DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
      
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL       PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ  DEFAULT NOW()
      );`,

      // 0002_init_spaces.sql
      `CREATE TABLE IF NOT EXISTS blocks (
        id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        name       VARCHAR(50)  NOT NULL,
        code       VARCHAR(5)   UNIQUE NOT NULL,
        is_active  BOOLEAN      DEFAULT true,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS slots (
        id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
        name        VARCHAR(20) NOT NULL,
        start_time  TIME        NOT NULL,
        end_time    TIME        NOT NULL,
        order_index INTEGER     NOT NULL,
        is_active   BOOLEAN     DEFAULT true,
        UNIQUE (start_time, end_time)
      );
      
      CREATE TABLE IF NOT EXISTS rooms (
        id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        block_id    UUID         NOT NULL REFERENCES blocks(id),
        code        VARCHAR(20)  NOT NULL,
        type        VARCHAR(20)  NOT NULL DEFAULT 'salon'
                    CHECK (type IN ('salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro')),
        capacity    INTEGER      NOT NULL CHECK (capacity > 0),
        equipment   TEXT,
        is_active   BOOLEAN      DEFAULT true,
        created_at  TIMESTAMPTZ  DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE (block_id, code)
      );
      
      CREATE INDEX IF NOT EXISTS idx_rooms_block  ON rooms(block_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
      CREATE INDEX IF NOT EXISTS idx_blocks_code  ON blocks(code);
      CREATE INDEX IF NOT EXISTS idx_slots_order  ON slots(order_index);`,

      // 0003_init_reservations.sql
      `CREATE TABLE IF NOT EXISTS reservations (
        id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        room_id          UUID         NOT NULL REFERENCES rooms(id),
        slot_id          UUID         NOT NULL REFERENCES slots(id),
        professor_id     UUID         NOT NULL REFERENCES users(id),
        reservation_date DATE         NOT NULL,
        subject          VARCHAR(150) NOT NULL,
        group_name       VARCHAR(50)  NOT NULL,
        status           VARCHAR(15)  NOT NULL DEFAULT 'confirmada'
                         CHECK (status IN ('confirmada', 'cancelada')),
        cancellation_reason TEXT,
        cancelled_by     UUID         REFERENCES users(id),
        cancelled_at     TIMESTAMPTZ,
        created_by       UUID         REFERENCES users(id),
        created_at       TIMESTAMPTZ  DEFAULT NOW()
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
        ON reservations(room_id, slot_id, reservation_date)
        WHERE status = 'confirmada';
      
      CREATE INDEX IF NOT EXISTS idx_reservations_professor  ON reservations(professor_id, reservation_date DESC);
      CREATE INDEX IF NOT EXISTS idx_reservations_room_date  ON reservations(room_id, reservation_date);
      CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(reservation_date);
      CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);`,

      // RLS policies
      `ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
      ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
      ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY service_role_all_users ON users
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_blocks ON blocks
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_slots ON slots
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_rooms ON rooms
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_reservations ON reservations
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      NOTIFY pgrst, 'reload schema';`,
    ];

    // Execute all migrations
    for (const migration of migrations) {
      await executeSql(migration);
    }

    // Insert seed data via Supabase client
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available after schema creation');
    }

    // Insert users
    if (seedData.users && seedData.users.length > 0) {
      const { error: usersError } = await client
        .from('users')
        .insert(seedData.users as any);
      if (usersError) throw new Error(`Failed to insert users: ${usersError.message}`);
    }

    // Insert blocks
    if (seedData.blocks && seedData.blocks.length > 0) {
      const { error: blocksError } = await client
        .from('blocks')
        .insert(seedData.blocks as any);
      if (blocksError) throw new Error(`Failed to insert blocks: ${blocksError.message}`);
    }

    // Insert slots
    if (seedData.slots && seedData.slots.length > 0) {
      const slotsData = seedData.slots.map((slot: any) => ({
        name: slot.name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        order_index: slot.order || 0,
      }));
      const { error: slotsError } = await client
        .from('slots')
        .insert(slotsData);
      if (slotsError) throw new Error(`Failed to insert slots: ${slotsError.message}`);
    }

    // Insert rooms (need to resolve block_code to block_id)
    if (seedData.rooms && seedData.rooms.length > 0) {
      const { data: blocksMap, error: blocksMapError } = await client
        .from('blocks')
        .select('id, code');
      if (blocksMapError) throw new Error(`Failed to fetch blocks: ${blocksMapError.message}`);

      const blockIdMap = new Map(
        (blocksMap as any[]).map((b) => [b.code, b.id])
      );

      const roomsData = (seedData.rooms as any[]).map((room) => ({
        block_id: blockIdMap.get(room.block_code),
        code: room.code,
        type: room.type,
        capacity: room.capacity,
        equipment: room.equipment,
      }));

      const { error: roomsError } = await client
        .from('rooms')
        .insert(roomsData);
      if (roomsError) throw new Error(`Failed to insert rooms: ${roomsError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Database initialized successfully',
        tables: {
          users: seedData.users?.length || 0,
          blocks: seedData.blocks?.length || 0,
          slots: seedData.slots?.length || 0,
          rooms: seedData.rooms?.length || 0,
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
    console.error('[bootstrap] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
