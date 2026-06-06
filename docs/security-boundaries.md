# Security Boundaries

This repository is safe to publish because it does not include production secrets or production implementation details.

## Excluded From This Repo

- Bot tokens.
- Supabase connection strings.
- API keys.
- Production logs.
- Real chat IDs, user IDs, or operational records.
- Production database schema and migrations.
- Dashboard authentication or dashboard internals.
- Admin/operator permission implementation.

## Review Rule

Before publishing updates, scan for credentials and production-only files. This repo should remain a high-level demo, not a copy of the live service.
