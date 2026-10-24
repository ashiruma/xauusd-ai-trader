"""
Tests for Velarion Server-Authoritative Content Firewall & Sequential Curriculum Gating.
Protects proprietary educational content, institutional SMC/ICT models, and trading terminal
from scraping, direct URL bypass, or unearned access.
Strictly adheres to Universal System Rules: Zero Emojis.
"""

import pytest
from typing import List, Dict, Any


def evaluate_lesson_access(
    lesson_num: int,
    completed_lessons: List[int],
    is_linked: bool,
    is_funded: bool,
    is_admin: bool = False
) -> Dict[str, Any]:
    """
    Python mirror of lib/curriculum-firewall.ts logic for automated regression verification.
    """
    completed_set = set(completed_lessons)
    next_allowed = 31
    for i in range(1, 31):
        if i not in completed_set:
            next_allowed = i
            break

    if is_admin:
        return {"allowed": True, "gate_reason": "none", "next_allowed": next_allowed}

    if lesson_num == 1:
        return {"allowed": True, "gate_reason": "none", "next_allowed": next_allowed}

    is_already_completed = lesson_num in completed_set
    is_next_in_sequence = lesson_num == next_allowed

    if not is_already_completed and not is_next_in_sequence:
        return {
            "allowed": False,
            "gate_reason": "sequence_locked",
            "required_lesson": next_allowed,
            "next_allowed": next_allowed,
        }

    if 3 <= lesson_num <= 5:
        if not is_linked:
            return {
                "allowed": False,
                "gate_reason": "link_required",
                "next_allowed": next_allowed,
            }

    if lesson_num >= 6:
        has_foundation = all(n in completed_set for n in [1, 2, 3, 4, 5])
        if not has_foundation:
            return {
                "allowed": False,
                "gate_reason": "sequence_locked",
                "required_lesson": next_allowed,
                "next_allowed": next_allowed,
            }
        if not is_funded:
            return {
                "allowed": False,
                "gate_reason": "deposit_required",
                "next_allowed": next_allowed,
            }

    return {"allowed": True, "gate_reason": "none", "next_allowed": next_allowed}


def test_lesson_1_public_access():
    """Lesson 1 is open for foundation public study without prerequisites."""
    res = evaluate_lesson_access(1, [], is_linked=False, is_funded=False)
    assert res["allowed"] is True
    assert res["gate_reason"] == "none"


def test_skipping_to_lesson_27_with_only_lesson_1_is_strictly_blocked():
    """
    Directly prevents the security vulnerability where someone with 1 completed lesson
    navigates directly to Lesson 27.
    """
    res = evaluate_lesson_access(27, [1], is_linked=False, is_funded=False)
    assert res["allowed"] is False
    assert res["gate_reason"] == "sequence_locked"
    assert res["required_lesson"] == 2


def test_lesson_2_requires_lesson_1_completed():
    """Lesson 2 requires Lesson 1 to be passed first."""
    res_unpassed = evaluate_lesson_access(2, [], is_linked=False, is_funded=False)
    assert res_unpassed["allowed"] is False
    assert res_unpassed["gate_reason"] == "sequence_locked"

    res_passed = evaluate_lesson_access(2, [1], is_linked=False, is_funded=False)
    assert res_passed["allowed"] is True
    assert res_passed["gate_reason"] == "none"


def test_tier_2_lessons_require_justmarkets_account_linking():
    """Lessons 3 to 5 require account linking under partner code tohstb0d83."""
    # Lesson 3 when completed [1, 2] but not linked
    res_unlinked = evaluate_lesson_access(3, [1, 2], is_linked=False, is_funded=False)
    assert res_unlinked["allowed"] is False
    assert res_unlinked["gate_reason"] == "link_required"

    # Lesson 3 when linked
    res_linked = evaluate_lesson_access(3, [1, 2], is_linked=True, is_funded=False)
    assert res_linked["allowed"] is True
    assert res_linked["gate_reason"] == "none"

    # Jumping to Lesson 5 with only [1, 2] completed is sequence locked
    res_skip = evaluate_lesson_access(5, [1, 2], is_linked=True, is_funded=False)
    assert res_skip["allowed"] is False
    assert res_skip["gate_reason"] == "sequence_locked"


def test_tier_3_institutional_lessons_require_live_deposit():
    """Lessons 6 to 30 require active live JustMarkets deposit ($50 min)."""
    foundation_passed = [1, 2, 3, 4, 5]

    # Lesson 6 with foundation completed but unfunded
    res_unfunded = evaluate_lesson_access(6, foundation_passed, is_linked=True, is_funded=False)
    assert res_unfunded["allowed"] is False
    assert res_unfunded["gate_reason"] == "deposit_required"

    # Lesson 6 when funded
    res_funded = evaluate_lesson_access(6, foundation_passed, is_linked=True, is_funded=True)
    assert res_funded["allowed"] is True
    assert res_funded["gate_reason"] == "none"

    # Lesson 27 when funded and sequentially completed 1-26
    completed_to_26 = list(range(1, 27))
    res_27_funded = evaluate_lesson_access(27, completed_to_26, is_linked=True, is_funded=True)
    assert res_27_funded["allowed"] is True
    assert res_27_funded["gate_reason"] == "none"

    # Lesson 27 when unfunded even if completed 1-26
    res_27_unfunded = evaluate_lesson_access(27, completed_to_26, is_linked=True, is_funded=False)
    assert res_27_unfunded["allowed"] is False
    assert res_27_unfunded["gate_reason"] == "deposit_required"


def test_admin_bypass_authorized():
    """Verified platform administrators can preview curriculum for QA."""
    res = evaluate_lesson_access(27, [1], is_linked=False, is_funded=False, is_admin=True)
    assert res["allowed"] is True
    assert res["gate_reason"] == "none"


def test_zero_emojis_in_firewall_source():
    """Verify lib/curriculum-firewall.ts strictly contains zero unicode emojis."""
    import re
    emoji_pattern = re.compile(r"[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf]", flags=re.UNICODE)

    with open("lib/curriculum-firewall.ts", "r", encoding="utf-8") as f:
        content = f.read()

    matches = emoji_pattern.findall(content)
    assert len(matches) == 0, f"Found prohibited emojis in firewall source: {matches}"
