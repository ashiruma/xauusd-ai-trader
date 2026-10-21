"""Loopback frontend containment only; no broker, Python app or trading services.
Signed fixtures are hostile legacy claims, not proof of identity or real graduation.
"""
import json
from pathlib import Path
import unittest
from test_course_boundary import request
from test_learning_rewards_boundary import cookie_for

ROOT = Path(__file__).resolve().parents[1]

class CurriculumContainment(unittest.TestCase):
    def test_legacy_early_and_all_core_flags_cannot_activate_or_resume(self):
        path = ROOT / 'data/automation_state.json'
        before = path.read_bytes() if path.exists() else None
        for role in ('trader', 'admin'):
            cookie = cookie_for('legacy-five', role=role, schoolCompleted=True, accountLinked=True,
                                completedLessons=[1, 2, 3, 4, 5], tradingActivated=True)
            for action in ('ACTIVATE_DEMO', 'RESUME'):
                body = json.dumps({'action': action, 'environment': 'DEMO',
                                   'confirmAccount': True, 'confirmEnvironment': True,
                                   'confirmStrategy': True, 'confirmRiskSettings': True,
                                   'completedLessons': list(range(1, 31))}).encode()
                status, headers, blob = request('/api/automation/control', {'Cookie': cookie, 'Content-Type': 'application/json'}, body)
                self.assertEqual(status, 503)
                self.assertEqual(json.loads(blob)['error'], 'CORE_GRADUATION_UNAVAILABLE')
                self.assertIn('private', headers.get('Cache-Control', ''))
                self.assertIn('no-store', headers.get('Cache-Control', ''))
                self.assertFalse(headers.get('Set-Cookie'))
        self.assertEqual(path.read_bytes() if path.exists() else None, before)

    def test_access_activation_unavailable_before_cookie_or_file_side_effects(self):
        path = ROOT / 'data/live_trades.json'
        before = path.read_bytes() if path.exists() else None
        for cookie in ('', cookie_for('legacy-five'), cookie_for('claimed-owner', role='admin')):
            body = json.dumps(dict.fromkeys(('acceptMarketRisk', 'acceptExecutionRisk', 'acceptIbCompensation', 'acceptSimulationDisclaimer'), True)).encode()
            status, headers, blob = request('/api/access/activate', {'Cookie': cookie, 'Content-Type': 'application/json'}, body)
            self.assertEqual(status, 503)
            self.assertEqual(json.loads(blob)['error'], 'CORE_GRADUATION_UNAVAILABLE')
            self.assertIn('no-store', headers.get('Cache-Control', ''))
            self.assertFalse(headers.get('Set-Cookie'))
        self.assertEqual(path.read_bytes() if path.exists() else None, before)

    def test_member_school_lists_all_required_summaries_without_graduating_owner(self):
        cookie = cookie_for('claimed-owner', role='admin', schoolCompleted=True)
        status, _, blob = request('/school', {'Cookie': cookie})
        self.assertEqual(status, 200)
        text = blob.decode()
        self.assertIn('Verified progress unavailable', text)
        self.assertNotIn('AUTOMATION QUALIFIED', text)
        self.assertNotIn('5/5 Passed', text)
        for lesson in range(1, 31):
            self.assertIn(f'/academy/lesson-{lesson}', text)
        status, _, blob = request('/api/automation/status', {'Cookie': cookie})
        self.assertEqual(status, 200)
        self.assertFalse(json.loads(blob)['userSession']['schoolCompleted'])

    def test_summary_five_continues_to_six_and_last_core_returns_to_catalogue(self):
        status, _, blob = request('/academy/lesson-5')
        self.assertEqual(status, 200)
        self.assertIn(b'/academy/lesson-6', blob)
        self.assertIn(b'Lesson content temporarily unavailable', blob)
        status, _, blob = request('/academy/lesson-30')
        self.assertEqual(status, 200)
        self.assertIn(b'Return to catalog', blob)
        self.assertNotIn(b'/academy/lesson-31', blob)

    def test_legacy_claims_not_read_by_learning_gate_and_enabling_actions_gate_before_io(self):
        source = (ROOT / 'lib/access-control.ts').read_text()
        self.assertNotIn('/api/school/progress', source)
        self.assertNotIn('session.schoolCompleted', source)
        self.assertIn('const canActivateTrading = false', source)
        for route in ('app/api/access/activate/route.ts', 'app/api/automation/control/route.ts'):
            source = (ROOT / route).read_text()
            gate = source.index('CORE_GRADUATION_UNAVAILABLE')
            self.assertLess(gate, source.index('fs.writeFile'))
            if 'control' in route:
                self.assertLess(gate, source.index('fs.readFile'))
                self.assertIn("action === 'ACTIVATE_DEMO' || action === 'RESUME'", source)
                self.assertIn("action === 'PAUSE'", source)
                self.assertIn("action === 'EMERGENCY_STOP'", source)

if __name__ == '__main__':
    unittest.main()
