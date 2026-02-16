export const ENV = {
    // For Expo development:
    // - Android emulator: 10.0.2.2
    // - iOS simulator: 127.0.0.1 (or localhost)
    // - Physical device: use your machine's local IP (e.g., 192.168.x.x)
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/v1',
    IS_DEV: process.env.NODE_ENV === 'development',
};
