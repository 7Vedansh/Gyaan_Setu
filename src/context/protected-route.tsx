import { useEffect } from "react";
import { router, useSegments, useRootNavigationState } from "expo-router";

import { useCourse } from "@/context/course";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRouteProvider({ children }: Props) {
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { courseId } = useCourse();

  const inCourseGroup = segments[0] === "(course)";
  const inLessonGroup = segments[0] === "(lesson)";

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (!courseId && (inCourseGroup || inLessonGroup)) {
      router.replace("/register");
    } else if (courseId && !(inCourseGroup || inLessonGroup)) {
      router.replace("/learn");
    }
  }, [segments, rootNavigationState?.key, courseId]);

  return <>{children}</>;
}
