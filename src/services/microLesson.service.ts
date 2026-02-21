import { ENV } from '@/config/env';

// ─── Response Types ─────────────────────────────────────────────────────────
// Mirror the backend Mongoose schemas so the frontend stays type-safe.

export interface MicroLessonResponse {
    _id: string;
    microlesson_number: number;
    microlesson_title: string;
    microlesson_content: string[];   // each element is one "slide / paragraph"
    topic: string;                   // ObjectId as string
    picture?: string;                // optional ObjectId as string
    createdAt: string;
    updatedAt: string;
}

export interface QuizResponse {
    _id: string;
    question: string;
    options: string[];
    correct: number;                 // index into `options`
    explanation: string;
    topic: string;                   // ObjectId as string
    createdAt: string;
    updatedAt: string;
}

export interface TopicResponse {
    _id: string;
    topic_number: number;
    chapter: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 15_000;

/**
 * Internal fetch wrapper shared by every function in this service.
 * - Builds the full URL from `ENV.API_URL` + path + optional query params.
 * - Attaches an AbortController-based timeout.
 * - Returns parsed JSON or throws a descriptive error.
 */
async function request<T>(
    path: string,
    params?: Record<string, string>,
): Promise<T> {
    const base = ENV.API_URL.replace(/\/$/, '');
    let url = `${base}/${path.replace(/^\//, '')}`;

    if (params && Object.keys(params).length > 0) {
        const qs = new URLSearchParams(params).toString();
        url += `?${qs}`;
    }

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
                `[MicroLessonService] ${res.status} ${res.statusText}: ${body}`,
            );
        }

        return (await res.json()) as T;
    } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error(
                `[MicroLessonService] Request timed out after ${TIMEOUT_MS}ms: ${url}`,
            );
        }

        throw err;
    }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch every micro-lesson that belongs to a given **topic**.
 *
 * Expected backend endpoint:
 *   GET /v1/micro-lessons?topicId=<ObjectId>
 *
 * Returns lessons sorted by `microlesson_number` (backend should sort, but
 * we sort client-side as a safety net).
 */
export async function getMicroLessonsByTopic(
    topicId: string,
): Promise<MicroLessonResponse[]> {
    const data = await request<MicroLessonResponse[]>('micro-lessons', {
        topicId,
    });

    return data.sort((a, b) => a.microlesson_number - b.microlesson_number);
}

/**
 * Fetch a single micro-lesson by its MongoDB `_id`.
 *
 * Expected backend endpoint:
 *   GET /v1/micro-lessons/:id
 */
export async function getMicroLessonById(
    id: string,
): Promise<MicroLessonResponse> {
    return request<MicroLessonResponse>(`micro-lessons/${id}`);
}

/**
 * Fetch all quiz questions that belong to a given **topic**.
 *
 * Expected backend endpoint:
 *   GET /v1/quizzes?topicId=<ObjectId>
 */
export async function getQuizzesByTopic(
    topicId: string,
): Promise<QuizResponse[]> {
    return request<QuizResponse[]>('quizzes', { topicId });
}

/**
 * Fetch all topics that belong to a given **chapter**.
 *
 * Expected backend endpoint:
 *   GET /v1/topics?chapterId=<ObjectId>
 *
 * Returns topics sorted by `topic_number`.
 */
export async function getTopicsByChapter(
    chapterId: string,
): Promise<TopicResponse[]> {
    const data = await request<TopicResponse[]>('topics', { chapterId });
    return data.sort((a, b) => a.topic_number - b.topic_number);
}

/**
 * Convenience: Fetch a micro-lesson AND its associated quizzes in parallel.
 *
 * Useful when opening a lesson screen — you need both the theory content
 * and the quiz questions at once.
 */
export async function getMicroLessonWithQuizzes(
    microLessonId: string,
    topicId: string,
): Promise<{ lesson: MicroLessonResponse; quizzes: QuizResponse[] }> {
    const [lesson, quizzes] = await Promise.all([
        getMicroLessonById(microLessonId),
        getQuizzesByTopic(topicId),
    ]);

    return { lesson, quizzes };
}
