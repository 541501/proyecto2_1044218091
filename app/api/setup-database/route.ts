import { NextRequest, NextResponse } from 'next/server';
import { executeSql, requireSupabaseClient } from '@/lib/supabase';
import seedData from '@/data/seed.json';

/**
 * GET /api/setup-database
 * Verify Supabase connection and list existing tables with row counts
 */
export async function GET() {
  try {
    // Verify connection using requireSupabaseClient (throws if not configured)
    const client = requireSupabaseClient();

    // List tables and their row counts
    const tables = ['users', 'blocks', 'slots', 'rooms', 'reservations'];
    const tableStatus: Record<string, { exists: boolean; count: number }> = {};

    for (const table of tables) {
      try {
        const { count, error } = await client
          .from(table)
          .select('*', { count: 'exact', head: true });

        tableStatus[table] = {
          exists: !error,
          count: count || 0,
        };
      } catch {
        tableStatus[table] = { exists: false, count: 0 };
      }
    }

    return NextResponse.json(
      {
        connected: true,
        tables: tableStatus,
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
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

/**
 * POST /api/setup-database
 * Create all tables, enable RLS, create policies, and insert seed data
 * Body: { action: 'create-all' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action !== 'create-all') {
      return NextResponse.json(
        { success: false, error: "Invalid action. Expected { action: 'create-all' }" },
        { status: 400 }
      );
    }

    const steps: Array<{
      name: string;
      status: 'pending' | 'success' | 'error';
      message?: string;
    }> = [];

    // ===== STEP 1: CREATE USERS TABLE =====
    steps.push({ name: 'Create users table and _migrations', status: 'pending' });
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS users (
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
        );
      `);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 2: CREATE SPACES TABLES =====
    steps.push({ name: 'Create blocks, slots, and rooms tables', status: 'pending' });
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS blocks (
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
        CREATE INDEX IF NOT EXISTS idx_slots_order  ON slots(order_index);
      `);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 3: CREATE RESERVATIONS TABLE =====
    steps.push({ name: 'Create reservations table', status: 'pending' });
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS reservations (
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
        CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);
      `);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 4: CREATE AUDIT TABLE =====
    steps.push({ name: 'Create audit_entries table', status: 'pending' });
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS audit_entries (
          id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
          timestamp        TIMESTAMPTZ  DEFAULT NOW(),
          user_id          UUID         NOT NULL REFERENCES users(id),
          user_email       VARCHAR(255) NOT NULL,
          user_role        VARCHAR(15)  NOT NULL
                           CHECK (user_role IN ('profesor', 'coordinador', 'admin')),
          action           VARCHAR(30)  NOT NULL
                           CHECK (action IN (
                             'create_reservation', 'cancel_reservation',
                             'deactivate_room', 'create_room', 'update_room',
                             'create_user', 'toggle_user',
                             'login', 'logout', 'bootstrap'
                           )),
          entity           VARCHAR(20)  NOT NULL
                           CHECK (entity IN ('reservation', 'room', 'user', 'system')),
          entity_id        UUID,
          summary          TEXT         NOT NULL,
          metadata         JSONB,
          created_at       TIMESTAMPTZ  DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_audit_entries_timestamp ON audit_entries(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_entries_user_id   ON audit_entries(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_entries_action    ON audit_entries(action);
        CREATE INDEX IF NOT EXISTS idx_audit_entries_entity    ON audit_entries(entity, entity_id);
      `);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 5: ENABLE RLS =====
    steps.push({ name: 'Enable Row Level Security (RLS)', status: 'pending' });
    try {
      await executeSql(`
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
        ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
        ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE audit_entries ENABLE ROW LEVEL SECURITY;
      `);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 6: CREATE RLS POLICIES (IDEMPOTENT) =====
    steps.push({ name: 'Create RLS policies for service_role', status: 'pending' });
    try {
      await executeSql(`
        -- Users table policy
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'service_role_all_users'
          ) THEN
            CREATE POLICY service_role_all_users ON users
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END $$;

        -- Blocks table policy
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'blocks' AND policyname = 'service_role_all_blocks'
          ) THEN
            CREATE POLICY service_role_all_blocks ON blocks
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END $$;

        -- Slots table policy
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'slots' AND policyname = 'service_role_all_slots'
          ) THEN
            CREATE POLICY service_role_all_slots ON slots
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END $$;

        -- Rooms table policy
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'service_role_all_rooms'
          ) THEN
            CREATE POLICY service_role_all_rooms ON rooms
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END $$;

        -- Reservations table policy
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'reservations' AND policyname = 'service_role_all_reservations'
          ) THEN
            CREATE POLICY service_role_all_reservations ON reservations
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END $$;

        -- Audit entries table policy
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'audit_entries' AND policyname = 'service_role_all_audit_entries'
          ) THEN
            CREATE POLICY service_role_all_audit_entries ON audit_entries
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 7: NOTIFY PGRST =====
    steps.push({ name: 'Notify PostgREST to reload schema', status: 'pending' });
    try {
      await executeSql(`NOTIFY pgrst, 'reload schema';`);
      steps[steps.length - 1].status = 'success';
    } catch (error) {
      steps[steps.length - 1].status = 'error';
      steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
    }

    // ===== STEP 8: INSERT SEED DATA =====
    try {
      const client = requireSupabaseClient();

      // 8a. Insert users
      steps.push({ name: 'Insert seed users', status: 'pending' });
      try {
        if (seedData.users && seedData.users.length > 0) {
          const { error } = await client
            .from('users')
            .insert(seedData.users as any);
          if (error) throw error;
        }
        steps[steps.length - 1].status = 'success';
      } catch (error) {
        steps[steps.length - 1].status = 'error';
        steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
      }

      // 8b. Insert blocks
      steps.push({ name: 'Insert seed blocks', status: 'pending' });
      try {
        if (seedData.blocks && seedData.blocks.length > 0) {
          const { error } = await client
            .from('blocks')
            .insert(seedData.blocks as any);
          if (error) throw error;
        }
        steps[steps.length - 1].status = 'success';
      } catch (error) {
        steps[steps.length - 1].status = 'error';
        steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
      }

      // 8c. Insert slots
      steps.push({ name: 'Insert seed slots', status: 'pending' });
      try {
        if (seedData.slots && seedData.slots.length > 0) {
          const slotsData = seedData.slots.map((slot: any) => ({
            name: slot.name,
            start_time: slot.start_time,
            end_time: slot.end_time,
            order_index: slot.order || 0,
          }));
          const { error } = await client.from('slots').insert(slotsData);
          if (error) throw error;
        }
        steps[steps.length - 1].status = 'success';
      } catch (error) {
        steps[steps.length - 1].status = 'error';
        steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
      }

      // 8d. Insert rooms
      steps.push({ name: 'Insert seed rooms', status: 'pending' });
      try {
        if (seedData.rooms && seedData.rooms.length > 0) {
          const { data: blocksMap } = await client
            .from('blocks')
            .select('id, code');

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

          const { error } = await client.from('rooms').insert(roomsData);
          if (error) throw error;
        }
        steps[steps.length - 1].status = 'success';
      } catch (error) {
        steps[steps.length - 1].status = 'error';
        steps[steps.length - 1].message = error instanceof Error ? error.message : 'Unknown error';
      }
    } catch (error) {
      steps.push({
        name: 'Seed data insertion',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const allSuccess = steps.every((s) => s.status === 'success');

    return NextResponse.json(
      {
        success: allSuccess,
        message: allSuccess
          ? 'Database setup completed successfully!'
          : 'Database setup completed with errors',
        steps,
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
        steps: [],
      },
      { status: 500 }
    );
  }
}
