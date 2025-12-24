"""
Test script to verify greeting detection logic
"""

# Test greeting detection logic
greeting_keywords = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
short_greetings = ['ok', 'thanks', 'thank you', 'bye', 'goodbye']

test_cases = [
    ("hi", True),
    ("hello", True),
    ("hey", True),
    ("good morning", True),
    ("hello there", True),
    ("hi how are you", True),
    ("what is a sensor?", False),
    ("explain actuators", False),
    ("tell me about robotics", False),
    ("ok", True),
    ("thanks", True),
    ("thank you", True),
]

print("Testing greeting detection logic:\n")
for message, expected_is_greeting in test_cases:
    message_lower = message.lower().strip()
    is_greeting = any(message_lower == greeting or message_lower.startswith(greeting + ' ')
                     for greeting in greeting_keywords) or message_lower in short_greetings

    status = "PASS" if is_greeting == expected_is_greeting else "FAIL"
    print(f"{status} | '{message}' -> is_greeting={is_greeting} (expected={expected_is_greeting})")

print("\n" + "="*60)
print("All tests completed!")
