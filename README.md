# Sudajumak Bot Demo

This repository is a public, sanitized demo for the Sudajumak Telegram community reward bot project.

It is not the production bot source code. The production bot, dashboard, database schema, operational scripts, admin logic, and service configuration are private.

## What This Demo Shows

- A tiny mock reward engine for community chat activity.
- Cooldown-based message counting.
- Balance updates using in-memory state.
- A small test suite that demonstrates the expected behavior.

## What Is Not Included

- Telegram bot token handling.
- Supabase/Postgres connection code.
- Production database schema or migrations.
- Dashboard internals.
- Draw, settlement, item, operator, or admin implementation details.
- Real deployment scripts or production configuration.

## Run The Demo

```powershell
python -m demo.reward_engine examples/mock_events.json
```

Run tests:

```powershell
python -m unittest discover -s tests
```

## Architecture Boundary

This public demo is intentionally small. It demonstrates the idea of rewarding community activity without exposing the implementation used by the live service.

For details, see:

- `docs/architecture.md`
- `docs/security-boundaries.md`

## License

The code in this demo repository is licensed under Apache-2.0. This license applies only to this sanitized demo repository. It does not grant rights to the private production Sudajumak bot source code or service implementation.
