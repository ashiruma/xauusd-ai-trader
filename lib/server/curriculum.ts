import 'server-only';
import curriculumData from './curriculum-data.json';
import type { Lesson, GlossaryTerm } from '../curriculum-types';

// Private source data, not an access-control API. No route currently serves it.
// Do not return these objects/answer keys to client props, HTML, RSC or logs.
export const FOREX_LESSONS = curriculumData.lessons as unknown as Lesson[];
export const FOREX_GLOSSARY = curriculumData.glossary as unknown as GlossaryTerm[];
