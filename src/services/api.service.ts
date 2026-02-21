import { ENV } from '@/config/env';
import { CachedChapterInput, StoredTopic } from '../types/store';

const TIMEOUT_MS = 30000;

async function request<T>(
    path: string,
    options: RequestInit & { params?: Record<string, string | number> } = {}
): Promise<T> {
    const { params, ...fetchOptions } = options;
    let url = `${ENV.API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    if (params && Object.keys(params).length > 0) {
        const search = new URLSearchParams(
            Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString();
        url += `?${search}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        if (res.status === 204 || res.headers.get('content-length') === '0') {
            return undefined as T;
        }
        return res.json() as Promise<T>;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// ─── Request / Response types ─────────────────────────────────────────────────

interface QuizResultInput {
    quiz_id: number;
    score: number;
    total_questions: number;
    answers_json: string;
    created_at: number;
}

/**
 * Exactly what the backend returns for GET /chapters/:chapterId/content
 * Maps 1:1 onto ChapterInput so content.service.ts can pass it straight
 * into DatabaseService.upsertChapter() with minimal transformation.
 */
export interface ChapterContentAPIResponse {
    chapter_id: string;       // MongoDB _id as string
    chapter_name: string;
    chapter_order: number;
    subject_id: string;
    subject_name: string;
    total_topics: number;
    topics: StoredTopic[];    // already shaped for SQLite storage
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ApiService {
    async createQuizResult(data: QuizResultInput): Promise<void> {
        await request<void>('/quiz-results', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Fetch all topics, microlessons, and quizzes for a chapter.
     * GET /chapters/:chapterId/content
     */
    async fetchChapterContent(chapterId: string): Promise<ChapterContentAPIResponse> {
        return request<ChapterContentAPIResponse>(`/chapters/${chapterId}/content`);
    }
}

export default new ApiService();