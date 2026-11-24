import io
base = "/mnt/d/Project/Cross-Platform-Game/lib/db/src/"

# schema/index.ts export
p = base + "schema/index.ts"
s = io.open(p, encoding="utf-8").read()
assert 'export * from "./game-2048-games";' in s
s = s.replace('export * from "./game-2048-games";', 'export * from "./game-2048-games";\nexport * from "./jumble-games";')
io.open(p, "w", encoding="utf-8").write(s)

# ensure-schema.ts tables
p = base + "ensure-schema.ts"
s = io.open(p, encoding="utf-8").read()
anchor = '''    `CREATE INDEX IF NOT EXISTS game_2048_challenges_challenger_id_idx ON game_2048_challenges(challenger_id)`,
    `CREATE INDEX IF NOT EXISTS game_2048_challenges_challenged_id_idx ON game_2048_challenges(challenged_id)`,'''
assert anchor in s, "anchor not found"
addition = anchor + '''
    `CREATE TABLE IF NOT EXISTS jumble_games (
      id serial PRIMARY KEY,
      profile_id integer REFERENCES profiles(id),
      difficulty text NOT NULL,
      questions integer NOT NULL DEFAULT 0,
      correct integer NOT NULL DEFAULT 0,
      wrong_attempts integer NOT NULL DEFAULT 0,
      seed integer NOT NULL,
      daily_date text,
      challenge_id integer,
      status text NOT NULL DEFAULT 'active',
      elapsed_seconds integer NOT NULL DEFAULT 0,
      score integer NOT NULL DEFAULT 0,
      points integer,
      xp_earned integer,
      gems_earned integer,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS jumble_games_profile_id_idx
      ON jumble_games(profile_id)`,
    `CREATE INDEX IF NOT EXISTS jumble_games_status_completed_at_idx
      ON jumble_games(status, completed_at)`,
    `CREATE INDEX IF NOT EXISTS jumble_games_daily_date_idx
      ON jumble_games(daily_date)`,
    `CREATE INDEX IF NOT EXISTS jumble_games_challenge_id_idx
      ON jumble_games(challenge_id)`,
    `CREATE TABLE IF NOT EXISTS jumble_challenges (
      id serial PRIMARY KEY,
      challenger_id integer NOT NULL REFERENCES profiles(id),
      challenged_id integer NOT NULL REFERENCES profiles(id),
      difficulty text NOT NULL,
      questions integer NOT NULL DEFAULT 0,
      seed integer NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      challenger_game_id integer REFERENCES jumble_games(id),
      challenged_game_id integer REFERENCES jumble_games(id),
      winner_id integer REFERENCES profiles(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS jumble_challenges_challenger_id_idx ON jumble_challenges(challenger_id)`,
    `CREATE INDEX IF NOT EXISTS jumble_challenges_challenged_id_idx ON jumble_challenges(challenged_id)`,'''
s = s.replace(anchor, addition, 1)

# RLS lines — check how game_2048 RLS is declared
rls_anchor = '    `ALTER TABLE IF EXISTS game_2048_challenges ENABLE ROW LEVEL SECURITY`,'
if rls_anchor in s:
    s = s.replace(rls_anchor, rls_anchor + '\n    `ALTER TABLE IF EXISTS jumble_games ENABLE ROW LEVEL SECURITY`,\n    `ALTER TABLE IF EXISTS jumble_challenges ENABLE ROW LEVEL SECURITY`,', 1)
else:
    print("WARN: RLS anchor not found")
io.open(p, "w", encoding="utf-8").write(s)
print("patched OK")
