/** Public identity/sequence metadata only. Never import lesson bodies or assessment keys here.
 * This manifest and its pure projections are NOT an authorization or progress authority.
 */
export type PublicationState = 'draft' | 'summary-only' | 'published';
export interface ManifestLesson {
  readonly id: string;
  readonly globalNum: number;
  readonly route: `/academy/lesson-${number}`;
  readonly trackId: string;
  readonly contentVersion: string;
  readonly publication: PublicationState;
  readonly prerequisiteIds: readonly string[];
}
export interface CourseTrack {
  readonly id: string;
  readonly label: string;
  readonly level: 'beginner' | 'intermediate' | 'advanced';
  readonly kind: 'core' | 'optional';
  readonly focus: string;
  readonly publication: PublicationState;
}
export interface CourseManifest {
  readonly id: string;
  readonly version: string;
  readonly coreVersion: string;
  readonly certificatePolicyId: string;
  readonly title: string;
  readonly delivery: 'suspended';
  readonly lessons: readonly ManifestLesson[];
  readonly requiredCoreLessonIds: readonly string[];
  readonly tracks: readonly CourseTrack[];
  readonly checkpoints: readonly { readonly id: string; readonly lessonIds: readonly string[]; readonly kind: 'milestone' | 'graduation' }[];
}

// Deliberate owner policy: these original 30 stable IDs are ALL mandatory.
// Never derive this set from catalogue size, a prefix, or an optional track.
export const REQUIRED_CORE_LESSON_IDS = [
  'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12',
  'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10',
  'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
] as const;
export const EARLY_CHECKPOINT_ID = 'foundation-early';
export const GRADUATION_CHECKPOINT_ID = 'core-graduation';

// Approved draft mapping, not a rewrite of the bodies or legacy assessment banks.
const CORE_SEQUENCE: readonly (readonly [string, number, string])[] = [
  ['b1', 1, 'foundations'], ['b2', 2, 'foundations'], ['b3', 3, 'foundations'],
  ['b4', 4, 'foundations'], ['b5', 5, 'foundations'], ['b6', 6, 'foundations'],
  ['b7', 7, 'foundations'], ['b8', 8, 'foundations'], ['b9', 9, 'foundations'],
  ['b10', 10, 'foundations'], ['b11', 11, 'foundations'], ['b12', 12, 'foundations'],
  ['i1', 13, 'dynamics'], ['i2', 14, 'dynamics'], ['i3', 15, 'dynamics'],
  ['i4', 16, 'dynamics'], ['i5', 17, 'dynamics'], ['i6', 18, 'dynamics'],
  ['i7', 19, 'dynamics'], ['i8', 20, 'dynamics'], ['i9', 21, 'dynamics'], ['i10', 22, 'dynamics'],
  ['a1', 23, 'risk'], ['a2', 24, 'risk'], ['a3', 25, 'risk'], ['a4', 26, 'risk'],
  ['a5', 27, 'risk'], ['a6', 28, 'risk'], ['a7', 29, 'risk'], ['a8', 30, 'risk'],
];
export const COURSE_MANIFEST: CourseManifest = {
  id: 'velarion-forex',
  version: 'core-1.extensions-0',
  coreVersion: 'core-1',
  certificatePolicyId: 'velarion-forex.core-1.all-required',
  title: 'Institutional Forex & Spot Gold Trading School',
  delivery: 'suspended',
  requiredCoreLessonIds: REQUIRED_CORE_LESSON_IDS,
  lessons: CORE_SEQUENCE.map(([id, globalNum, trackId], index) => ({
    id, globalNum, route: `/academy/lesson-${globalNum}`, trackId,
    contentVersion: 'legacy-review-1', publication: 'summary-only',
    prerequisiteIds: index === 0 ? [] : [CORE_SEQUENCE[index - 1][0]],
  })),
  checkpoints: [
    { id: 'first-pass', kind: 'milestone', lessonIds: ['b1'] },
    // Five-lesson early milestone only: never graduation, access or activation.
    { id: EARLY_CHECKPOINT_ID, kind: 'milestone', lessonIds: ['b1', 'b2', 'b3', 'b4', 'b5'] },
    { id: 'core-midpoint', kind: 'milestone', lessonIds: REQUIRED_CORE_LESSON_IDS.slice(0, REQUIRED_CORE_LESSON_IDS.length / 2) },
    { id: GRADUATION_CHECKPOINT_ID, kind: 'graduation', lessonIds: REQUIRED_CORE_LESSON_IDS },
  ],
  tracks: [
    { id: 'foundations', label: 'Forex Foundations', level: 'beginner', kind: 'core', focus: 'Currency mechanics and market foundations', publication: 'summary-only' },
    { id: 'dynamics', label: 'Technical & Market Dynamics', level: 'intermediate', kind: 'core', focus: 'Market structure and technical analysis', publication: 'summary-only' },
    { id: 'risk', label: 'Institutional Risk & Psychology', level: 'advanced', kind: 'core', focus: 'Risk management and execution discipline', publication: 'summary-only' },
    { id: 'smc-ict', label: 'SMC / ICT Extensions', level: 'advanced', kind: 'optional', focus: 'Primary extension focus: SMC / ICT; content pending review', publication: 'draft' },
  ],
};
export const CORE_LESSON_COUNT = COURSE_MANIFEST.requiredCoreLessonIds.length;
export function visibleLessons(manifest: CourseManifest = COURSE_MANIFEST): readonly ManifestLesson[] {
  return manifest.lessons.filter(lesson => lesson.publication !== 'draft' &&
    manifest.tracks.some(track => track.id === lesson.trackId && track.publication !== 'draft'));
}
export function indexableLessons(manifest: CourseManifest = COURSE_MANIFEST): readonly ManifestLesson[] {
  // Containment is unconditional. Publication metadata never authorizes content delivery.
  if (manifest.delivery === 'suspended') return [];
  return visibleLessons(manifest).filter(lesson => lesson.publication === 'published');
}
export function lessonNeighbors(id: string, manifest: CourseManifest = COURSE_MANIFEST) {
  const lessons = visibleLessons(manifest);
  const index = lessons.findIndex(lesson => lesson.id === id);
  return { previous: index > 0 ? lessons[index - 1] : undefined, next: index >= 0 ? lessons[index + 1] : undefined };
}
export function trackLabel(id: string, manifest: CourseManifest = COURSE_MANIFEST): string {
  const track = manifest.tracks.find(item => item.id === id);
  const lessons = visibleLessons(manifest).filter(lesson => lesson.trackId === id);
  return `${track?.label ?? id}${lessons.length ? ` (Lessons ${lessons[0].globalNum}–${lessons.at(-1)!.globalNum})` : ' (Planned)'}`;
}

/** Future server-owned evidence DTO. A type is NOT proof of verified identity or pass.
 * Never construct these records from cookies, localStorage, request JSON or legacy flags.
 */
export interface CompletionEvidence {
  readonly courseId: string;
  readonly coreVersion: string;
  readonly lessonId: string;
  readonly contentVersion: string;
}
export function projectProgress(records: readonly CompletionEvidence[], manifest: CourseManifest = COURSE_MANIFEST) {
  const completed = new Set(records.filter(record => record.courseId === manifest.id && record.coreVersion === manifest.coreVersion &&
    manifest.lessons.some(lesson => lesson.id === record.lessonId && lesson.contentVersion === record.contentVersion))
    .map(record => record.lessonId));
  const coreCompleted = manifest.requiredCoreLessonIds.filter(id => completed.has(id)).length;
  const optional = manifest.lessons.filter(lesson => !manifest.requiredCoreLessonIds.includes(lesson.id));
  const early = manifest.checkpoints.find(checkpoint => checkpoint.id === EARLY_CHECKPOINT_ID);
  return {
    coreCompleted, coreTotal: manifest.requiredCoreLessonIds.length,
    corePercent: manifest.requiredCoreLessonIds.length ? coreCompleted / manifest.requiredCoreLessonIds.length * 100 : 0,
    coreGraduated: manifest.requiredCoreLessonIds.length > 0 && coreCompleted === manifest.requiredCoreLessonIds.length,
    earlyMilestone: Boolean(early?.lessonIds.length && early.lessonIds.every(id => completed.has(id))),
    optionalCompleted: optional.filter(lesson => completed.has(lesson.id)).length, optionalTotal: optional.length,
    nextRequired: manifest.lessons.find(lesson => manifest.requiredCoreLessonIds.includes(lesson.id) && !completed.has(lesson.id)),
    // Graduation is only a learning prerequisite, NEVER automation consent or authority.
    automationEligible: false as const,
  };
}
export function prerequisitesMet(id: string, records: readonly CompletionEvidence[], manifest: CourseManifest = COURSE_MANIFEST): boolean {
  const lesson = manifest.lessons.find(item => item.id === id);
  if (!lesson) return false;
  const required = new Set<string>();
  const visit = (lessonId: string): boolean => {
    const item = manifest.lessons.find(value => value.id === lessonId);
    if (!item) return false;
    for (const prerequisite of item.prerequisiteIds) {
      if (required.has(prerequisite)) continue;
      required.add(prerequisite);
      if (!visit(prerequisite)) return false;
    }
    return true;
  };
  if (!visit(id)) return false;
  return [...required].every(lessonId => projectProgress(records, { ...manifest, requiredCoreLessonIds: [lessonId] }).coreGraduated);
}
/** Eligibility to study is independent of completion and sequence; still not authorization.
 * Actual release remains suspended even for a genuinely eligible learner.
 */
export function studyEligibility(verifiedIdentity: boolean, verifiedPartner: boolean, verifiedDeposit: boolean) {
  return verifiedIdentity && verifiedPartner && verifiedDeposit;
}

export function validateManifest(manifest: CourseManifest = COURSE_MANIFEST): void {
  const unique = (values: readonly unknown[], label: string) => {
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`);
  };
  unique(manifest.lessons.map(lesson => lesson.id), 'lesson ID');
  unique(manifest.lessons.map(lesson => lesson.globalNum), 'lesson number');
  unique(manifest.lessons.map(lesson => lesson.route), 'route');
  unique(manifest.tracks.map(track => track.id), 'track ID');
  unique(manifest.checkpoints.map(checkpoint => checkpoint.id), 'checkpoint ID');
  unique(manifest.requiredCoreLessonIds, 'core ID');
  if (manifest.requiredCoreLessonIds.length !== REQUIRED_CORE_LESSON_IDS.length ||
      REQUIRED_CORE_LESSON_IDS.some(id => !manifest.requiredCoreLessonIds.includes(id))) throw new Error('Original core policy changed');
  const prior = new Set<string>();
  for (const lesson of manifest.lessons) {
    if (!Number.isSafeInteger(lesson.globalNum) || lesson.globalNum <= 0 || lesson.route !== `/academy/lesson-${lesson.globalNum}`) throw new Error('Invalid lesson route/number');
    if (!manifest.tracks.some(track => track.id === lesson.trackId)) throw new Error('Missing track');
    if (!lesson.contentVersion) throw new Error('Missing content version');
    if (lesson.prerequisiteIds.some(id => !prior.has(id))) throw new Error('Prerequisites must precede lesson');
    const original = CORE_SEQUENCE.find(([id]) => id === lesson.id);
    if (original && (original[1] !== lesson.globalNum || original[2] !== lesson.trackId)) throw new Error('Original mapping changed');
    if (!original && lesson.globalNum <= Math.max(...CORE_SEQUENCE.map(([, number]) => number))) throw new Error('Extension collides with original route range');
    prior.add(lesson.id);
  }
  if (manifest.requiredCoreLessonIds.some(id => !prior.has(id))) throw new Error('Missing required core lesson');
  for (const checkpoint of manifest.checkpoints) {
    unique(checkpoint.lessonIds, 'checkpoint lesson ID');
    if (!checkpoint.lessonIds.length || checkpoint.lessonIds.some(id => !prior.has(id))) throw new Error('Invalid checkpoint');
  }
  const early = manifest.checkpoints.find(item => item.id === EARLY_CHECKPOINT_ID);
  const graduation = manifest.checkpoints.find(item => item.id === GRADUATION_CHECKPOINT_ID);
  if (early?.kind !== 'milestone' || graduation?.kind !== 'graduation' ||
      early.lessonIds.length >= manifest.requiredCoreLessonIds.length ||
      graduation.lessonIds.length !== manifest.requiredCoreLessonIds.length ||
      manifest.requiredCoreLessonIds.some(id => !graduation.lessonIds.includes(id))) throw new Error('Milestone/graduation policy mismatch');
  for (const lesson of manifest.lessons) {
    const track = manifest.tracks.find(item => item.id === lesson.trackId)!;
    if ((track.kind === 'core') !== manifest.requiredCoreLessonIds.includes(lesson.id)) throw new Error('Core/optional track policy mismatch');
  }
}
validateManifest();
