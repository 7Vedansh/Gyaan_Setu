import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Pressable, StyleSheet } from "react-native";

import ExerciseScreen from "@/components/exercise/screens/exercise";
import { Metadata } from "@/components/metadata";
import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { getExercise, getLesson } from "@/services/course.service";
import { useCourse } from "@/context/course";
import { useTheme } from "@/context/theme";
import {
  getMicroLessonsByTopic,
  getQuizzesByTopic,
  type MicroLessonResponse,
  type QuizResponse,
} from "@/services/microLesson.service";

// ─── Types ──────────────────────────────────────────────────────────────────

type ScreenState = "theory" | "quiz" | "exercise";

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Lesson() {
  const { courseId, courseProgress } = useCourse();
  const {
    primary,
    primaryForeground,
    foreground,
    background,
    accent,
    muted,
    mutedForeground,
    border,
    sucess,
    destructive,
  } = useTheme();

  // ── Backend data state ──────────────────────────────────────────────────
  const [microLesson, setMicroLesson] = useState<MicroLessonResponse | null>(null);
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Which screen to show ────────────────────────────────────────────────
  const [screen, setScreen] = useState<ScreenState>("theory");

  // ── Quiz interaction state ──────────────────────────────────────────────
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});

  // ── Fetch backend data on mount ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Get the real backend ID for the current topic from CourseService
        const lessonInfo = getLesson(
          courseProgress.sectionId,
          courseProgress.chapterId,
          courseProgress.lessonId
        );

        const topicId = lessonInfo?._id;

        // If no backend ID (static fallback mode), skip backend fetch
        if (!topicId) {
          setIsLoading(false);
          return;
        }

        const [lessons, fetchedQuizzes] = await Promise.all([
          getMicroLessonsByTopic(topicId),
          getQuizzesByTopic(topicId),
        ]);

        if (cancelled) return;

        if (lessons.length > 0) {
          const firstLesson = lessons[0];
          setMicroLesson(firstLesson);

          // Example of using the populated upward chain as requested
          // const realTopicId = firstLesson.topic._id;
          // const realChapterId = firstLesson.topic.chapter;
        }

        // Show only first 2 quiz questions
        setQuizzes(fetchedQuizzes.slice(0, 2));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load lesson";
        setError(message);
        console.error("[Lesson] Fetch error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [courseProgress]);

  // ── Fallback: static exercise from local content ────────────────────────
  if (!courseId) return null;
  const exercise = getExercise(courseProgress);

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={{ color: mutedForeground, fontSize: 16, marginTop: 16 }}>
          Loading lesson…
        </Text>
      </View>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="closeCircle" size={48} color={destructive} />
        <Text
          style={{
            color: destructive,
            fontSize: 16,
            marginTop: 12,
            textAlign: "center",
            paddingHorizontal: layouts.padding * 2,
          }}
        >
          {error}
        </Text>
        <Button
          variant="outline"
          onPress={() => setScreen("exercise")}
          style={{ marginTop: layouts.padding }}
        >
          Continue with exercises
        </Button>
      </View>
    );
  }

  // ── Screen: Exercise (fallback to existing static content) ───────────────
  if (screen === "exercise") {
    if (!exercise) return null;
    return (
      <>
        <Metadata
          title="Lesson"
          description="Learn a new lesson every day to keep your streak."
        />
        <ExerciseScreen exercise={exercise} increaseProgress={true} />
      </>
    );
  }

  // ── Screen: Theory Content ──────────────────────────────────────────────
  if (screen === "theory" && microLesson) {
    return (
      <>
        <Metadata
          title={microLesson.microlesson_title}
          description="Study the theory before testing your knowledge."
        />
        <ScrollView
          style={{ flex: 1, backgroundColor: background }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Subject badge */}
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>
              Theory
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: foreground,
              letterSpacing: -0.5,
            }}
          >
            {microLesson.microlesson_title}
          </Text>

          {/* Theory paragraphs */}
          <View
            style={[
              styles.card,
              { backgroundColor: background, borderColor: border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Icon name="notebook" size={20} color={primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: foreground,
                  marginLeft: 8,
                }}
              >
                Lesson Content
              </Text>
            </View>

            {microLesson.microlesson_content.map((paragraph, idx) => (
              <Text
                key={idx}
                style={{
                  fontSize: 15,
                  color: foreground,
                  lineHeight: 24,
                  marginBottom: idx < microLesson.microlesson_content.length - 1 ? 12 : 0,
                }}
              >
                {paragraph}
              </Text>
            ))}
          </View>

          {/* Continue to quiz */}
          <Button onPress={() => setScreen(quizzes.length > 0 ? "quiz" : "exercise")}>
            {quizzes.length > 0 ? "Take Quiz →" : "Start Exercises →"}
          </Button>
        </ScrollView>
      </>
    );
  }

  // ── Screen: Quiz (first 2 questions) ────────────────────────────────────
  if (screen === "quiz" && quizzes.length > 0) {
    const allAnswered = quizzes.every((q) => selectedAnswers[q._id] != null);

    return (
      <>
        <Metadata
          title="Quick Quiz"
          description="Test your understanding of the lesson."
        />
        <ScrollView
          style={{ flex: 1, backgroundColor: background }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>Quiz</Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: foreground,
              letterSpacing: -0.3,
            }}
          >
            Quick Quiz
          </Text>

          {quizzes.map((quiz, qIdx) => {
            const selected = selectedAnswers[quiz._id];
            const hasAnswered = selected != null;
            const isCorrect = selected === quiz.correct;

            return (
              <View
                key={quiz._id}
                style={[
                  styles.card,
                  { backgroundColor: background, borderColor: border },
                ]}
              >
                {/* Question header */}
                <View style={styles.questionHeader}>
                  <View style={[styles.qBadge, { backgroundColor: primary }]}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: primaryForeground,
                      }}
                    >
                      Q{qIdx + 1}
                    </Text>
                  </View>
                </View>

                {/* Question text */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: foreground,
                    lineHeight: 24,
                    marginBottom: 12,
                  }}
                >
                  {quiz.question}
                </Text>

                {/* Options */}
                {quiz.options.map((option, optIdx) => {
                  let optBg = accent;
                  let optBorder = border;

                  if (hasAnswered) {
                    if (optIdx === quiz.correct) {
                      optBg = `${sucess}20`;
                      optBorder = sucess;
                    } else if (optIdx === selected && !isCorrect) {
                      optBg = `${destructive}20`;
                      optBorder = destructive;
                    } else {
                      optBg = muted;
                    }
                  }

                  return (
                    <Pressable
                      key={optIdx}
                      onPress={() => {
                        if (hasAnswered) return;
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [quiz._id]: optIdx,
                        }));
                      }}
                      style={[
                        styles.option,
                        {
                          backgroundColor: optBg,
                          borderColor: optBorder,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: foreground,
                          fontWeight:
                            hasAnswered && optIdx === quiz.correct
                              ? "700"
                              : "400",
                          flex: 1,
                        }}
                      >
                        {option}
                      </Text>
                      {hasAnswered && optIdx === quiz.correct && (
                        <Icon name="checkCircle" size={18} color={sucess} />
                      )}
                      {hasAnswered &&
                        optIdx === selected &&
                        !isCorrect && (
                          <Icon name="closeCircle" size={18} color={destructive} />
                        )}
                    </Pressable>
                  );
                })}

                {/* Explanation */}
                {hasAnswered && (
                  <View
                    style={[
                      styles.explanation,
                      {
                        backgroundColor: isCorrect
                          ? `${sucess}15`
                          : `${destructive}15`,
                        borderColor: isCorrect ? sucess : destructive,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: foreground,
                        lineHeight: 20,
                      }}
                    >
                      {isCorrect ? "✅ Correct! " : "❌ Incorrect. "}
                      {quiz.explanation}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Continue to exercises */}
          {allAnswered && exercise && (
            <Button onPress={() => setScreen("exercise")}>
              Continue to Exercises →
            </Button>
          )}
        </ScrollView>
      </>
    );
  }

  // ── Fallback: go straight to exercise if no backend data ────────────────
  if (!exercise) return null;
  return (
    <>
      <Metadata
        title="Lesson"
        description="Learn a new lesson every day to keep your streak."
      />
      <ExerciseScreen exercise={exercise} increaseProgress={true} />
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layouts.padding * 2,
  },
  container: {
    padding: layouts.padding,
    paddingBottom: layouts.padding * 3,
    gap: layouts.padding,
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: layouts.pill,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    padding: layouts.padding,
    borderRadius: layouts.radiusLg,
    borderWidth: layouts.borderWidth,
    gap: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  qBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: layouts.pill,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: layouts.radius,
    borderWidth: 1.5,
  },
  explanation: {
    padding: 12,
    borderRadius: layouts.radius,
    borderWidth: 1,
    marginTop: 4,
  },
});
