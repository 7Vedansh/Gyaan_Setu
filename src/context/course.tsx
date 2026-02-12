import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { useCourseStore, useCourseId, useCourseProgress } from "@/store/useCourseStore";
import { SupportedLanguageCode } from "@/types";
import { CourseProgression } from "@/types/course";

// Retain the type for backward compatibility
type CourseContextType = {
  courseId: SupportedLanguageCode | null;
  setCourseId: (id: SupportedLanguageCode | null) => void;
  courseProgress: CourseProgression;
  setCourseProgress: Dispatch<SetStateAction<CourseProgression>>;
};

// Deprecated context
const CourseContext = createContext<CourseContextType | undefined>(undefined);

/**
 * @deprecated Use useCourseStore directly for better performance.
 */
export const useCourse = (): CourseContextType => {
  const courseId = useCourseId();
  const courseProgress = useCourseProgress();
  const { setCourseId, setCourseProgress } = useCourseStore();

  const handleSetCourseProgress: Dispatch<SetStateAction<CourseProgression>> = (action) => {
    if (typeof action === 'function') {
      const newProgress = action(courseProgress);
      setCourseProgress(newProgress);
    } else {
      setCourseProgress(action);
    }
  };

  return {
    courseId,
    setCourseId,
    courseProgress,
    setCourseProgress: handleSetCourseProgress,
  };
};

interface Props {
  children: React.ReactNode;
}

/**
 * @deprecated CourseProvider is now a no-op wrapper. State is managed globally via Zustand.
 */
export function CourseProvider({ children }: Props) {
  // We can add hydration check here if needed to block rendering like the original
  const hasHydrated = useCourseStore(state => state._hasHydrated);

  // Optional: You might want to render a loader until hydrated if strict persistence is required for startup
  // if (!hasHydrated) return null; 

  return <>{children}</>;
}
