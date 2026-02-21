import { ENV } from '@/config/env';
import { StoredTopic } from '../types/store';
import { Platform } from 'react-native';

const TIMEOUT_MS = 30000;

async function request<T>(
    path: string,
    options: RequestInit & {
        params?: Record<string, string | number>;
        timeoutMs?: number;
    } = {}
): Promise<T> {
    const { params, timeoutMs, ...fetchOptions } = options;
    const normalizedPath = path.replace(/^\//, '');
    const bases = getCandidateBaseUrls(ENV.API_URL);
    const tried: string[] = [];
    let lastError: unknown = null;

    for (const base of bases) {
        let url = `${base.replace(/\/$/, '')}/${normalizedPath}`;
        if (params && Object.keys(params).length > 0) {
            const search = new URLSearchParams(
                Object.entries(params).map(([k, v]) => [k, String(v)])
            ).toString();
            url += `?${search}`;
        }

        tried.push(url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs ?? TIMEOUT_MS);

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
            lastError = error;
            if (!isRetriableNetworkError(error)) {
                break;
            }
        }
    }

    const message = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Request failed after trying ${tried.join(' | ')} :: ${message}`);
}

function getCandidateBaseUrls(primary: string): string[] {
    const unique = new Set<string>();
    unique.add(primary.replace(/\/$/, ''));

    // Android emulator commonly reaches host machine via 10.0.2.2
    if (Platform.OS === 'android') {
        unique.add('http://10.0.2.2:8080/api/v1');
    }

    // Useful for web / local dev.
    unique.add('http://localhost:8080/api/v1');

    return Array.from(unique);
}

function isRetriableNetworkError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return msg.includes('abort') || msg.includes('network request failed');
}

// ─── Request / Response types ─────────────────────────────────────────────────

interface QuizResultInput {
    quiz_id: string;
    topic_id: string;
    chapter_id: string;
    selected_option: number;
    is_correct: boolean;
    time_taken_ms?: number;
    attempted_at: number;
}

/**
 * Exactly what the backend returns for GET /chapters/:chapterId/content
 * Maps 1:1 onto ChapterInput so content.service.ts can pass it straight
 * into DatabaseService.upsertChapter() with minimal transformation.
 */
export interface ChapterContentResponse {
    chapter_id: string;       // MongoDB _id as string
    chapter_name: string;
    chapter_order: number;
    subject_id: string;
    subject_name: string;
    total_topics: number;
    topics: StoredTopic[];    // already shaped for SQLite storage
}

export interface CourseStructureChapter {
    _id: string;
    order?: number;
}

export interface CourseStructureSubject {
    _id: string;
    subject_name: string;
    order?: number;
    chapters: CourseStructureChapter[];
}

export interface CourseStructureLanguage {
    _id: string;
    language_name: string;
    subjects: CourseStructureSubject[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ApiService {
    async createQuizResult(data: QuizResultInput): Promise<void> {
        await this.submitQuizResult(data);
    }

    async submitQuizResult(data: QuizResultInput): Promise<void> {
        await request<void>('/quiz-results', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Fetch all topics, microlessons, and quizzes for a chapter.
     * GET /chapters/:chapterId/content
     */
    async fetchChapterContent(chapterId: string): Promise<ChapterContentResponse> {
        return request<ChapterContentResponse>(`/chapters/${chapterId}/content`);
    }

    async fetchCourseStructure(): Promise<CourseStructureLanguage[]> {
        return request<CourseStructureLanguage[]>('/course-structure', {
            timeoutMs: 15000,
        });
    }
}

export default new ApiService();
