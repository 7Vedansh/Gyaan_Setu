import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
import { useCourseStore } from '../useCourseStore';
import { DEFAULT_COURSE_PROGRESS } from '@/constants/default';

describe('useCourseStore', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useCourseStore());
        act(() => {
            // Reset store state
            useCourseStore.setState({
                courseId: null,
                progressByCourse: {},
                _hasHydrated: true,
            });
        });
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useCourseStore());
        expect(result.current.courseId).toBeNull();
        expect(result.current.progressByCourse).toEqual({});
    });

    it('should set course ID', () => {
        const { result } = renderHook(() => useCourseStore());

        act(() => {
            result.current.setCourseId('en');
        });

        expect(result.current.courseId).toBe('en');
    });

    it('should update progress for current course', () => {
        const { result } = renderHook(() => useCourseStore());

        act(() => {
            result.current.setCourseId('en');
        });

        const newProgress = { ...DEFAULT_COURSE_PROGRESS, lessonId: 1 };

        act(() => {
            result.current.setCourseProgress(newProgress);
        });

        expect(result.current.progressByCourse['en']).toEqual(newProgress);
    });

    it('should reset progress', () => {
        const { result } = renderHook(() => useCourseStore());

        act(() => {
            result.current.setCourseId('en');
        });

        const newProgress = { ...DEFAULT_COURSE_PROGRESS, lessonId: 1 };

        act(() => {
            result.current.setCourseProgress(newProgress);
            result.current.resetProgress();
        });

        expect(result.current.progressByCourse['en']).toEqual(DEFAULT_COURSE_PROGRESS);
    });
});
