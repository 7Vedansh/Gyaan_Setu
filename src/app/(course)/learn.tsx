import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";

import { CourseDetailsBar } from "@/components/course-details-bar";
import { Icon } from "@/components/icons";
import { LessonItem } from "@/components/lesson-item";
import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { useCourseContent } from "@/hooks/useCourseContent";
import { useBreakpoint } from "@/context/breakpoints";
import { useCourse } from "@/context/course";
import { DEFAULT_LANGUAGE_CODE } from "@/constants/default";
import { useTheme } from "@/context/theme";
import { Chapter } from "@/types/course";
import DatabaseService from "@/services/database.service";
import { CachedChapterRow, StoredTopic } from "@/types/store";
import ContentService from "@/services/content.service";
import ApiService from "@/services/api.service";

const CAMP = 16;
const CIRCLE_RADUIS = 48;

export default function Learn() {
  const languageCode = DEFAULT_LANGUAGE_CODE;
  const { courseId, courseProgress } = useCourse();
  const { mutedForeground, border, accent, secondary, foreground, primary } = useTheme();
  const breakpoint = useBreakpoint();
  const { course, isLoading } = useCourseContent();

  const [headerHeight, setHeaderHeight] = useState(0);

  // ── SQLite chapter state ────────────────────────────────────────────────────
  const [currentChapter, setCurrentChapter] = useState<CachedChapterRow | null>(null);
  const [topics, setTopics] = useState<StoredTopic[]>([]);
  const [isChapterLoading, setIsChapterLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");
  const currentSection = course.sections[courseProgress.sectionId];
  const currentSubjectId = currentSection?._id ?? null;

  useEffect(() => {
    if (!courseId) {
      setIsChapterLoading(false);
      setCurrentChapter(null);
      setTopics([]);
      setDebugInfo(`No course id yet. courseId=${String(courseId)} subjectId=${String(currentSubjectId)}`);
      return;
    }

    async function loadChapter() {
      setIsChapterLoading(true);
      try {
        await DatabaseService.init();
        let subjectId = currentSubjectId;
        if (!subjectId) {
          subjectId = await DatabaseService.getAnyCachedSubjectId();
          if (!subjectId) {
            try {
              let structure;
              try {
                structure = await ApiService.fetchCourseStructure();
              } catch (firstErr) {
                const msg =
                  firstErr instanceof Error ? firstErr.message.toLowerCase() : String(firstErr).toLowerCase();
                if (msg.includes("abort")) {
                  await new Promise((resolve) => setTimeout(resolve, 700));
                  structure = await ApiService.fetchCourseStructure();
                } else {
                  throw firstErr;
                }
              }
              const language = structure[0];
              const fallbackSubject = language?.subjects
                ?.slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
              const fallbackChapter = fallbackSubject?.chapters
                ?.slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

              if (fallbackSubject?._id && fallbackChapter?._id) {
                await ContentService.ensureChapterCached(fallbackSubject._id, fallbackChapter._id);
                subjectId = fallbackSubject._id;
              } else {
                setDebugInfo(`No subject id yet. courseId=${String(courseId)} subjectId=null and no cached subject`);
                setCurrentChapter(null);
                setTopics([]);
                return;
              }
            } catch (bootstrapErr) {
              setDebugInfo(
                `Bootstrap failed: ${
                  bootstrapErr instanceof Error ? bootstrapErr.message : String(bootstrapErr)
                }`
              );
              setCurrentChapter(null);
              setTopics([]);
              return;
            }
          }
          setDebugInfo(`Using cached subjectId=${subjectId} (course subject id missing)`);
        }

        // All chapters for this subject ordered by chapter_order ASC
        let allChapters = await DatabaseService.getChaptersBySubject(subjectId);
        console.log(`[Learn] SQLite chapters for subject=${subjectId}:`, allChapters.length);
        setDebugInfo(`subject=${subjectId} sqliteChapters=${allChapters.length}`);

        // courseProgress.chapterId is the numeric index into that ordered list
        let row = allChapters[courseProgress.chapterId] ?? null;

        // Recovery path: if chapter cache is missing, fetch current chapter immediately.
        if (!row) {
          const chapterFromCourse = currentSection?.chapters[courseProgress.chapterId];
          const chapterMongoId = chapterFromCourse?._id;
          if (chapterMongoId) {
            try {
              await ContentService.ensureChapterCached(subjectId, chapterMongoId);
              allChapters = await DatabaseService.getChaptersBySubject(subjectId);
              row = allChapters[courseProgress.chapterId] ?? null;
            } catch (fetchErr) {
              console.error("[Learn] Failed to fetch/cache missing chapter:", fetchErr);
            }
          }
        }

        setCurrentChapter(row);
        const parsedTopics = row ? (JSON.parse(row.content_json) as StoredTopic[]) : [];
        const microCount = parsedTopics.reduce((acc, t) => acc + t.microlessons.length, 0);
        const quizCount = parsedTopics.reduce((acc, t) => acc + t.quizzes.length, 0);
        console.log(
          `[Learn] Loaded chapter row=${row?.chapter_id ?? "none"}, topics=${parsedTopics.length}, microlessons=${microCount}, quizzes=${quizCount}`
        );
        setDebugInfo(
          `row=${row?.chapter_id ?? "none"} topics=${parsedTopics.length} micro=${microCount} quiz=${quizCount}`
        );
        setTopics(parsedTopics);
      } catch (err) {
        console.error('[Learn] Failed to load chapter from SQLite:', err);
        setDebugInfo(`load error: ${err instanceof Error ? err.message : String(err)}`);
        setCurrentChapter(null);
        setTopics([]);
      } finally {
        setIsChapterLoading(false);
      }
    }

    loadChapter();
  }, [courseId, courseProgress.chapterId, currentSubjectId]);
  // ───────────────────────────────────────────────────────────────────────────

  let isOdd = true;
  let translateX = 0;

  if (!currentSection) {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      );
    }
    return null;
  }

  const renderCourseChapter = (chapter: Chapter, chapterIndex: number) => {
    // Check if this chapter's SQLite content is loaded
    const isThisCurrentChapter = courseProgress.chapterId === chapterIndex;
    const chapterTopics = isThisCurrentChapter ? topics : [];

    return (
      <View
        key={chapter.id}
        style={{
          gap: layouts.padding * 4,
          paddingHorizontal: breakpoint === "sm" ? 0 : layouts.padding * 2,
        }}
      >
        {/* Chapter header card — unchanged */}
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
          <View style={{ backgroundColor: colors.transparent, gap: layouts.padding, flex: 1 }}>
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

        {/* Topics — replaces chapter.lessons */}
        <View style={{ gap: layouts.padding * 2, alignItems: "center" }}>
          {isThisCurrentChapter && isChapterLoading ? (
            <ActivityIndicator size="small" color={primary} />
          ) : isThisCurrentChapter && chapterTopics.length === 0 ? (
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ color: mutedForeground, fontSize: 14 }}>
                Content not available offline yet.
              </Text>
              <Text style={{ color: mutedForeground, fontSize: 11, textAlign: "center" }}>
                {debugInfo}
              </Text>
            </View>
          ) : (
            chapterTopics.map((topic, topicIndex) => {
              if (translateX > CAMP || translateX < -CAMP) isOdd = !isOdd;
              if (topicIndex !== 0) isOdd ? (translateX += CIRCLE_RADUIS) : (translateX -= CIRCLE_RADUIS);

              const isCurrentTopic =
                isThisCurrentChapter && courseProgress.lessonId === topicIndex;
              const isFinishedTopic =
                (isThisCurrentChapter && topicIndex < courseProgress.lessonId) ||
                chapterIndex < courseProgress.chapterId;

              return (
                <LessonItem
                  key={topic.topic_id}
                  index={topicIndex}
                  circleRadius={CIRCLE_RADUIS}
                  topic={topic}
                  currentChapterMongoId={chapter._id ?? ""}
                  isCurrentLesson={isCurrentTopic}
                  isFinishedLesson={isFinishedTopic}
                  totalMicroLessons={topic.microlessons.length}
                  totalQuizzes={topic.quizzes.length}
                  style={{ transform: [{ translateX }] }}
                  courseProgression={{
                    sectionId: courseProgress.sectionId,
                    chapterId: chapterIndex,
                    lessonId: topicIndex,
                    exerciseId: 0,
                  }}
                />
              );
            })
          )}
        </View>
      </View>
    );
  };

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
                paddingTop: breakpoint == "sm" ? layouts.padding : layouts.padding * 3,
                paddingHorizontal: breakpoint == "sm" ? layouts.padding : layouts.padding * 2,
              }}
            />
          )}
          <View
            style={{
              paddingBottom: layouts.padding,
              paddingTop:
                breakpoint === "sm" ? 0
                  : breakpoint === "md" ? layouts.padding * 2
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
            paddingTop: breakpoint == "sm" ? headerHeight : headerHeight + layouts.padding * 2,
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
