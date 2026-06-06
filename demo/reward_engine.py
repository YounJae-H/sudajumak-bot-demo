"""A tiny sanitized reward engine demo.

This file intentionally does not contain Telegram, database, dashboard, draw,
settlement, admin, or production service logic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
import sys
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class ChatEvent:
    chat_id: int
    user_id: int
    message_id: int
    timestamp: int
    text: str


@dataclass
class RewardState:
    cooldown_seconds: int = 30
    minimum_message_length: int = 3
    balances: dict[int, int] = field(default_factory=dict)
    last_counted_at: dict[tuple[int, int], int] = field(default_factory=dict)
    counted_messages: set[tuple[int, int]] = field(default_factory=set)

    def process_event(self, event: ChatEvent) -> bool:
        """Count one eligible event and return True when a reward was added."""
        event_key = (event.chat_id, event.message_id)
        user_key = (event.chat_id, event.user_id)

        if event_key in self.counted_messages:
            return False
        if len(event.text.strip()) < self.minimum_message_length:
            return False

        last_counted = self.last_counted_at.get(user_key)
        if last_counted is not None and event.timestamp - last_counted < self.cooldown_seconds:
            return False

        self.counted_messages.add(event_key)
        self.last_counted_at[user_key] = event.timestamp
        self.balances[event.user_id] = self.balances.get(event.user_id, 0) + 1
        return True


def load_events(path: Path) -> list[ChatEvent]:
    rows = json.loads(path.read_text(encoding="utf-8-sig"))
    return [ChatEvent(**row) for row in rows]


def run_demo(events: Iterable[ChatEvent]) -> dict[int, int]:
    state = RewardState()
    for event in events:
        state.process_event(event)
    return state.balances


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if len(args) != 1:
        print("Usage: python -m demo.reward_engine examples/mock_events.json")
        return 2

    balances = run_demo(load_events(Path(args[0])))
    print(json.dumps({str(user_id): balance for user_id, balance in sorted(balances.items())}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

