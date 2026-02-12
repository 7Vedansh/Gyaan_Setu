export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.gyaansetu.com/v1',
    IS_DEV: process.env.NODE_ENV === 'development',
};
