import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSE_MANIFEST as manifest, REQUIRED_CORE_LESSON_IDS, CORE_LESSON_COUNT, EARLY_CHECKPOINT_ID,
  validateManifest, visibleLessons, indexableLessons, trackLabel, lessonNeighbors, projectProgress, prerequisitesMet, studyEligibility,
} from '../lib/course-manifest.ts';
import { buildPublicCatalogue, summaryById } from '../lib/course-catalogue.ts';
import { normalizeCourseProgress, nextCourseLesson } from '../lib/courseProgress.ts';

const evidence = (id, m = manifest) => ({ courseId: m.id, coreVersion: m.coreVersion, lessonId: id,
  contentVersion: m.lessons.find(lesson => lesson.id === id).contentVersion });
const allCore = REQUIRED_CORE_LESSON_IDS.map(id => evidence(id));
const extension = {
  ...manifest, version: 'core-1.extensions-1',
  tracks: manifest.tracks.map(track => track.id === 'smc-ict' ? { ...track, publication: 'summary-only' } : track),
  lessons: [...manifest.lessons, { id: 'smc1', globalNum: 31, route: '/academy/lesson-31', trackId: 'smc-ict',
    contentVersion: 'smc-1', publication: 'summary-only', prerequisiteIds: ['a8'] }],
};

test('manifest is consistent with public and private identity mappings without changing content', () => {
  validateManifest();
  assert.equal(CORE_LESSON_COUNT, 30); // Intentional independent regression of owner policy.
  const expected = [...Array.from({ length: 12 }, (_, i) => `b${i + 1}`), ...Array.from({ length: 10 }, (_, i) => `i${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `a${i + 1}`)];
  assert.deepEqual([...REQUIRED_CORE_LESSON_IDS], expected);
  const publicData = JSON.parse(readFileSync(new URL('../lib/curriculum-public.json', import.meta.url)));
  const privateData = JSON.parse(readFileSync(new URL('../lib/server/curriculum-data.json', import.meta.url))).lessons;
  for (const [i, id] of expected.entries()) {
    const lesson = manifest.lessons.find(item => item.id === id);
    assert.equal(lesson.globalNum, i + 1);
    assert.equal(lesson.route, `/academy/lesson-${i + 1}`);
    for (const data of [publicData, privateData]) assert.equal(data.find(item => item.id === id).globalNum, i + 1);
    assert.deepEqual(lesson.prerequisiteIds, i ? [expected[i - 1]] : []);
  }
});
test('every original core ID remains mandatory even when an optional lesson is complete', () => {
  validateManifest(extension);
  const optionalEvidence = evidence('smc1', extension);
  for (const id of REQUIRED_CORE_LESSON_IDS) {
    const state = projectProgress([...allCore.filter(item => item.lessonId !== id), optionalEvidence], extension);
    assert.equal(state.coreGraduated, false, `omitted ${id}`);
    assert.equal(state.coreCompleted, CORE_LESSON_COUNT - 1);
    assert.equal(state.optionalCompleted, 1);
  }
  assert.equal(projectProgress(allCore).coreGraduated, true);
});
test('early milestone is not graduation or automation eligibility; lesson six remains next', () => {
  const early = manifest.checkpoints.find(item => item.id === EARLY_CHECKPOINT_ID);
  assert.equal(early.lessonIds.length, 5); // Deliberate early checkpoint policy, not a gate.
  assert.equal(early.kind, 'milestone');
  const records = early.lessonIds.map(id => evidence(id));
  const progress = projectProgress(records);
  assert.equal(progress.earlyMilestone, true);
  assert.equal(progress.coreGraduated, false);
  assert.equal(progress.automationEligible, false);
  assert.equal(progress.nextRequired.id, 'b6');
  assert.equal(prerequisitesMet('b6', records), true);
  assert.equal(prerequisitesMet('b7', records), false);
  assert.equal(projectProgress(allCore).automationEligible, false);
});
test('optional lesson 31 extends navigation and cache membership, not core denominator/certificate or old completion', () => {
  assert.equal(visibleLessons(extension).length, manifest.lessons.length + 1);
  assert.equal(lessonNeighbors('a8', extension).next.id, 'smc1');
  assert.equal(lessonNeighbors('smc1', extension).previous.id, 'a8');
  assert.equal(lessonNeighbors('smc1', extension).next, undefined);
  assert.equal(lessonNeighbors('b1').previous, undefined);
  const state = projectProgress(allCore, extension);
  assert.equal(state.coreGraduated, true);
  assert.equal(state.corePercent, 100);
  assert.equal(state.coreTotal, CORE_LESSON_COUNT);
  assert.equal(state.optionalCompleted, 0);
  assert.equal(state.optionalTotal, 1);
  assert.equal(extension.certificatePolicyId, manifest.certificatePolicyId);
  assert.equal(nextCourseLesson(manifest.lessons.map(item => item.globalNum), extension), 31);
  assert.deepEqual(normalizeCourseProgress([31, 1, 31, 999], extension), [1, 31]);
  assert.deepEqual(normalizeCourseProgress([31, 1]), [1]);
  assert.equal(nextCourseLesson(extension.lessons.map(item => item.globalNum), extension), null);
  assert.equal(prerequisitesMet('smc1', allCore, extension), true);
  assert.equal(prerequisitesMet('smc1', allCore.filter(item => item.lessonId !== 'b1'), extension), false);
});
test('versioned evidence rejects legacy flags, unknown lessons and stale versions; extensions never grandfather passes', () => {
  const stale = allCore.map(record => ({ ...record, coreVersion: 'obsolete' }));
  assert.equal(projectProgress(stale).coreCompleted, 0);
  assert.equal(projectProgress([{ schoolCompleted: true }, { completed_lessons: [1,2,3,4,5] }]).coreGraduated, false);
  assert.equal(projectProgress([{ ...evidence('b1'), contentVersion: 'obsolete' }]).coreCompleted, 0);
  assert.equal(projectProgress([{ ...evidence('b1'), courseId: 'other' }]).coreCompleted, 0);
  assert.equal(projectProgress([{ ...evidence('b1'), lessonId: 'unknown' }]).coreCompleted, 0);
  assert.equal(projectProgress([...allCore, allCore[0]], extension).coreCompleted, CORE_LESSON_COUNT);
});
test('publication affects catalogue and navigation but never reopens suspended lessons or sitemap', () => {
  const draft = { ...extension, lessons: extension.lessons.map(item => item.id === 'smc1' ? { ...item, publication: 'draft' } : item) };
  assert.equal(visibleLessons(draft).length, visibleLessons(manifest).length);
  assert.equal(lessonNeighbors('a8', draft).next, undefined);
  assert.deepEqual(indexableLessons(extension), []);
  const published = { ...extension, lessons: extension.lessons.map(item => ({ ...item, publication: 'published' })) };
  assert.deepEqual(indexableLessons(published), []);
  assert.match(trackLabel('smc-ict', extension), /31/);
  assert.match(trackLabel('foundations'), /1–12/);
});
test('eligibility to study and sequential prerequisites are separate, not graduation checks', () => {
  assert.equal(studyEligibility(true, true, true), true);
  assert.equal(studyEligibility(true, true, false), false);
  assert.equal(prerequisitesMet('b1', []), true);
  assert.equal(prerequisitesMet('b2', []), false);
  assert.equal(prerequisitesMet('missing', []), false);
});
test('invalid mappings, duplicates, missing core, bad checkpoints and forward prerequisites reject', () => {
  assert.throws(() => validateManifest({ ...manifest, requiredCoreLessonIds: REQUIRED_CORE_LESSON_IDS.slice(1) }), /policy/);
  assert.throws(() => validateManifest({ ...manifest, lessons: manifest.lessons.slice(1) }), /Prerequisites|Missing required/);
  assert.throws(() => validateManifest({ ...manifest, lessons: [...manifest.lessons, manifest.lessons[0]] }), /Duplicate/);
  assert.throws(() => validateManifest({ ...manifest, lessons: manifest.lessons.map(item => item.id === 'b1' ? { ...item, prerequisiteIds: ['a8'] } : item) }), /Prerequisites/);
  assert.throws(() => validateManifest({ ...manifest, lessons: manifest.lessons.map(item => item.id === 'a8' ? { ...item, globalNum: 31, route: '/academy/lesson-31' } : item) }), /mapping/);
  assert.throws(() => validateManifest({ ...manifest, checkpoints: manifest.checkpoints.filter(item => item.id !== EARLY_CHECKPOINT_ID) }), /policy/);
});
test('safe consumers contain no hard-coded course caps or five-lesson graduation and boundaries remain fail closed', () => {
  const paths = ['lib/courseProgress.ts', 'lib/curriculum.ts', 'app/academy/page.tsx', 'app/academy/[lessonSlug]/page.tsx', 'app/school/page.tsx', 'components/CourseSchema.tsx', 'app/sitemap.ts', 'components/LessonQuiz.tsx', 'proposals/learning/rewards-policy.mjs', 'lib/access-control.ts'];
  for (const path of paths) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /slice\(0,\s*30\)|(?:LESSON_COUNT|MAX_LESSONS)\s*=\s*30|globalNum\s*(?:<\s*30|===\s*5)|Lessons 1[-–]5|Lessons 1 to 5/, path);
  }
  const gate = readFileSync(new URL('../components/CourseProgressGate.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(gate, /localStorage|return\s*<>\{children\}/);
  const authority = readFileSync(new URL('../lib/learning-authority.ts', import.meta.url), 'utf8');
  assert.match(authority, /import 'server-only'/);
  assert.match(authority, /return \{ available: false, complete: false \}/);
});

test('optional summary registration resolves stable routes and visible entries without text reject', () => {
  const summaries = JSON.parse(readFileSync(new URL('../lib/curriculum-public.json', import.meta.url)));
  assert.throws(() => buildPublicCatalogue(summaries, extension), /missing public summary/);
  for (const invalid of [{ title: '', summary: 'text' }, { title: 'Title', summary: ' ' }, { title: null, summary: 42 }]) {
    assert.throws(() => buildPublicCatalogue([...summaries, { id: 'smc1', ...invalid }], extension), /Invalid public summary text/);
  }
  const catalogue = buildPublicCatalogue([...summaries, { id: 'smc1', title: 'Synthetic optional lesson', summary: 'Test-only summary', secret: 'must not copy' }], extension);
  assert.equal(catalogue.length, summaries.length + 1);
  assert.equal(summaryById('lesson-31', catalogue).id, 'smc1');
  assert.equal(summaryById('31', catalogue).id, 'smc1');
  assert.equal(summaryById('smc1', catalogue).globalNum, 31);
  assert.equal(summaryById('b12', catalogue).globalNum, 12);
  assert.equal(summaryById('lesson-31', catalogue).secret, undefined);
  assert.equal(summaryById('lesson-31', buildPublicCatalogue(summaries)), undefined);
});
