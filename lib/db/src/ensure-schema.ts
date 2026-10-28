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
    `CREATE TABLE IF NOT EXISTS jigsaw_games (
      id serial PRIMARY KEY,
      profile_id integer REFERENCES profiles(id),
      grid_size integer NOT NULL,
      level integer NOT NULL DEFAULT 1,
      image_key integer NOT NULL DEFAULT 1,
      elapsed_seconds integer NOT NULL DEFAULT 0,
      moves integer NOT NULL DEFAULT 0,
      daily_date text,
      status text NOT NULL DEFAULT 'active',
      points integer,
      xp_earned integer,
      gems_earned integer,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS jigsaw_games_status_completed_at_idx
      ON jigsaw_games(status, completed_at)`,
    `CREATE INDEX IF NOT EXISTS jigsaw_games_profile_id_idx
      ON jigsaw_games(profile_id)`,
    `CREATE INDEX IF NOT EXISTS jigsaw_games_daily_date_idx
      ON jigsaw_games(daily_date)`,
    `CREATE TABLE IF NOT EXISTS jigsaw_challenges (
      id serial PRIMARY KEY,
      challenger_id integer NOT NULL REFERENCES profiles(id),
      challenged_id integer REFERENCES profiles(id),
      share_token text NOT NULL UNIQUE,
      grid_size integer NOT NULL,
      level integer NOT NULL DEFAULT 1,
      image_key integer NOT NULL DEFAULT 1,
      status text NOT NULL DEFAULT 'pending',
      challenger_game_id integer REFERENCES jigsaw_games(id),
      challenged_game_id integer REFERENCES jigsaw_games(id),
      winner_id integer REFERENCES profiles(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS jigsaw_challenges_challenger_id_idx
      ON jigsaw_challenges(challenger_id)`,
    `CREATE INDEX IF NOT EXISTS jigsaw_challenges_challenged_id_idx
      ON jigsaw_challenges(challenged_id)`,
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
}