---
name: Generated completion response types
description: Runtime completion payloads can be richer than generated client mutation types.
---

When a completion endpoint returns a field that the generated frontend mutation type omits, read that field through a narrow local response cast at the API boundary instead of editing generated files.

**Why:** The server response contract can include optional reward fields such as XP while the generated mutation type still resolves to the base game model. Editing generated output would be overwritten and could create broader type drift.

**How to apply:** Keep the server response field typed in any direct customFetch response, and use a narrow cast only where a generated mutation callback needs the omitted field.