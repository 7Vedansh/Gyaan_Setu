import { ENV } from '@/config/env';
import { ApiItem, ItemInput } from '../types/store';

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
        throw new Error(text || `HTTP ${res.status}`);
    }

    if (res.status === 204 || res.headers.get('content-length') === '0') {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

class ApiService {
    async createItem(data: ItemInput): Promise<ApiItem> {
        return request<ApiItem>('/items', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateItem(id: string, data: Partial<ItemInput>): Promise<ApiItem> {
        return request<ApiItem>(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteItem(id: string): Promise<void> {
        await request<void>(`/items/${id}`, { method: 'DELETE' });
    }

    async getUpdates(timestamp: number): Promise<ApiItem[]> {
        return request<ApiItem[]>('/items/updates', {
            params: { since: timestamp },
        });
    }
}

export default new ApiService();
