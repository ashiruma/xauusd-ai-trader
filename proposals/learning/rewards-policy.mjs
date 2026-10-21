/**
 * PROPOSED learning reward policy — pure arithmetic/state transition only.
 * Input is assumed to be a completion already verified by a trusted server;
 * this module does not establish identity, authorization, verification, or storage.
 * Production integration MUST NOT trust caller inputs and requires a real
 * transactional service for concurrency/idempotency. This module is not a mint
 * endpoint and has no runtime imports, adapters, network, or persistence.
 */

import { COURSE_MANIFEST } from '../../lib/course-manifest.ts';

// Core-only proposed reward scope; optional extensions require their own policy.
const CORE_NUMBERS = new Set(COURSE_MANIFEST.lessons.filter(lesson => COURSE_MANIFEST.requiredCoreLessonIds.includes(lesson.id)).map(lesson => lesson.globalNum));
export const POINTS_PER_LESSON = 20;
export const MAX_LESSONS = COURSE_MANIFEST.requiredCoreLessonIds.length;
export const MAX_POINTS = POINTS_PER_LESSON * MAX_LESSONS;

const LESSON_BADGES = new Set(COURSE_MANIFEST.checkpoints.map(checkpoint => checkpoint.lessonIds.length));
const STREAK_BADGES = new Set([3, 7]);

function fail(message) {
  throw new TypeError(message);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') fail(`${name} must be a non-empty string`);
  return value;
}

// Require canonical UTC ISO timestamps with seconds, optional milliseconds, and Z.
function utcInstant(value, name) {
  requireString(value, name);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match) fail(`${name} must be a valid UTC ISO timestamp ending in Z`);
  const [, ys, mos, ds, hs, mis, ss] = match;
  const parts = [ys, mos, ds, hs, mis, ss].map(Number);
  const [year, month, day, hour, minute, second] = parts;
  if (year < 1000 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) fail(`${name} is invalid`);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) fail(`${name} is invalid`);
  const ms = match[7] ? Number(match[7].padEnd(3, '0')) : 0;
  const epoch = Date.UTC(year, month - 1, day, hour, minute, second, ms);
  if (!Number.isFinite(epoch)) fail(`${name} is out of range`);
  return { epoch, day: `${ys}-${mos}-${ds}` };
}

function validateState(state) {
  if (!isRecord(state)) fail('existing state must be an object');
  requireString(state.principalId, 'state.principalId');
  if (!Array.isArray(state.completions) || !Array.isArray(state.events) || !Array.isArray(state.badges)) {
    fail('state completions, events, and badges must be arrays');
  }
  if (!Number.isSafeInteger(state.points) || state.points < 0 || state.points > MAX_POINTS) fail('state points are invalid');
  if (!Number.isSafeInteger(state.currentStreak) || state.currentStreak < 0 ||
      !Number.isSafeInteger(state.bestStreak) || state.bestStreak < state.currentStreak) fail('state streaks are invalid');
  const completionLessons = new Set();
  for (const c of state.completions) {
    if (!isRecord(c) || !CORE_NUMBERS.has(c.lessonId)) fail('state contains an invalid completion');
    requireString(c.version, 'completion.version');
    requireString(c.eventId, 'completion.eventId');
    utcInstant(c.completedAt, 'completion.completedAt');
    if (completionLessons.has(c.lessonId)) fail('state has duplicate lesson completions');
    completionLessons.add(c.lessonId);
  }
  const eventIds = new Set();
  let priorEpoch = -Infinity;
  for (const e of state.events) {
    if (!isRecord(e)) fail('state contains an invalid event');
    requireString(e.eventId, 'event.eventId');
    requireString(e.principalId, 'event.principalId');
    const { epoch } = utcInstant(e.completedAt, 'event.completedAt');
    if (eventIds.has(e.eventId) || e.principalId !== state.principalId || epoch < priorEpoch) fail('state event history is invalid');
    eventIds.add(e.eventId);
    priorEpoch = epoch;
  }
  if (state.completions.length !== completionLessons.size || state.points !== completionLessons.size * POINTS_PER_LESSON) fail('state points/completions are inconsistent');
  if (state.badges.some(b => typeof b !== 'string') || new Set(state.badges).size !== state.badges.length) fail('state badges are invalid');
}

export function createRewardState(principalId) {
  requireString(principalId, 'principalId');
  return { principalId, points: 0, completions: [], events: [], currentStreak: 0, bestStreak: 0, badges: [] };
}

/**
 * Propose a transition for an already-server-verified completion event.
 * event fields: { principalId, eventId, lessonId, version, completedAt }.
 * `completedAt` must be authoritative server UTC time, not a browser claim.
 * Replays of the same exact event are no-ops; reuse with different content rejects.
 */
export function proposeRewardTransition(existing, event) {
  validateState(existing);
  if (!isRecord(event)) fail('event must be an object');
  requireString(event.principalId, 'event.principalId');
  requireString(event.eventId, 'event.eventId');
  requireString(event.version, 'event.version');
  if (!CORE_NUMBERS.has(event.lessonId)) fail('lessonId must identify a required core lesson');
  const { epoch, day } = utcInstant(event.completedAt, 'event.completedAt');
  if (event.principalId !== existing.principalId) fail('event principal does not match state principal');

  const priorEvent = existing.events.find(item => item.eventId === event.eventId);
  if (priorEvent) {
    const matches = priorEvent.principalId === event.principalId && priorEvent.lessonId === event.lessonId &&
      priorEvent.version === event.version && priorEvent.completedAt === event.completedAt;
    if (!matches) fail('eventId collision: event content differs from prior event');
    return { state: structuredClone(existing), awarded: false, replay: true, newlyAwardedBadges: [] };
  }

  const last = existing.events.at(-1);
  if (last && epoch < utcInstant(last.completedAt, 'last event completedAt').epoch) fail('events must be chronological per principal');

  // A lesson earns at most once across every version; retries/versions are recorded for idempotency but never score.
  const next = structuredClone(existing);
  next.events.push({ principalId: event.principalId, eventId: event.eventId, lessonId: event.lessonId, version: event.version, completedAt: event.completedAt });
  const alreadyCompleted = existing.completions.some(item => item.lessonId === event.lessonId);
  if (alreadyCompleted) return { state: next, awarded: false, replay: false, newlyAwardedBadges: [] };

  // Non-qualifying repeats may be audit events but never bridge an inactive day.
  const lastCompletion = existing.completions.at(-1);
  const previousDay = lastCompletion ? utcInstant(lastCompletion.completedAt, 'last completion completedAt').day : null;
  if (previousDay === day) {
    // A second qualifying event on one UTC day does not increase a streak.
  } else if (previousDay && dayDistance(previousDay, day) === 1) {
    next.currentStreak += 1;
  } else {
    // Missed day (or first completion) resets only the current streak.
    next.currentStreak = 1;
  }
  next.bestStreak = Math.max(next.bestStreak, next.currentStreak);
  next.completions.push({ lessonId: event.lessonId, version: event.version, eventId: event.eventId, completedAt: event.completedAt });
  next.points += POINTS_PER_LESSON;
  const earned = [];
  const lessonCount = next.completions.length;
  if (LESSON_BADGES.has(lessonCount)) earned.push(`lessons-${lessonCount}`);
  if (STREAK_BADGES.has(next.currentStreak)) earned.push(`streak-${next.currentStreak}`);
  for (const badge of earned) if (!next.badges.includes(badge)) next.badges.push(badge);
  return { state: next, awarded: true, replay: false, newlyAwardedBadges: earned.filter(badge => !existing.badges.includes(badge)) };
}

function dayDistance(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000;
}

/**
 * Proposed read projection using trusted server UTC time. A lapsed streak displays
 * as zero even before another completion arrives; persistent learning is unchanged.
 * This is not a client clock, identity check or persistence mechanism.
 */
export function displayedCurrentStreak(existing, serverNow) {
  validateState(existing);
  const now = utcInstant(serverNow, 'serverNow');
  const last = existing.completions.at(-1);
  if (!last) return 0;
  const completed = utcInstant(last.completedAt, 'last completion completedAt');
  if (now.epoch < completed.epoch) fail('serverNow precedes last completion');
  return dayDistance(completed.day, now.day) > 1 ? 0 : existing.currentStreak;
}
