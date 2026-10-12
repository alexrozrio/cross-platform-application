import { pool } from "./index";

/**
 * Applies small, additive compatibility fixes needed when an API deployment
 * is pointed at a database that predates the current Drizzle schema.
 *
 * This intentionally only adds columns. It does not drop data, truncate
 * tables, or change existing column values. `IF NOT EXISTS` also makes it
 * safe to run on every API startup.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  const statements = [
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS image_theme text NOT NULL DEFAULT 'shapes'`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_theme text NOT NULL DEFAULT 'default'`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_size text NOT NULL DEFAULT 'default'`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_enabled boolean NOT NULL DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS highlight_errors boolean NOT NULL DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_timer boolean NOT NULL DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS game_mode text NOT NULL DEFAULT '4all'`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gems integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_user_id text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS replit_user_id text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS device_id text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_challenge_date date`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_streak integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date date`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS memory_streak integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_memory_streak integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_memory_date date`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`,
    `CREATE TABLE IF NOT EXISTS guest_profile_transfer_codes (
      id serial PRIMARY KEY,
      profile_id integer NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      code_hash text NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL,
      consumed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS guest_profile_transfer_codes_profile_id_idx
      ON guest_profile_transfer_codes(profile_id)`,
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
}