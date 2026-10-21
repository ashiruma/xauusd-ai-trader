import { COURSE_MANIFEST, visibleLessons, type CourseManifest } from './course-manifest.ts';

export interface LessonSummary {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  levelTitle: string;
  lessonNum: number;
  globalNum: number;
  title: string;
  summary: string;
}
export interface PublicSummaryText { id: string; title: string; summary: string }
/** Explicit public field allowlist. No body/key fields are copied even if present on input.
 * Publishing a summary requires BOTH manifest metadata and reviewed public summary text.
 */
export function buildPublicCatalogue(summaries: readonly PublicSummaryText[], manifest: CourseManifest = COURSE_MANIFEST): readonly LessonSummary[] {
  if (new Set(summaries.map(item => item.id)).size !== summaries.length) throw new Error('Duplicate public summary ID');
  return visibleLessons(manifest).map(entry => {
    const summary = summaries.find(lesson => lesson.id === entry.id);
    const track = manifest.tracks.find(item => item.id === entry.trackId);
    if (!summary || !track) throw new Error(`Visible lesson missing public summary/track: ${entry.id}`);
    if (typeof summary.title !== 'string' || !summary.title.trim() ||
        typeof summary.summary !== 'string' || !summary.summary.trim()) throw new Error(`Invalid public summary text: ${entry.id}`);
    return { id: entry.id, globalNum: entry.globalNum, level: track.level, levelTitle: track.label,
      lessonNum: manifest.lessons.filter(lesson => lesson.trackId === entry.trackId).findIndex(lesson => lesson.id === entry.id) + 1,
      title: summary.title, summary: summary.summary };
  });
}
export function summaryById(id: string, lessons: readonly LessonSummary[]): LessonSummary | undefined {
  const match = /^(?:lesson-)?([1-9]\d*)$/i.exec(id);
  return match ? lessons.find(lesson => lesson.globalNum === Number(match[1])) :
    lessons.find(lesson => lesson.id.toLowerCase() === id.toLowerCase());
}
