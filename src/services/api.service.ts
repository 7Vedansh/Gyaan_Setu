import { ENV } from '@/config/env';

const TIMEOUT_MS = 30000;

/**
 * @abstract Function to send requests to backend
 */
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
    console.log('[API Request]', url, fetchOptions.method || 'GET');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const text = await res.text();
            console.error('[API Error]', res.status, text);
            throw new Error(text || `HTTP ${res.status}`);
        }

        if (res.status === 204 || res.headers.get('content-length') === '0') {
            return undefined as T;
        }

        return res.json() as Promise<T>;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('[API Exception]', error);
        throw error;
    }
}

interface QuizResultInput {
    quiz_id: number;
    score: number;
    total_questions: number;
    answers_json: string;
    created_at: number;
}

class ApiService {
    async createQuizResult(data: QuizResultInput): Promise<void> {
        console.log('[API] Creating quiz result, sending POST to /quiz-results with data:', data);
        try {
            await request<void>('/quiz-results', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            console.log('[API] createQuizResult request succeeded');
        } catch (error) {
            console.error('[API] createQuizResult request failed:', error);
            throw error;
        }
    }
}

export default new ApiService();
