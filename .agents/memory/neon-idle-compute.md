---
name: Neon idle compute
description: Keep periodic database maintenance from waking Neon while preserving challenge-expiration behavior.
---

Avoid routine background database sweeps for challenge expiry and tournament awards. Expire invitations when relevant challenge data is requested, while keeping the existing seven-day expiry cutoff and per-challenge acceptance checks. Run idempotent tournament award checks when badge or tournament data is requested, not on an hourly timer.

**Why:** The user asked to reduce Neon compute hours; recurring database timers prevent idle compute from suspending. Challenge expiry semantics still need to remain consistent.

**How to apply:** Before adding scheduled database work, check whether it can run on demand. Also review client-side polling separately, since active frontend refetch intervals can still keep Neon busy.
