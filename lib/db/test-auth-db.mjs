import pg from "pg";
import { readFileSync } from "node:fs";
const env = readFileSync("D:/Project/Cross-Platform-Game/artifacts/api-server/.env.local", "utf8");
const url = env.match(/DATABASE_URL=(.+)/)[1].trim();
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  const total = await client.query(`SELECT count(*)::int AS n FROM public.users`);
  console.log("public.users rows:", total.rows[0].n);
  const dup = await client.query(
    `SELECT email, count(*)::int AS n FROM public.users WHERE email IS NOT NULL GROUP BY email HAVING count(*)>1`
  );
  console.log("duplicate emails:", JSON.stringify(dup.rows));
  const recent = await client.query(
    `SELECT id, email, created_at FROM public.users ORDER BY created_at DESC LIMIT 10`
  );
  console.log("recent users:", JSON.stringify(recent.rows, null, 1));
  const profiles = await client.query(
    `SELECT count(*)::int AS n, count(replit_user_id)::int AS linked FROM public.profiles`
  );
  console.log("profiles:", JSON.stringify(profiles.rows[0]));
} catch (e) {
  console.log("ERROR:", e.message);
} finally { await client.end(); }
