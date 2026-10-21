import test from 'node:test';
import assert from 'node:assert/strict';
import { createRewardState, proposeRewardTransition, MAX_POINTS } from '../proposals/learning/rewards-policy.mjs';

function completion(state, { eventId = `e${state.events.length + 1}`, lessonId = state.completions.length + 1,
  version = 'v1', completedAt = '2024-01-01T12:00:00Z', principalId = state.principalId } = {}) {
  return proposeRewardTransition(state, { eventId, lessonId, version, completedAt, principalId });
}

function add(state, spec) { return completion(state, spec).state; }

test('awards 20 noncash points once for a lesson regardless of version; total is capped at 600', () => {
  let state = createRewardState('learner-a');
  let result = completion(state, { lessonId: 1, version: 'v1' });
  assert.equal(result.state.points, 20);
  state = result.state;
  result = completion(state, { eventId: 'new-version', lessonId: 1, version: 'v2', completedAt: '2024-01-02T12:00:00Z' });
  assert.equal(result.awarded, false);
  assert.equal(result.state.points, 20);
  for (let lessonId = 2; lessonId <= 30; lessonId++) {
    state = add(state, { eventId: `lesson-${lessonId}`, lessonId, completedAt: `2024-01-${String(Math.min(31, lessonId + 2)).padStart(2, '0')}T12:00:00Z` });
  }
  assert.equal(state.points, MAX_POINTS);
  assert.equal(state.completions.length, 30);
  assert.equal(state.badges.includes('lessons-30'), true);
});

test('event replay is idempotent; event ID reuse with different content rejects', () => {
  const state = createRewardState('a');
  const event = { principalId: 'a', eventId: 'same', lessonId: 1, version: 'v1', completedAt: '2024-01-01T00:00:00Z' };
  const once = proposeRewardTransition(state, event).state;
  const replay = proposeRewardTransition(once, event);
  assert.equal(replay.replay, true);
  assert.deepEqual(replay.state, once);
  assert.throws(() => proposeRewardTransition(once, { ...event, lessonId: 2 }), /collision/);
});

test('UTC same-day qualifying completions do not increment the streak twice', () => {
  let state = createRewardState('a');
  state = add(state, { lessonId: 1, completedAt: '2024-06-01T01:00:00Z' });
  const next = add(state, { lessonId: 2, completedAt: '2024-06-01T23:59:59Z' });
  assert.equal(next.currentStreak, 1);
});

test('consecutive UTC dates handle leap day and year boundary; streak badge is one-time', () => {
  let state = createRewardState('a');
  state = add(state, { lessonId: 1, completedAt: '2024-02-28T23:00:00Z' });
  state = add(state, { lessonId: 2, completedAt: '2024-02-29T00:00:00Z' });
  state = add(state, { lessonId: 3, completedAt: '2024-03-01T00:00:00Z' });
  assert.equal(state.currentStreak, 3);
  assert.equal(state.bestStreak, 3);
  assert.ok(state.badges.includes('streak-3'));
  state = add(state, { lessonId: 4, completedAt: '2024-12-31T23:59:59Z' });
  state = add(state, { lessonId: 5, completedAt: '2025-01-01T00:00:00Z' });
  assert.equal(state.currentStreak, 2);
  assert.equal(state.badges.filter(b => b === 'streak-3').length, 1);
});

test('a missed day resets current streak only; lifetime best, completions, badges, and points remain', () => {
  let state = createRewardState('a');
  state = add(state, { lessonId: 1, completedAt: '2024-01-01T12:00:00Z' });
  state = add(state, { lessonId: 2, completedAt: '2024-01-02T12:00:00Z' });
  const prior = { best: state.bestStreak, count: state.completions.length, points: state.points, badges: [...state.badges] };
  state = add(state, { lessonId: 3, completedAt: '2024-01-04T12:00:00Z' });
  assert.equal(state.currentStreak, 1);
  assert.equal(state.bestStreak, prior.best);
  assert.equal(state.completions.length, prior.count + 1);
  assert.equal(state.points, prior.points + 20);
  assert.deepEqual(state.badges.slice(0, prior.badges.length), prior.badges);
});

test('lesson count badges occur at 1, 5, and 15; no mastery is asserted', () => {
  let state = createRewardState('a');
  for (let lessonId = 1; lessonId <= 15; lessonId++) {
    state = add(state, { lessonId, completedAt: `2024-01-${String(lessonId).padStart(2, '0')}T12:00:00Z` });
  }
  assert.deepEqual(state.badges.filter(b => b.startsWith('lessons-')), ['lessons-1', 'lessons-5', 'lessons-15']);
  assert.equal(state.mastery, undefined);
});

test('rejects invalid lesson, malformed/non-UTC/impossible timestamp, scope mismatch, and out-of-order events', () => {
  const state = createRewardState('a');
  for (const lessonId of [0, 31, 1.5]) {
    assert.throws(() => completion(state, { lessonId }), /lessonId/);
  }
  for (const completedAt of ['2024-02-30T12:00:00Z', '2024-01-01T12:00:00', 'not-a-date', '2024-01-01T12:00:00+00:00']) {
    assert.throws(() => completion(state, { completedAt }), /UTC|invalid/);
  }
  assert.throws(() => completion(state, { principalId: 'b' }), /principal/);
  const later = add(state, { lessonId: 1, completedAt: '2024-01-03T00:00:00Z' });
  assert.throws(() => completion(later, { lessonId: 2, completedAt: '2024-01-02T23:59:59Z' }), /chronological/);
});

test('invalid proposal never mutates the provided input', () => {
  const state = createRewardState('a');
  const before = structuredClone(state);
  assert.throws(() => completion(state, { lessonId: 99 }));
  assert.deepEqual(state, before);
  const valid = completion(state, { lessonId: 1 });
  assert.deepEqual(state, before);
  assert.notEqual(valid.state, state);
});

test('non-qualifying repeats cannot bridge missed days or suppress a fresh same-day qualifying pass', () => {
  let state = createRewardState('a');
  state = add(state, { lessonId: 1, completedAt: '2024-01-01T12:00:00Z' });
  state = add(state, { lessonId: 1, completedAt: '2024-01-02T12:00:00Z' });
  state = add(state, { lessonId: 2, completedAt: '2024-01-03T12:00:00Z' });
  assert.equal(state.currentStreak, 1);
  state = add(state, { lessonId: 1, completedAt: '2024-01-04T10:00:00Z' });
  state = add(state, { lessonId: 3, completedAt: '2024-01-04T12:00:00Z' });
  assert.equal(state.currentStreak, 2);
  assert.equal(state.points, 60);
});

test('streak read projection expires with trusted server time but preserves earned learning', async () => {
  const { displayedCurrentStreak } = await import('../proposals/learning/rewards-policy.mjs');
  let state = createRewardState('a');
  state = add(state, { completedAt: '2024-01-01T12:00:00Z' });
  state = add(state, { completedAt: '2024-01-02T12:00:00Z' });
  const before = structuredClone(state);
  assert.equal(displayedCurrentStreak(state, '2024-01-03T23:59:59Z'), 2);
  assert.equal(displayedCurrentStreak(state, '2024-01-04T00:00:00Z'), 0);
  assert.deepEqual(state, before);
  assert.throws(() => displayedCurrentStreak(state, '2024-01-01T00:00:00Z'), /precedes/);
});
