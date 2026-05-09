import { Client } from 'pg';

export interface MigrationResult {
  success: boolean;
  message: string;
  applied: string[];
  errors: string[];
}

export async function applyMigrations(
  connectionString: string,
  migrationFiles: { filename: string; sql: string }[]
): Promise<MigrationResult> {
  const client = new Client({ connectionString });
  const applied: string[] = [];
  const errors: string[] = [];

  try {
    await client.connect();

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL       PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // Check which migrations have already been applied
    const result = await client.query('SELECT filename FROM _migrations');
    const appliedFiles = new Set(result.rows.map((r) => r.filename));

    // Apply pending migrations
    for (const migration of migrationFiles) {
      if (appliedFiles.has(migration.filename)) {
        console.log(`Skipping already applied migration: ${migration.filename}`);
        continue;
      }

      try {
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [migration.filename]
        );
        applied.push(migration.filename);
        console.log(`Applied migration: ${migration.filename}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to apply ${migration.filename}: ${errorMsg}`);
        console.error(`Error applying migration ${migration.filename}:`, error);
      }
    }

    await client.end();

    return {
      success: errors.length === 0,
      message: applied.length > 0 ? `Applied ${applied.length} migration(s)` : 'No pending migrations',
      applied,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to apply migrations: ${errorMsg}`,
      applied,
      errors: [errorMsg],
    };
  }
}
