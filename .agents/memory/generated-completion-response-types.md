---
name: Generated completion response types
description: Runtime completion payloads can be richer than generated client mutation types.
---

When an endpoint returns a field that generated frontend types omit, read it through a narrow local response cast at the API boundary instead of editing generated files. Also check generated Zod response schemas: object parsing strips undeclared keys, even when the TypeScript type appears permissive.

**Why:** The server response contract can include optional reward fields such as XP or dynamic stat keys while generated output still resolves to an older model. Unknown response keys can disappear during runtime validation, so returning them from the route is not enough.

**How to apply:** Update the OpenAPI source and regenerate when the response contract changes. Keep direct customFetch fields typed at the boundary, and use a narrow cast only where a generated mutation callback still omits the field.