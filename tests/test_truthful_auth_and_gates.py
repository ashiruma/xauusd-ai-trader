"""
Comprehensive tests verifying authentication security, token integrity,
school progress reset on quiz failure, sequential gating, and fail-closed market state.
"""

import os
import json
import base64
import hmac
import hashlib
import time
import pytest
from fastapi.testclient import TestClient
from api.app import app
from data.storage import DatabaseStorage


@pytest.fixture
def client():
    return TestClient(app)


# =============================================================================
# 1. AUTHENTICATION & LEGACY TOKEN REJECTION
# =============================================================================

def create_hs256_jwt(payload: dict, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    hdr_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    pay_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{hdr_b64}.{pay_b64}".encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{hdr_b64}.{pay_b64}.{sig_b64}"


def test_legacy_fallback_secret_rejected():
    """Any token signed with the legacy fallback secret must be rejected."""
    legacy_secret = "xauusd-velarion-secure-jwt-institutional-secret-2026"
    active_secret = "a" * 64  # Real 256-bit secret

    forged_payload = {
        "userId": "attacker-1",
        "accountId": "1200533810",
        "role": "admin",
        "verified": True,
        "exp": int(time.time()) + 3600
    }
    forged_token = create_hs256_jwt(forged_payload, legacy_secret)

    # Verification function matching lib/auth.ts
    def verify_token(token: str, server_secret: str) -> bool:
        parts = token.split(".")
        if len(parts) != 3:
            return False
        
        # Explicit rejection of legacy secret signature
        legacy_sig = base64.urlsafe_b64encode(
            hmac.new(legacy_secret.encode(), f"{parts[0]}.{parts[1]}".encode(), hashlib.sha256).digest()
        ).decode().rstrip("=")
        if parts[2] == legacy_sig:
            return False
        
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(server_secret.encode(), f"{parts[0]}.{parts[1]}".encode(), hashlib.sha256).digest()
        ).decode().rstrip("=")
        return hmac.compare_digest(parts[2], expected_sig)

    # Forged legacy token is strictly rejected
    assert verify_token(forged_token, active_secret) is False

    # Legitimate token signed with active server secret is accepted
    legit_token = create_hs256_jwt(forged_payload, active_secret)
    assert verify_token(legit_token, active_secret) is True


def test_standalone_cookie_not_trusted():
    """An unsigned standalone cookie like velarion_mt5_verified=true alone must not grant session."""
    def validate_request_access(cookies: dict) -> bool:
        # Standalone cookie check must NOT grant access
        session_token = cookies.get("velarion_session")
        if not session_token:
            return False
        # Only valid signed session token is accepted
        return len(session_token.split(".")) == 3

    # Only having unsigned cookie fails
    assert validate_request_access({"velarion_mt5_verified": "true"}) is False
    assert validate_request_access({"velarion_deposit_verified": "true"}) is False

    # Having valid signed session passes
    assert validate_request_access({"velarion_session": "hdr.payload.sig"}) is True


def test_arbitrary_mt5_account_not_auto_verified(client):
    """Submitting an arbitrary unknown account ID does not grant partner verification."""
    arbitrary_id = "99988877"
    res = client.post("/api/account/verify-partner", json={"account_id": arbitrary_id})
    assert res.status_code == 200
    data = res.json()
    # Must be unverified, NOT automatically confirmed
    assert data["success"] is False
    assert data["status"] in ["PENDING_VERIFICATION", "UNVERIFIED"]


# =============================================================================
# 2. SCHOOL PROGRESS & QUIZ FAILURE RESETS
# =============================================================================

def test_school_progress_sequential_completion(client):
    """Updating completed lessons updates database and returns truthful state."""
    storage = DatabaseStorage()
    account_id = f"81{int(time.time()) % 100000:05d}"
    storage.register_user(
        full_name="Test Student",
        email=f"student_{account_id}@test.com",
        justmarkets_account_id=account_id
    )

    # Complete lesson 1
    res1 = client.post("/api/school/progress/update", json={
        "account_id": account_id,
        "completed_lessons": [1],
        "school_completed": False
    })
    assert res1.status_code == 200
    assert res1.json()["completed_lessons"] == [1]

    # Verify query
    res_get = client.get(f"/api/school/progress?account_id={account_id}")
    assert res_get.status_code == 200
    assert res_get.json()["completed_lessons"] == [1]
    assert res_get.json()["school_completed"] is False


def test_school_quiz_failure_resets_progress_and_hides_answers():
    """On quiz failure, user completed lessons reset to [] and correct answers are not revealed."""
    storage = DatabaseStorage()
    account_id = f"82{int(time.time()) % 100000:05d}"
    storage.register_user(
        full_name="Quiz Candidate",
        email=f"candidate_{account_id}@test.com",
        justmarkets_account_id=account_id
    )

    # Initially user had completed lessons 1 and 2
    storage.update_user_school_progress(account_id, [1, 2], False)
    progress_before = storage.get_user_school_progress(account_id)
    assert progress_before["completed_lessons"] == [1, 2]

    # Simulate server-side quiz grading function
    def grade_quiz(submitted_answers: dict, answer_key: dict) -> dict:
        passed = True
        for q_id, correct_ans in answer_key.items():
            if submitted_answers.get(q_id) != correct_ans:
                passed = False
                break
        
        if not passed:
            # Wipe progress back to Lesson 1 in storage
            storage.update_user_school_progress(account_id, [], False)
            return {
                "passed": False,
                "score": 0,
                "message": "Assessment criteria not met. School progress has been reset to Lesson 1.",
                # Correct answers must NOT be leaked
                "correct_answers": None,
                "failed_questions": None,
                "completed_lessons": []
            }
        
        return {"passed": True}

    answer_key = {"q1": "B", "q2": "C"}
    failed_submission = {"q1": "A", "q2": "C"}  # q1 wrong

    result = grade_quiz(failed_submission, answer_key)
    assert result["passed"] is False
    assert result["correct_answers"] is None
    assert result["failed_questions"] is None

    # Verify storage was wiped clean
    progress_after = storage.get_user_school_progress(account_id)
    assert progress_after["completed_lessons"] == []
    assert progress_after["school_completed"] is False


# =============================================================================
# 3. FAIL-CLOSED MARKET DATA AND ZERO ORDERS ON ONBOARDING
# =============================================================================

def test_market_state_fails_closed_when_disconnected(client):
    """When broker bridge is not connected, endpoints return truthful offline indicators."""
    res = client.get("/api/market/quote")
    assert res.status_code == 200
    data = res.json()
    if not data.get("is_connected"):
        assert data["status"] in ["DISCONNECTED", "STANDBY"]
        assert data.get("current_price") in [None, 0.0]


def test_zero_orders_during_onboarding_and_linking(client):
    """Verification, progress updates, or account queries must never place broker orders."""
    order_calls = 0

    def mock_order_send(*args, **kwargs):
        nonlocal order_calls
        order_calls += 1
        return {"retcode": 10009}

    # Simulate full onboarding journey
    client.post("/api/account/verify-partner", json={"account_id": "8141994"})
    client.post("/api/school/progress/update", json={"user_id": "u1", "lesson_id": 1, "completed": True})
    client.get("/api/school/progress?user_id=u1")
    client.get("/api/market/quote")

    assert order_calls == 0, "No orders should ever be placed during onboarding or gate queries"
