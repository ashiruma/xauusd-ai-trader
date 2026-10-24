"""
Unit tests for school quiz retry limitation, 10-minute study lockout, and two-lesson timeout reversal.
"""

import pytest
import time
from typing import List, Tuple


def calculate_reversal_lesson(current_lesson: int) -> int:
    """Calculates demoted lesson: max(1, current_lesson - 2)."""
    return max(1, current_lesson - 2)


def reverse_completed_lessons(completed_lessons: List[int], current_lesson: int) -> Tuple[int, List[int]]:
    """Revokes completed lessons >= target_lesson."""
    target_lesson = calculate_reversal_lesson(current_lesson)
    updated = sorted([n for n in completed_lessons if n < target_lesson])
    return target_lesson, updated


def test_reversal_lesson_calculation():
    assert calculate_reversal_lesson(5) == 3
    assert calculate_reversal_lesson(4) == 2
    assert calculate_reversal_lesson(3) == 1
    assert calculate_reversal_lesson(2) == 1
    assert calculate_reversal_lesson(1) == 1
    assert calculate_reversal_lesson(30) == 28


def test_reverse_completed_lessons_pruning():
    # Progress on Lesson 5 (lessons 1, 2, 3, 4 completed)
    target, updated = reverse_completed_lessons([1, 2, 3, 4], 5)
    assert target == 3
    assert updated == [1, 2]

    # Progress on Lesson 4 (lessons 1, 2, 3 completed)
    target, updated = reverse_completed_lessons([1, 2, 3], 4)
    assert target == 2
    assert updated == [1]

    # Progress on Lesson 3 (lessons 1, 2 completed)
    target, updated = reverse_completed_lessons([1, 2], 3)
    assert target == 1
    assert updated == []

    # Progress on Lesson 2 (lesson 1 completed)
    target, updated = reverse_completed_lessons([1], 2)
    assert target == 1
    assert updated == []

    # Progress on Lesson 1
    target, updated = reverse_completed_lessons([], 1)
    assert target == 1
    assert updated == []


def test_one_retry_and_lockout_state_machine():
    MANDATORY_STUDY_MS = 10 * 60 * 1000  # 10 minutes
    TOTAL_TIMEOUT_MS = 20 * 60 * 1000    # 20 minutes

    # Initial state
    fails = 0
    locked_until = None
    timeout_at = None

    # Attempt 1: Fail -> 1 retry remaining
    fails += 1
    assert fails == 1
    assert locked_until is None  # Not locked yet

    # Attempt 2 (the 1 allowed retry): Fail -> Failed twice!
    fails += 1
    assert fails == 2
    now = int(time.time() * 1000)
    locked_until = now + MANDATORY_STUDY_MS
    timeout_at = now + TOTAL_TIMEOUT_MS

    # Verify locked during first 10 minutes
    current_time = now + (5 * 60 * 1000)  # 5 minutes in
    is_locked = current_time < locked_until
    is_timed_out = current_time >= timeout_at
    assert is_locked is True
    assert is_timed_out is False

    # Verify unlocked after 10 minutes before 20 minutes
    current_time = now + (11 * 60 * 1000)  # 11 minutes in
    is_locked = current_time < locked_until
    is_timed_out = current_time >= timeout_at
    assert is_locked is False
    assert is_timed_out is False

    # Verify timeout reached at 21 minutes -> Triggers reversal!
    current_time = now + (21 * 60 * 1000)
    is_timed_out = current_time >= timeout_at
    assert is_timed_out is True
    target_lesson, updated_progress = reverse_completed_lessons([1, 2, 3, 4], 5)
    assert target_lesson == 3
    assert updated_progress == [1, 2]
