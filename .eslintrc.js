module.exports = {
    extends: 'universe/native',
    rules: {
        // Add custom rules here
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        '@typescript-eslint/no-explicit-any': 'error',
    },
};
