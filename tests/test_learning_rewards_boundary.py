"""Frontend-only fail-closed tests, not an authenticated transaction integration.

Never run the Python/trading app. Use an isolated loopback Next production build.
Signed fixtures are adversarial claims, NOT genuine verified identities.
"""
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import time
import unittest

from test_course_boundary import fingerprints, find_leak, request

ROOT = Path(__file__).resolve().parents[1]


def cookie_for(principal, **overrides):
    secret = os.environ.get('COURSE_BOUNDARY_TEST_SECRET')
    if not secret:
        raise RuntimeError('An ephemeral isolated frontend test secret is required')
    payload = {
        'accountId': principal, 'mt5Account': principal,
        'email': principal + '@example.invalid', 'role': 'trader',
        'verified': True, 'schoolCompleted': True,
        'accountLinked': False, 'tradingActivated': False,
        'exp': int(time.time()) + 300,
    }
    payload.update(overrides)
    def encode(value):
        return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).rstrip(b'=')
    message = encode({'alg': 'HS256', 'typ': 'JWT'}) + b'.' + encode(payload)
    signature = base64.urlsafe_b64encode(hmac.new(secret.encode(), message, hashlib.sha256).digest()).rstrip(b'=')
    return 'jm_auth_session=' + (message + b'.' + signature).decode()


class LearningRewardsBoundary(unittest.TestCase):
    def assert_unavailable(self, route, cookie='', payload=None, extra_headers=None):
        headers = {'Content-Type': 'application/json', 'Cookie': cookie, **(extra_headers or {})}
        status, response_headers, blob = request(route, headers, payload)
        self.assertEqual(status, 503)
        self.assertIn('private', response_headers.get('Cache-Control', ''))
        self.assertIn('no-store', response_headers.get('Cache-Control', ''))
        self.assertFalse(bool(response_headers.get('Set-Cookie')), 'No completion/reward cookie may be issued')
        data = json.loads(blob)
        self.assertEqual(data.get('error'), 'LEARNING_AUTHORITY_UNAVAILABLE')
        for key in ('points', 'badges', 'streak', 'currentStreak', 'completedLessons', 'isComplete', 'tradingActivated', 'principalId', 'accountId'):
            self.assertNotIn(key, data, 'Unavailable is not a fabricated balance or completion')
        self.assertIsNone(find_leak(blob, fingerprints()), 'Protected content detected; response suppressed')
        return blob

    def test_anonymous_reads_and_reward_write_are_unavailable(self):
        for route in ('/api/school/rewards', '/api/school/progress'):
            self.assert_unavailable(route)
        self.assert_unavailable('/api/school/rewards', payload=b'{}')

    def test_locked_expired_revoked_and_asserted_verified_claims_cannot_mint(self):
        claims = ({'verified': False, 'schoolCompleted': False},
                  {'exp': int(time.time()) - 30}, {'revoked': True}, {}, {'role': 'admin'})
        for override in claims:
            cookie = cookie_for('learner-a', **override)
            for route in ('/api/school/rewards', '/api/school/progress'):
                self.assert_unavailable(route, cookie)
            self.assert_unavailable('/api/school/rewards', cookie, b'{"points":999,"currentStreak":365}')

    def test_forged_identity_and_cross_user_parameters_are_ignored_not_authorized(self):
        cookies = ('jm_auth_session=forged; velarion_admin_token=forged', cookie_for('learner-a'), cookie_for('learner-b'))
        payload = json.dumps({'principalId': 'learner-b', 'account_id': 'learner-b', 'lessonId': 30,
                              'schoolCompleted': True, 'verified': True, 'points': 999,
                              'completedLessons': list(range(1, 31)), 'occurredAt': '2099-01-01T00:00:00.000Z'}).encode()
        for cookie in cookies:
            self.assert_unavailable('/api/school/rewards?principalId=learner-b', cookie)
            self.assert_unavailable('/api/school/progress?account_id=learner-b', cookie)
            self.assert_unavailable('/api/school/rewards', cookie, payload)
            self.assert_unavailable('/api/school/quiz/submit', cookie, payload)
            for lesson in (1, 6, 30):
                status, _, body = request(f'/academy/lesson-{lesson}?principalId=learner-b&points=999', {'Cookie': cookie})
                self.assertEqual(status, 200)
                self.assertIn(b'Lesson content temporarily unavailable', body)
                self.assertIsNone(find_leak(body, fingerprints()), 'Protected response suppressed')

    def test_replay_and_parallel_submissions_never_issue_rewards(self):
        payload = b'{"eventId":"replay-1","lessonId":1,"answers":[0],"completed":true}'
        cookie = cookie_for('learner-a')
        def submit(_):
            return self.assert_unavailable('/api/school/rewards', cookie, payload)
        with ThreadPoolExecutor(max_workers=4) as pool:
            bodies = list(pool.map(submit, range(12)))
        self.assertEqual(len(set(bodies)), 1)
        for _ in range(3):
            self.assert_unavailable('/api/school/quiz/submit', cookie, payload)

    def test_no_persistence_dependency_does_not_fall_back_to_claims(self):
        # No persistence is connected in this isolated frontend. This proves
        # closed behavior, NOT transaction rollback on a real database failure.
        cookie = cookie_for('learner-a', points=600, streak=365, schoolCompleted=True)
        for route in ('/api/school/rewards', '/api/school/progress', '/api/school/quiz/submit'):
            self.assert_unavailable(route, cookie, None if route.endswith('progress') else b'{}')

    def test_malformed_and_cross_origin_reward_submissions_remain_closed(self):
        for payload in (b'not-json', b'null', b'[]', b'{"__proto__":{"verified":true}}'):
            self.assert_unavailable('/api/school/rewards', payload=payload, extra_headers={'Origin': 'https://attacker.invalid'})

    def test_direct_progress_self_marking_stays_denied(self):
        status, headers, _ = request('/api/school/progress', {'Content-Type': 'application/json'}, b'{"schoolCompleted":true}')
        self.assertEqual(status, 400)
        self.assertFalse(headers.get('Set-Cookie'))
        self.assertIn('no-store', headers.get('Cache-Control', ''))

    def test_unavailable_routes_have_no_auth_store_content_or_backend_dependencies(self):
        for name in ('rewards', 'progress', 'quiz/submit'):
            source = (ROOT / 'app/api/school' / name / 'route.ts').read_text()
            imports = re.findall(r"from\s+['\"]([^'\"]+)['\"]", source)
            self.assertEqual(imports, ['next/server'])
            self.assertIsNone(re.search(r'\b(fetch|cookies|signSession|proposeRewardTransition)\s*\(', source))
        for directory in ('app', 'components', 'lib'):
            for path in (ROOT / directory).rglob('*'):
                if path.suffix in ('.ts', '.tsx', '.js', '.mjs'):
                    self.assertNotIn('proposals/learning', path.read_text(), 'Draft policy must remain unwired')

    def test_academy_discloses_unavailability_and_has_no_client_completion_state(self):
        source = (ROOT / 'app/academy/page.tsx').read_text()
        for forbidden in ('localStorage', 'parseCourseProgress', 'saveCourseProgress', 'schoolCompleted', 'setCompletedLessons'):
            self.assertNotIn(forbidden, source)
        status, _, body = request('/academy')
        self.assertEqual(status, 200)
        for text in (b'PROPOSED EXPERIENCE', b'Verified progress unavailable', b'No points, badges or streaks are currently recorded', b'Kenyan legal review remains a pre-launch requirement', b'IB conflict disclosure'):
            self.assertIn(text, body)

    @unittest.skip('BLOCKED: no approved identity provider/stable verified learner principal or authoritative store')
    def test_real_verified_learner_reads_only_eligible_owned_content(self):
        pass

    @unittest.skip('BLOCKED: no real transactional grading/persistence; pure policy tests do not prove atomic awards')
    def test_real_permitted_completion_commits_progress_and_rewards_atomically(self):
        pass

    @unittest.skip('BLOCKED: no selected transactional store for rollback, concurrent replay and cross-owner integration')
    def test_real_persistence_failure_rolls_back_and_concurrency_awards_once(self):
        pass


if __name__ == '__main__':
    unittest.main()
