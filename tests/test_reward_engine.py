import unittest

from demo.reward_engine import ChatEvent, RewardState, run_demo


class RewardEngineTests(unittest.TestCase):
    def test_counts_eligible_message_once(self):
        state = RewardState(cooldown_seconds=30, minimum_message_length=3)
        event = ChatEvent(chat_id=1, user_id=10, message_id=100, timestamp=1000, text="hello")

        self.assertTrue(state.process_event(event))
        self.assertFalse(state.process_event(event))
        self.assertEqual(state.balances[10], 1)

    def test_respects_cooldown_per_chat_user(self):
        state = RewardState(cooldown_seconds=30, minimum_message_length=3)

        first = ChatEvent(chat_id=1, user_id=10, message_id=100, timestamp=1000, text="hello")
        too_soon = ChatEvent(chat_id=1, user_id=10, message_id=101, timestamp=1010, text="again")
        after_cooldown = ChatEvent(chat_id=1, user_id=10, message_id=102, timestamp=1030, text="again")

        self.assertTrue(state.process_event(first))
        self.assertFalse(state.process_event(too_soon))
        self.assertTrue(state.process_event(after_cooldown))
        self.assertEqual(state.balances[10], 2)

    def test_ignores_short_messages(self):
        state = RewardState(cooldown_seconds=30, minimum_message_length=3)
        event = ChatEvent(chat_id=1, user_id=10, message_id=100, timestamp=1000, text="hi")

        self.assertFalse(state.process_event(event))
        self.assertEqual(state.balances, {})

    def test_run_demo_returns_balances(self):
        events = [
            ChatEvent(chat_id=1, user_id=10, message_id=100, timestamp=1000, text="hello"),
            ChatEvent(chat_id=1, user_id=20, message_id=101, timestamp=1001, text="hello"),
        ]

        self.assertEqual(run_demo(events), {10: 1, 20: 1})


if __name__ == "__main__":
    unittest.main()
