---
name: Daily login rewards
description: How the daily login reward system works — streak tracking, gem formula, and where claim is triggered.
---

# Daily Login Rewards

## Rule
- Profiles have `loginStreak` (int) and `lastLoginDate` (date) columns in the DB.
- `POST /api/profiles/:id/claim-login-reward` awards gems once per day, server-side dedup.
- Gem formula: `Math.min(loginStreak, 7)` — caps at 7 gems/day.
- Consecutive days increment streak; any gap resets to 1.

**Why:** Streak is server-side so it can't be gamed via localStorage. Already-claimed check compares lastLoginDate to today UTC.

**How to apply:** `claimReward(profileId)` is called in `use-auth.tsx` via the `onProfileSynced` callback passed to `AuthProvider`. The `LoginRewardModal` is rendered in `Router()` in App.tsx and shown only when `!alreadyClaimed`.
