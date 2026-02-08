import { useState } from "react";
import { ScrollView } from "react-native";

import { CourseDetailsBar } from "@/components/course-details-bar";
import { Icon } from "@/components/icons";
import { LessonItem } from "@/components/lesson-item";
import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/button";
import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { courseContent } from "@/content/courses/data";
import { useBreakpoint } from "@/context/breakpoints";
import { useCourse } from "@/context/course";
import { DEFAULT_LANGUAGE_CODE } from "@/constants/default";
import { useTheme } from "@/context/theme";
import { Chapter } from "@/types/course";

const CAMP = 16;
const CIRCLE_RADUIS = 48;

export default function Learn() {
  const languageCode = DEFAULT_LANGUAGE_CODE;
  const { courseId, courseProgress } = useCourse();
  const { mutedForeground, border, accent, secondary, foreground, primary } =
    useTheme();
  const breakpoint = useBreakpoint();

  const [headerHeight, setHeaderHeight] = useState(0);

  let isOdd = true;
  let translateX = 0;

  const currentSection = courseContent.sections[courseProgress.sectionId];
  if (!currentSection) return null;

  const renderCourseChapter = (chapter: Chapter, chapterIndex: number) => (
    <View
      key={chapter.id}
      style={{
        gap: layouts.padding * 4,
        paddingHorizontal: breakpoint === "sm" ? 0 : layouts.padding * 2,
      }}
    >
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: breakpoint == "md" ? "flex-start" : "space-between",
            padding: layouts.padding * 1.5,
            backgroundColor: secondary,
            borderRadius: breakpoint === "sm" ? 0 : layouts.radiusLg,
            alignItems: "center",
            borderWidth: layouts.borderWidth,
            borderColor: border,
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          },
          breakpoint == "sm" && {
            paddingHorizontal: layouts.padding,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: colors.transparent,
            gap: layouts.padding,
            flex: 1,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: foreground, letterSpacing: -0.2 }}>
            {chapter.title[languageCode]}
          </Text>
          <Text style={{ color: mutedForeground, fontSize: 14, lineHeight: 20 }}>
            {chapter.description[languageCode]}
          </Text>
        </View>
        <Button
          variant="ghost"
          viewStyle={{
            padding: layouts.padding * 0.5,
            borderRadius: layouts.radius,
            backgroundColor: accent,
          }}
        >
          <Icon name="notebook" />
        </Button>
      </View>

      <View
        style={{
          gap: layouts.padding * 2,
          alignItems: "center",
        }}
      >
        {chapter.lessons.map((lession, lessonIndex) => {
          if (translateX > CAMP || translateX < -CAMP) {
            isOdd = !isOdd;
          }

          if (lessonIndex !== 0) {
            isOdd
              ? (translateX += CIRCLE_RADUIS)
              : (translateX -= CIRCLE_RADUIS);
          }

          const isCurrentChapter = courseProgress.chapterId === chapterIndex;
          const isCurrentLesson =
            isCurrentChapter && courseProgress.lessonId === lessonIndex;
          const isFinishedLesson =
            (isCurrentChapter && lessonIndex < courseProgress.lessonId) ||
            chapterIndex < courseProgress.chapterId;
          const currentExercise = lession.exercises[courseProgress.exerciseId];

          if (!currentExercise) return null;

          return (
            <LessonItem
              key={lessonIndex}
              index={lessonIndex}
              circleRadius={CIRCLE_RADUIS}
              currentExercise={currentExercise}
              isCurrentLesson={isCurrentLesson}
              isFinishedLesson={isFinishedLesson}
              lessonDescription={lession.description[languageCode]}
              totalExercise={lession.exercises.length}
              style={{ transform: [{ translateX }] }}
              courseProgression={{
                sectionId: courseProgress.sectionId,
                chapterId: chapterIndex,
                lessonId: lessonIndex,
                exerciseId: 0,
              }}
            />
          );
        })}
      </View>
    </View>
  );

  return (
    <>
      <Metadata
        title="Learn"
        description="Learn a new lesson every day to keep your streak."
      />
      <View style={{ flex: 1, position: "relative" }}>
        <View
          style={{
            borderBottomWidth: layouts.borderWidth,
            borderBottomColor: border,
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            zIndex: 9999,
            gap: layouts.padding * 2,
          }}
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        >
          {(breakpoint === "sm" || breakpoint === "md") && courseId && (
            <CourseDetailsBar
              courseId={courseId}
              style={{
                paddingTop:
                  breakpoint == "sm" ? layouts.padding : layouts.padding * 3,
                paddingHorizontal:
                  breakpoint == "sm" ? layouts.padding : layouts.padding * 2,
              }}
            />
          )}
          <View
            style={{
              paddingBottom: layouts.padding,
              paddingTop:
                breakpoint === "sm"
                  ? 0
                  : breakpoint === "md"
                  ? layouts.padding * 2
                  : layouts.padding * 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: primary,
                textAlign: "center",
                letterSpacing: -0.2,
              }}
            >
              {currentSection.title[languageCode]}
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{
            paddingTop:
              breakpoint == "sm"
                ? headerHeight
                : headerHeight + layouts.padding * 2,
            paddingBottom: layouts.padding * 2,
            gap: layouts.padding * 4,
          }}
          showsVerticalScrollIndicator={false}
        >
          {currentSection.chapters.map((chapter, index) =>
            renderCourseChapter(chapter, index)
          )}
        </ScrollView>
      </View>
    </>
  );
}
