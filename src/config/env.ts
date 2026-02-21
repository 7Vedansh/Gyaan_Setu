function normalizeApiUrl(input?: string): string {
    const fallback = 'http://10.0.2.2:8080/api/v1';
    if (!input || input.trim().length === 0) return fallback;

    const trimmed = input.trim().replace(/\/$/, '');

    if (/\/api\/v\d+$/i.test(trimmed)) return trimmed;
    if (/\/v\d+$/i.test(trimmed)) return trimmed.replace(/\/v(\d+)$/i, '/api/v$1');

    return `${trimmed}/api/v1`;
}

export const ENV = {
    // For Expo development:
    // - Android emulator: 10.0.2.2
    // - iOS simulator: 127.0.0.1 (or localhost)
    // - Physical device: use your machine's local IP (e.g., 192.168.x.x)
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.33.122.128:8000',
    IS_DEV: process.env.NODE_ENV === 'development',
};
