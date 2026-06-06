# Demo Architecture

This demo contains only a mock reward engine.

## Flow

1. A JSON file provides mock chat events.
2. `demo.reward_engine` loads the events.
3. `RewardState.process_event` checks message length, duplicate message IDs, and per-user cooldown.
4. Eligible events add one point to the in-memory balance map.
5. The command prints the resulting balances as JSON.

## Production Separation

The live Sudajumak service has Telegram integration, persistent storage, dashboard views, admin/operator permissions, draw records, settlement logic, and operational safeguards. Those implementation details are intentionally not part of this public demo.
