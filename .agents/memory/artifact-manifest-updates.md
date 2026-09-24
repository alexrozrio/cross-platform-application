---
name: Artifact manifest updates
description: How to safely change managed artifact.toml configuration.
---

Managed `.replit-artifact/artifact.toml` files reject direct edits. Write the complete updated TOML to a temporary sibling file and use the validated artifact TOML replacement callback with absolute paths.

**Why:** The artifact system protects the manifest so workflow, preview, and production settings cannot be accidentally corrupted by ordinary file edits.

**How to apply:** Preserve the existing manifest, make the smallest configuration change, validate and replace it through the artifact flow, then remove the temporary file.