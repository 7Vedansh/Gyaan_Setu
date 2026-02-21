/**
 * useCourseContent — React hook that loads course content from the
 * CourseService abstraction layer.
 *
 * On mount it kicks off an async load (API → static fallback).
 * Returns the course data, loading state, content source indicator,
 * and a `refresh` function to force a re-fetch.
 *
 * Usage:
 *   const { course, isLoading, source } = useCourseContent();
 */

import { useCallback, useEffect, useState } from 'react';
import {
    loadCourseContent,
    getCourseContentSync,
    invalidateCourseCache,
    type CourseData,
    type ContentSource,
} from '@/services/course.service';
import type { Course } from '@/types/course';

interface UseCourseContentResult {
    /** The resolved course content (API or static fallback). */
    course: Course;
    /** True while the initial API fetch is in progress. */
    isLoading: boolean;
    /** Where the data came from: `'api'` or `'static'`. */
    source: ContentSource;
    /** Force invalidate cache and re-fetch from API. */
    refresh: () => void;
}

export function useCourseContent(): UseCourseContentResult {
    // Start with the synchronous snapshot (static fallback if no cache yet)
    const initial = getCourseContentSync();

    const [courseData, setCourseData] = useState<CourseData>(initial);
    const [isLoading, setIsLoading] = useState(initial.source === 'static');

    const load = useCallback(() => {
        let cancelled = false;
        setIsLoading(true);

        loadCourseContent()
            .then((data) => {
                if (!cancelled) {
                    setCourseData(data);
                }
            })
            .catch(() => {
                // loadCourseContent already handles fallback internally,
                // so this catch is just a safety net.
                if (!cancelled) {
                    setCourseData(getCourseContentSync());
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Load on mount
    useEffect(() => {
        return load();
    }, [load]);

    const refresh = useCallback(() => {
        invalidateCourseCache();
        load();
    }, [load]);

    return {
        course: courseData.course,
        isLoading,
        source: courseData.source,
        refresh,
    };
}
