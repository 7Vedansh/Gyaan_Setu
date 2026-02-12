import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SupportedLanguageCode } from '@/types';
import { CourseProgression } from '@/types/course';
import { DEFAULT_COURSE_PROGRESS } from '@/constants/default';

interface CourseState {
    courseId: SupportedLanguageCode | null;
    // We store progress per language to maintain the feature of separate progress
    progressByCourse: Record<string, CourseProgression>;

    // Actions
    setCourseId: (id: SupportedLanguageCode | null) => void;
    setCourseProgress: (progress: CourseProgression) => void;
    resetProgress: () => void;

    // Hydration status
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useCourseStore = create<CourseState>()(
    persist(
        (set, get) => ({
            courseId: null,
            progressByCourse: {},
            _hasHydrated: false,

            setCourseId: (id) => set({ courseId: id }),

            setCourseProgress: (progress) => {
                const { courseId, progressByCourse } = get();
                if (!courseId) return;

                set({
                    progressByCourse: {
                        ...progressByCourse,
                        [courseId]: progress,
                    },
                });
            },

            resetProgress: () => {
                const { courseId, progressByCourse } = get();
                if (!courseId) return;

                set({
                    progressByCourse: {
                        ...progressByCourse,
                        [courseId]: DEFAULT_COURSE_PROGRESS,
                    },
                });
            },

            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'course-storage',
            storage: createJSONStorage(() => {
                if (Platform.OS === 'web') {
                    // Check if window is defined to avoid SSR crashes
                    return typeof window !== 'undefined' ? localStorage : {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    };
                }
                return AsyncStorage;
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
            // We only persist crucial data
            partialize: (state) => ({
                courseId: state.courseId,
                progressByCourse: state.progressByCourse,
            }),
        }
    )
);

// Selector hooks for optimization
export const useCourseId = () => useCourseStore((state) => state.courseId);
export const useCourseProgress = () => {
    const courseId = useCourseStore((state) => state.courseId);
    const progressByCourse = useCourseStore((state) => state.progressByCourse);

    if (!courseId) return DEFAULT_COURSE_PROGRESS;
    return progressByCourse[courseId] || DEFAULT_COURSE_PROGRESS;
};
