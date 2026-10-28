---
name: Mobile client backward compatibility
description: API and database rollout rules for older installed mobile builds.
---

Treat released Android app versions as long-lived clients. Backend and database changes should preserve compatibility by default: add schema fields and API response fields first, keep new request fields optional or defaulted, and retain old routes, field meanings, response envelopes, and enum values during rollout. Use expand-and-contract migrations; remove old fields or routes only after the compatibility window and adoption decision.

If a breaking change is unavoidable, introduce a versioned API or compatibility route. Enforce a minimum client version only after the relevant update-check path is already installed on the affected clients; older builds cannot display a prompt they do not contain.

**Why:** mobile users may defer app updates, and the Play in-app prompt only runs in builds that already include it.

**How to apply:** Before API or database changes, check the released mobile consumers, deploy backward-compatible server/schema changes first, then release the new app and postpone destructive cleanup.
