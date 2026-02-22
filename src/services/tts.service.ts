import * as Speech from 'expo-speech';

/**
 * TTS Service
 * 
 * A modular, non-breaking service for Text-to-Speech using expo-speech.
 * Fully isolated from RAG and network logic.
 */

export const ttsService = {
    /**
     * Speak the provided text.
     * Stops any current speech before starting new one.
     */
    async speak(
        text: string,
        options: {
            onStart?: () => void;
            onDone?: () => void;
            onError?: (error: any) => void;
            language?: string;
        } = {}
    ) {
        if (!text || text.trim() === '') return;

        try {
            // Prevent overlapping speech
            await this.stop();

            const requestedLang = options.language || 'hi-IN';

            // On some platforms, we might need to find the best matching voice
            const voices = await Speech.getAvailableVoicesAsync();
            const bestVoice = voices.find(v =>
                v.language.toLowerCase().startsWith(requestedLang.toLowerCase().split('-')[0])
            );

            Speech.speak(text, {
                language: requestedLang,
                voice: bestVoice?.identifier, // Use specific voice if found
                onStart: options.onStart,
                onDone: options.onDone,
                onError: (error) => {
                    // Fallback to generic code if specific one fails
                    if (requestedLang.includes('-')) {
                        const genericLang = requestedLang.split('-')[0];
                        Speech.speak(text, {
                            language: genericLang,
                            onStart: options.onStart,
                            onDone: options.onDone,
                            onError: (err) => {
                                if (__DEV__) console.warn('TTS Error after fallback:', err);
                                options.onError?.(err);
                            }
                        });
                    } else {
                        if (__DEV__) console.warn('TTS Error:', error);
                        options.onError?.(error);
                    }
                },
            });
        } catch (error) {
            if (__DEV__) console.warn('TTS silent failure:', error);
        }
    },

    /**
     * Stop any current speech.
     */
    async stop() {
        try {
            await Speech.stop();
        } catch (error) {
            if (__DEV__) console.warn('TTS Stop Error:', error);
        }
    },

    /**
     * Check if speech is currently active.
     */
    async isSpeaking(): Promise<boolean> {
        try {
            return await Speech.isSpeakingAsync();
        } catch (error) {
            return false;
        }
    }
};
