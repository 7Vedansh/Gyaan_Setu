/**
 * CourseService — Abstraction layer between static content and backend API.
 *
 * Design:
 *  1. Try to fetch course structure from the backend API.
 *  2. Fall back to the bundled static `courseContent` on any failure.
 *  3. Cache the result so it's fetched at most once per app lifecycle.
 *  4. Preserve the existing `Course` / `CourseProgression` / `ExerciseSet`
 *     type contracts — consumers don't need to know where data came from.
 *
 * The static data in `@/content/courses/data` is the single fallback source
 * of truth and is NOT deleted until the backend is fully populated and tested.
 */

import { ENV } from '@/config/env';
import {
    courseContent as staticCourseContent,
    getExercise as staticGetExercise,
    nextProgress as staticNextProgress,
} from '@/content/courses/data';
import type {
    Chapter,
    Course,
    CourseProgression,
    ExerciseSet,
    Lesson,
    Section,
} from '@/types/course';

// ─── Configuration ──────────────────────────────────────────────────────────

const TIMEOUT_MS = 12_000;

/** Expected backend endpoint that returns the full course structure. */
const COURSE_STRUCTURE_PATH = 'course-structure';

// ─── API Response Types (Backend) ───────────────────────────────────────────

interface ApiMicroLesson {
    _id: string;
    order: number;
    title: string;
}

interface ApiTopic {
    _id: string;
    topic_number?: number;
    order?: number;
    microlessons: ApiMicroLesson[];
}

interface ApiChapter {
    _id: string;
    chapter_name: string;
    chapter_number?: number;
    order?: number;
    topics: ApiTopic[];
}

interface ApiSubject {
    _id: string;
    subject_name: string;
    chapters: ApiChapter[];
}

interface ApiLanguage {
    _id: string;
    language_name: string;
    subjects: ApiSubject[];
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type ContentSource = 'api' | 'static';

export interface CourseData {
    /** The resolved course content (either from API or static fallback). */
    course: Course;
    /** Where the data came from — useful for debugging / UI badges. */
    source: ContentSource;
}

// ─── Internal State ─────────────────────────────────────────────────────────

let _cache: CourseData | null = null;
let _fetchPromise: Promise<CourseData> | null = null;

// ─── Private Helpers ────────────────────────────────────────────────────────

/**
 * Fetch the full course structure from the backend.
 * The backend returns an array of Language objects, which we transform
 * into a single `Course` object for the frontend.
 */
async function fetchCourseFromApi(): Promise<Course> {
    const base = ENV.API_URL.replace(/\/$/, '');
    const url = `${base}/${COURSE_STRUCTURE_PATH}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(
                `[CourseService] ${res.status} ${res.statusText}: ${body}`,
            );
        }

        const languages = (await res.json()) as ApiLanguage[];

        if (!languages || languages.length === 0) {
            throw new Error('[CourseService] No languages found in API response');
        }

        // For now, we pick the first language (usually 'English') or find by name.
        // In the future, this should pick based on the user's current courseId.
        const lang = languages[0];

        // ── Transform API → Frontend Types ───

        const course: Course = {
            // Map Subjects → Sections
            sections: lang.subjects.map((s, sIdx) => ({
                id: sIdx,
                _id: s._id,
                title: { en: s.subject_name },
                chapters: s.chapters.map((c, cIdx) => ({
                    id: cIdx,
                    _id: c._id,
                    title: { en: `Unit ${c.chapter_number ?? c.order ?? cIdx + 1}` },
                    description: { en: c.chapter_name },
                    lessons: c.topics.map((t, tIdx) => ({
                        id: tIdx,
                        _id: t._id,
                        description: { en: `Topic ${t.topic_number ?? t.order ?? tIdx + 1}` },
                        // Map Microlessons → Exercises
                        exercises: t.microlessons.map((m, mIdx) => ({
                            id: mIdx,
                            _id: m._id,
                            xp: 10,
                            difficulty: 'easy',
                            items: [],
                        })),
                    })),
                })),
            })),
            characters: staticCourseContent.characters,
        };

        return course;
    } catch (err: unknown) {
        clearTimeout(timeoutId);

        const isAbortError =
            !!err &&
            typeof err === 'object' &&
            'name' in err &&
            (err as { name?: string }).name === 'AbortError';

        if (isAbortError) {
            throw new Error(
                `[CourseService] Request timed out after ${TIMEOUT_MS}ms`,
            );
        }

        throw err;
    }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Load the course content — tries the backend API first, falls back to
 * the bundled static data on any failure. Results are cached.
 *
 * Safe to call multiple times — returns the cached result after the first
 * successful load.
 */
export async function loadCourseContent(): Promise<CourseData> {
    // Return cache only when we already have API content.
    // If cache is static fallback, allow retry to recover automatically.
    if (_cache?.source === 'api') return _cache;

    // Deduplicate concurrent calls
    if (_fetchPromise) return _fetchPromise;

    _fetchPromise = (async (): Promise<CourseData> => {
        try {
            const course = await fetchCourseFromApi();
            _cache = { course, source: 'api' };
            console.log('[CourseService] Loaded course from API');
        } catch (err) {
            console.warn(
                '[CourseService] API fetch failed, using static fallback:',
                err instanceof Error ? err.message : err,
            );
            _cache = { course: staticCourseContent, source: 'static' };
        }

        _fetchPromise = null;
        return _cache;
    })();

    return _fetchPromise;
}

/**
 * Get the course content synchronously.
 * Returns the cached result if available, otherwise the static fallback.
 *
 * This lets consumers that can't use `await` (like render functions)
 * access the data without blocking.
 */
export function getCourseContentSync(): CourseData {
    return _cache ?? { course: staticCourseContent, source: 'static' };
}

/**
 * Invalidate the cache — forces the next `loadCourseContent()` call
 * to re-fetch from the API.
 */
export function invalidateCourseCache(): void {
    _cache = null;
    _fetchPromise = null;
}

// ─── Helper Re-exports ──────────────────────────────────────────────────────
// These wrap the static helpers but operate on the cached course data.
// They are drop-in replacements for the imports from `@/content/courses/data`.

/**
 * Get an exercise set by course progression coordinates.
 * Uses cached API data if available, otherwise falls back to static.
 */
export function getExercise(progression: CourseProgression): ExerciseSet | null {
    const { course } = getCourseContentSync();

    const section = course.sections[progression.sectionId];
    if (!section) return null;

    const chapter = section.chapters[progression.chapterId];
    if (!chapter) return null;

    const lesson = chapter.lessons[progression.lessonId];
    if (!lesson?.exercises || lesson.exercises.length <= progression.exerciseId) {
        return null;
    }

    return lesson.exercises[progression.exerciseId];
}

/**
 * Calculate the next course progression step.
 * Uses cached API data if available, otherwise falls back to static.
 */
export function nextProgress(
    current: CourseProgression,
): CourseProgression | null {
    const { course } = getCourseContentSync();

    const { sectionId, chapterId, lessonId, exerciseId } = current;
    const section = course.sections[sectionId];
    if (!section) return null;

    const chapter = section.chapters[chapterId];
    if (!chapter) return null;

    const lesson = chapter.lessons[lessonId];
    if (!lesson) return null;

    const exercisesCount = lesson.exercises.length;

    if (exerciseId < exercisesCount - 1) {
        return { ...current, exerciseId: exerciseId + 1 };
    } else if (lessonId < chapter.lessons.length - 1) {
        return { ...current, lessonId: lessonId + 1, exerciseId: 0 };
    } else if (chapterId < section.chapters.length - 1) {
        return {
            ...current,
            chapterId: chapterId + 1,
            lessonId: 0,
            exerciseId: 0,
        };
    } else if (sectionId < course.sections.length - 1) {
        return {
            ...current,
            sectionId: sectionId + 1,
            chapterId: 0,
            lessonId: 0,
            exerciseId: 0,
        };
    }

    return null;
}

/**
 * Get a specific section from the cached course content.
 */
export function getSection(sectionId: number): Section | null {
    const { course } = getCourseContentSync();
    return course.sections[sectionId] ?? null;
}

/**
 * Get a specific chapter from the cached course content.
 */
export function getChapter(
    sectionId: number,
    chapterId: number,
): Chapter | null {
    const section = getSection(sectionId);
    return section?.chapters[chapterId] ?? null;
}

/**
 * Get a specific lesson from the cached course content.
 */
export function getLesson(
    sectionId: number,
    chapterId: number,
    lessonId: number,
): Lesson | null {
    const chapter = getChapter(sectionId, chapterId);
    return chapter?.lessons[lessonId] ?? null;
}
