import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView } from "react-native";

import { Icon } from "@/components/icons";
import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { useCourse } from "@/context/course";
import { useTheme } from "@/context/theme";
import { useCourseContent } from "@/hooks/useCourseContent";
import ContentService from "@/services/content.service";
import DatabaseService from "@/services/database.service";
import SyncService from "@/services/sync.service";
import { buildTopicStages, TopicStage } from "@/services/topicFlow.service";
import { StoredMicroLesson, StoredQuiz, StoredTopic } from "@/types/store";

type TopicStep =
  | { kind: "microlesson"; item: StoredMicroLesson; index: number }
  | { kind: "quiz"; item: StoredQuiz; index: number };

const MAX_MICROLESSONS = 5;
const MAX_QUIZZES = 5;

function parseNumber(value: string | string[] | undefined, fallback = 0): number {
  if (Array.isArray(value)) return parseNumber(value[0], fallback);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function TopicScreen() {
  const params = useLocalSearchParams<{
    chapterIndex?: string;
    topicIndex?: string;
    chapterMongoId?: string;
    stageId?: string;
    sourceTopicId?: string;
  }>();
  const { courseProgress, setCourseProgress } = useCourse();
  const { course } = useCourseContent();
  const { primary, primaryForeground, foreground, mutedForeground, border, background, accent, secondary } =
    useTheme();

  const chapterIndex = parseNumber(params.chapterIndex, courseProgress.chapterId);
  const stageIndex = parseNumber(params.topicIndex, 0);
  const stageIdFromParams = parseString(params.stageId);
  const sourceTopicId = parseString(params.sourceTopicId);
  const chapterMongoIdFromParams = parseString(params.chapterMongoId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<StoredTopic | null>(null);
  const [allStages, setAllStages] = useState<TopicStage[]>([]);
  const [currentStage, setCurrentStage] = useState<TopicStage | null>(null);
  const [chapterMongoId, setChapterMongoId] = useState(chapterMongoIdFromParams);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [persistedQuizIds, setPersistedQuizIds] = useState<Set<string>>(new Set());
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTopic() {
      setIsLoading(true);
      setError(null);

      try {
        await DatabaseService.init();

        let chapterRow = chapterMongoIdFromParams
          ? await DatabaseService.getChapter(chapterMongoIdFromParams)
          : null;

        const currentSection = course.sections[courseProgress.sectionId];
        const currentSubjectId = currentSection?._id ?? null;

        let subjectId = currentSubjectId;
        if (!subjectId) {
          subjectId = await DatabaseService.getAnyCachedSubjectId();
        }

        if (!chapterRow && subjectId) {
          let allChapters = await DatabaseService.getChaptersBySubject(subjectId);
          chapterRow = allChapters[chapterIndex] ?? null;

          if (!chapterRow && currentSection?.chapters[chapterIndex]?._id) {
            await ContentService.ensureChapterCached(subjectId, currentSection.chapters[chapterIndex]._id);
            allChapters = await DatabaseService.getChaptersBySubject(subjectId);
            chapterRow = allChapters[chapterIndex] ?? null;
          }
        }

        if (!chapterRow) {
          throw new Error("Could not load chapter data for this topic.");
        }

        const chapterTopics = JSON.parse(chapterRow.content_json) as StoredTopic[];
        const stages = buildTopicStages(chapterTopics, 5);
        const resolvedStage =
          stages.find((stage) => stage.stage_id === stageIdFromParams) ??
          stages[stageIndex] ??
          null;

        const resolvedTopic = chapterTopics.find((t) => t.topic_id === resolvedStage?.source_topic_id) ?? null;

        if (!resolvedTopic || !resolvedStage) {
          throw new Error("Topic stage not found in cached chapter content.");
        }

        if (cancelled) return;
        setChapterMongoId(chapterRow.chapter_id);
        setTopic(resolvedTopic);
        setAllStages(stages);
        setCurrentStage(resolvedStage);
        setCurrentStepIndex(0);
      } catch (loadError) {
        if (cancelled) return;
        const message = loadError instanceof Error ? loadError.message : "Failed to load topic.";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTopic();
    return () => {
      cancelled = true;
    };
  }, [chapterIndex, chapterMongoIdFromParams, course.sections, courseProgress.sectionId, stageIdFromParams, stageIndex]);

  const steps = useMemo<TopicStep[]>(() => {
    if (!currentStage) return [];

    const microlessons = currentStage.microlessons.slice(0, MAX_MICROLESSONS);
    const quizzes = currentStage.quizzes.slice(0, MAX_QUIZZES);

    if (currentStage.stage_type === "microlesson") {
      return microlessons.map((item, index) => ({ kind: "microlesson" as const, item, index }));
    }

    return quizzes.map((item, index) => ({ kind: "quiz" as const, item, index }));
  }, [currentStage]);

  const currentStep = steps[currentStepIndex] ?? null;
  const isLastStep = currentStepIndex >= steps.length - 1;
  const canMoveNext =
    currentStep == null ||
    currentStep.kind === "microlesson" ||
    selectedAnswers[currentStep.item.quiz_id] != null;

  useEffect(() => {
    if (!currentStep || currentStep.kind !== "quiz") {
      setQuizStartedAt(null);
      return;
    }
    if (selectedAnswers[currentStep.item.quiz_id] != null) {
      setQuizStartedAt(null);
      return;
    }
    setQuizStartedAt(Date.now());
  }, [currentStep, selectedAnswers]);

  const submitQuizAnswer = async (quiz: StoredQuiz, selectedOption: number): Promise<void> => {
    if (selectedAnswers[quiz.quiz_id] != null) return;

    setSelectedAnswers((prev) => ({ ...prev, [quiz.quiz_id]: selectedOption }));

    if (persistedQuizIds.has(quiz.quiz_id)) return;

    const startedAt = quizStartedAt ?? Date.now();
    const elapsedMs = Date.now() - startedAt;

    try {
      await DatabaseService.insertQuizResult({
        quiz_id: quiz.quiz_id,
        topic_id: sourceTopicId || currentStage?.source_topic_id || "",
        chapter_id: chapterMongoId,
        selected_option: selectedOption,
        is_correct: selectedOption === quiz.correct,
        time_taken_ms: elapsedMs,
        attempted_at: Date.now(),
      });
      await DatabaseService.upsertQuizQuestionProgress({
        chapter_id: chapterMongoId,
        source_topic_id: sourceTopicId || currentStage?.source_topic_id || "",
        stage_id: currentStage?.stage_id || "",
        quiz_id: quiz.quiz_id,
        selected_option: selectedOption,
        is_correct: selectedOption === quiz.correct,
        attempted_at: Date.now(),
      });

      setPersistedQuizIds((prev) => new Set(prev).add(quiz.quiz_id));

      if (SyncService.getBackgroundSyncStatus().networkAvailable) {
        SyncService.performSync(true).catch(() => {});
      }
    } catch (persistError) {
      console.error("[TopicScreen] Failed to save quiz answer:", persistError);
    }
  };

  const moveNext = async () => {
    if (!canMoveNext) return;
    if (isLastStep) {
      if (currentStage) {
        try {
          await DatabaseService.markTopicStageCompleted({
            chapter_id: chapterMongoId,
            stage_id: currentStage.stage_id,
            source_topic_id: currentStage.source_topic_id,
            stage_order: currentStage.stage_order,
            stage_type: currentStage.stage_type,
          });
        } catch (error) {
          console.error("[TopicScreen] Failed to mark stage complete:", error);
        }
      }

      const section = course.sections[courseProgress.sectionId];
      const chapterCount = section?.chapters.length ?? 0;
      const nextLessonId = stageIndex + 1;
      if (chapterCount > 0 && allStages.length > 0) {
        if (nextLessonId < allStages.length) {
          setCourseProgress({
            ...courseProgress,
            lessonId: nextLessonId,
          });
        } else if (courseProgress.chapterId + 1 < chapterCount) {
          setCourseProgress({
            ...courseProgress,
            chapterId: courseProgress.chapterId + 1,
            lessonId: 0,
            exerciseId: 0,
          });
        }
      }

      router.replace("/learn");
      return;
    }
    setCurrentStepIndex((prev) => prev + 1);
  };

  return (
    <>
      <Metadata
        title={`Topic ${topic?.topic_order ?? stageIndex + 1}`}
        description="Read the current stage and complete its flow."
      />
      <View style={{ flex: 1, backgroundColor: background }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: layouts.padding }}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={{ color: mutedForeground }}>Loading topic...</Text>
          </View>
        ) : error ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: layouts.padding * 2,
              gap: layouts.padding,
            }}
          >
            <Icon name="closeCircle" size={32} color="#8D2323" />
            <Text style={{ color: foreground, textAlign: "center" }}>{error}</Text>
            <Button onPress={() => router.replace("/learn")}>Back to Learn</Button>
          </View>
        ) : !currentStep ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: layouts.padding * 2,
              gap: layouts.padding,
            }}
          >
            <Text style={{ color: foreground, textAlign: "center" }}>
              This topic does not have any microlessons or quizzes yet.
            </Text>
            <Button onPress={() => router.replace("/learn")}>Back to Learn</Button>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              padding: layouts.padding,
              gap: layouts.padding,
              paddingBottom: layouts.padding * 2,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                padding: layouts.padding,
                borderRadius: layouts.radiusLg,
                borderWidth: layouts.borderWidth,
                borderColor: border,
                backgroundColor: secondary,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: foreground }}>
                Topic {topic?.topic_order ?? stageIndex + 1}
              </Text>
              <Text style={{ color: mutedForeground }}>
                {currentStage?.stage_type === "microlesson" ? "Microlesson stage" : "Quiz stage"}{" "}
                {currentStage?.stage_index_within_type ?? 1}
              </Text>
              <Text style={{ color: mutedForeground }}>
                Step {currentStepIndex + 1} of {steps.length}
              </Text>
            </View>

            {currentStep.kind === "microlesson" ? (
              <View
                style={{
                  padding: layouts.padding,
                  borderRadius: layouts.radiusLg,
                  borderWidth: layouts.borderWidth,
                  borderColor: border,
                  backgroundColor: background,
                  gap: layouts.padding,
                }}
              >
                <View
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: layouts.pill,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    backgroundColor: accent,
                  }}
                >
                  <Text style={{ fontSize: 12, color: mutedForeground, fontWeight: "700" }}>
                    Microlesson {currentStep.index + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "700", color: foreground }}>
                  {currentStep.item.title}
                </Text>
                <View style={{ gap: layouts.padding * 0.75 }}>
                  {currentStep.item.content.map((paragraph, idx) => (
                    <Text key={`${currentStep.item.microlesson_id}-${idx}`} style={{ color: foreground, lineHeight: 22 }}>
                      {paragraph}
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              <View
                style={{
                  padding: layouts.padding,
                  borderRadius: layouts.radiusLg,
                  borderWidth: layouts.borderWidth,
                  borderColor: border,
                  backgroundColor: background,
                  gap: layouts.padding,
                }}
              >
                <View
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: layouts.pill,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    backgroundColor: accent,
                  }}
                >
                  <Text style={{ fontSize: 12, color: mutedForeground, fontWeight: "700" }}>
                    Quiz {currentStep.index + 1}
                  </Text>
                </View>

                <Text style={{ fontSize: 18, fontWeight: "700", color: foreground, lineHeight: 24 }}>
                  {currentStep.item.question}
                </Text>

                {currentStep.item.options.map((option, optionIndex) => {
                  const selected = selectedAnswers[currentStep.item.quiz_id];
                  const answered = selected != null;
                  const isCorrect = optionIndex === currentStep.item.correct;
                  const isSelected = optionIndex === selected;

                  let optionBackground = secondary;
                  if (answered && isCorrect) optionBackground = "#DDF6D8";
                  if (answered && isSelected && !isCorrect) optionBackground = "#FFE3E0";

                  return (
                    <Pressable
                      key={`${currentStep.item.quiz_id}-${optionIndex}`}
                      onPress={() => submitQuizAnswer(currentStep.item, optionIndex)}
                      disabled={answered}
                      style={{
                        padding: layouts.padding * 0.75,
                        borderRadius: layouts.radius,
                        borderWidth: layouts.borderWidth,
                        borderColor: border,
                        backgroundColor: optionBackground,
                        flexDirection: "row",
                        gap: layouts.padding * 0.75,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "700", color: foreground }}>
                        {String.fromCharCode(65 + optionIndex)}.
                      </Text>
                      <Text style={{ color: foreground, flex: 1 }}>{option}</Text>
                    </Pressable>
                  );
                })}

                {selectedAnswers[currentStep.item.quiz_id] != null && (
                  <View style={{ gap: 6 }}>
                    <Text
                      style={{
                        color:
                          selectedAnswers[currentStep.item.quiz_id] === currentStep.item.correct
                            ? "#1D6B2A"
                            : "#8D2323",
                        fontWeight: "700",
                      }}
                    >
                      {selectedAnswers[currentStep.item.quiz_id] === currentStep.item.correct
                        ? "Correct"
                        : "Incorrect"}
                    </Text>
                    <Text style={{ color: mutedForeground, lineHeight: 20 }}>{currentStep.item.explanation}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: layouts.padding * 0.75 }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                disabled={currentStepIndex === 0}
                onPress={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <Button
                style={{ flex: 1, backgroundColor: primary }}
                textStyle={{ color: primaryForeground }}
                onPress={moveNext}
                disabled={!canMoveNext}
              >
                {isLastStep ? "Finish topic" : "Next"}
              </Button>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}
