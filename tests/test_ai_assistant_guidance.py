"""
Tests for Velarion AI Assistant: System Guidance, Member Funnel Support,
Least-Privilege Security, Loss Asymmetry Truthfulness, and Zero-Emoji Compliance.
"""

import json
import re
import pytest

# Pattern to strictly detect emojis in text responses
EMOJI_PATTERN = re.compile(
    r"[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf]", flags=re.UNICODE
)
BULLET_PATTERNS = ["&bull;", "\u2022", "\u00b7", "\u25cf"]


def test_assistant_knowledge_base_covers_core_topics():
    """Verify that knowledge topics exist and cover all required system guidance areas."""
    with open("lib/assistant-knowledge.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Verify key institutional concepts are represented in knowledge base
    assert "tohstb0d83" in content, "Knowledge base must cite official JustMarkets partner code"
    assert "Standard Cent Account (Minimum Deposit: $10)" in content
    assert "1 standard lot = 1 troy ounce" in content
    assert "Pro Account (Minimum Deposit: $200)" in content
    assert "Investor Password in MetaTrader 5 provides read-only authorization" in content
    assert "Master Trading Passwords Are Strictly Prohibited" in content
    assert "73.75%" in content and "-$163.57" in content, "Must explain loss asymmetry reality check"
    assert "Candidate Strategy v2" in content
    assert "EMERGENCY STOP" in content and "PAUSE" in content
    assert "ashirumaabala@gmail.com" in content
    assert "Smart Money Concepts" in content or "SMC" in content
    assert "Inner Circle Trader" in content or "ICT" in content
    assert "5 profitable trades" in content
    assert "Closing Balance > Starting Balance" in content


def test_assistant_compliance_zero_emojis_and_no_bullets():
    """Verify lib/assistant-knowledge.ts has ZERO emojis and ZERO decorative bullets."""
    with open("lib/assistant-knowledge.ts", "r", encoding="utf-8") as f:
        content = f.read()

    emojis_found = EMOJI_PATTERN.findall(content)
    assert len(emojis_found) == 0, f"Found emojis in knowledge base: {emojis_found}"

    for b in BULLET_PATTERNS:
        assert b not in content, f"Found prohibited bullet '{b}' in knowledge base"


def test_assistant_api_route_structure_and_safety_checks():
    """Verify app/api/assistant/chat/route.ts contains security checks for master passwords."""
    with open("app/api/assistant/chat/route.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Interception of attempted master password submission
    assert "master password" in content.lower()
    assert "SECURITY WARNING" in content
    assert "least-privilege investor (read-only) credentials" in content

    # Zero emojis check in route code
    emojis_found = EMOJI_PATTERN.findall(content)
    assert len(emojis_found) == 0, f"Found emojis in route.ts: {emojis_found}"


def test_assistant_widget_component_compliance():
    """Verify components/AiAssistantWidget.tsx adheres to zero emojis and provides quick guidance."""
    with open("components/AiAssistantWidget.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Verify zero emojis
    emojis_found = EMOJI_PATTERN.findall(content)
    assert len(emojis_found) == 0, f"Found emojis in AiAssistantWidget: {emojis_found}"

    # Verify initial guidance features
    assert "The 5-Step Member Funnel" in content
    assert "Account Sizing" in content
    assert "Forex School Guidance" in content
    assert "Least-Privilege Account Linking" in content
    assert "Trading Truth & Risk" in content
    assert "Request Human Support" in content


def test_human_support_escalation_system():
    """Verify human support escalation dispatch and zero-emoji compliance."""
    with open("lib/support-dispatch.ts", "r", encoding="utf-8") as f:
        dispatch_code = f.read()

    assert "ADMIN_EMAILS" in dispatch_code
    assert "TICK-" in dispatch_code
    assert "HUMAN SUPPORT ESCALATION" in dispatch_code

    emojis_found = EMOJI_PATTERN.findall(dispatch_code)
    assert len(emojis_found) == 0, f"Found emojis in support-dispatch.ts: {emojis_found}"

    with open("app/api/assistant/support/route.ts", "r", encoding="utf-8") as f:
        support_route = f.read()

    assert "dispatchHumanSupport" in support_route
    emojis_found = EMOJI_PATTERN.findall(support_route)
    assert len(emojis_found) == 0, f"Found emojis in support route: {emojis_found}"

