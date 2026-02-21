import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import {
  Animated,
  Modal,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  View as NativeView,
  ViewStyle,
} from "react-native";
import Popover from "react-native-popover-view/dist/Popover";

import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { CourseProgression } from "@/types/course";
import { StoredMicroLesson, StoredQuiz, StoredTopic } from "@/types/store";
import DatabaseService from "@/services/database.service";
import SyncService from "@/services/sync.service";

interface Props extends PressableProps {
  circleRadius: number;
  isCurrentLesson: boolean;
  isFinishedLesson: boolean;
  index: number;
  topic: StoredTopic;
  totalMicroLessons: number;
  totalQuizzes: number;
  courseProgression: CourseProgression;
  currentChapterMongoId: string;
  style?: StyleProp<ViewStyle>;
}

export function LessonItem({
  isCurrentLesson,
  isFinishedLesson,
  circleRadius,
  index,
  topic,
  totalMicroLessons,
  totalQuizzes,
  courseProgression,
  currentChapterMongoId,
  ...props
}: Props) {
  const { style, ...pressableProps } = props;
  const {
    border,
    background,
    primary,
    primaryForeground,
    foreground,
    mutedForeground,
    muted,
    accent,
    secondary,
  } = useTheme();

  const isNotFinishedLesson = !isFinishedLesson && !isCurrentLesson;
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"microlessons" | "quizzes">("microlessons");
  const [activeMicroLesson, setActiveMicroLesson] = useState<StoredMicroLesson | null>(null);
  const [readMicroLessons, setReadMicroLessons] = useState<Set<string>>(new Set());
  const [activeQuizIndex, setActiveQuizIndex] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popoverAnchor = useRef<NativeView>(null);

  const openPopover = () => setIsVisible(true);
  const closePopover = () => {
    setIsVisible(false);
    setActiveQuizIndex(null);
    setSelectedOptionIndex(null);
    setQuizStartedAt(null);
  };

  const { sectionId, chapterId, lessonId, exerciseId } = courseProgression;

  useEffect(() => {
    if (isCurrentLesson) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isCurrentLesson, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, friction: 6, tension: 100 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }).start();
  };

  const openQuiz = (quizIndex: number) => {
    setActiveQuizIndex(quizIndex);
    setSelectedOptionIndex(null);
    setQuizStartedAt(Date.now());
  };

  const currentQuiz: StoredQuiz | null =
    activeQuizIndex == null ? null : (topic.quizzes[activeQuizIndex] ?? null);

  const selectQuizOption = async (selectedIndex: number) => {
    if (!currentQuiz || selectedOptionIndex != null) return;
    setSelectedOptionIndex(selectedIndex);

    const startTime = quizStartedAt ?? Date.now();
    const timeTaken = Date.now() - startTime;

    try {
      await DatabaseService.init();
      await DatabaseService.insertQuizResult({
        quiz_id: currentQuiz.quiz_id,
        topic_id: topic.topic_id,
        chapter_id: currentChapterMongoId,
        selected_option: selectedIndex,
        is_correct: selectedIndex === currentQuiz.correct,
        time_taken_ms: timeTaken,
        attempted_at: Date.now(),
      });

      if (SyncService.getBackgroundSyncStatus().networkAvailable) {
        SyncService.performSync(true).catch(() => {});
      }
    } catch (error) {
      console.error("[LessonItem] Failed to save quiz result:", error);
    }
  };

  const goToNextQuizOrClose = () => {
    if (activeQuizIndex == null) return;
    const nextIndex = activeQuizIndex + 1;
    if (nextIndex < topic.quizzes.length) {
      openQuiz(nextIndex);
      return;
    }
    closePopover();
  };

  return (
    <>
      <NativeView ref={popoverAnchor} style={style as StyleProp<ViewStyle>}>
        <Pressable
          onPress={openPopover}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...pressableProps}
        >
          {() => (
            <Animated.View
              style={{
                padding: layouts.padding / 2,
                width: circleRadius * 2,
                aspectRatio: 1,
                transform: [
                  { scale: scaleAnim },
                  { scale: isCurrentLesson ? pulseAnim : 1 },
                ],
              }}
            >
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: 9999,
                  backgroundColor:
                    isCurrentLesson || isFinishedLesson || index === 0 ? primary : accent,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: isCurrentLesson ? 0.15 : 0.08,
                  shadowRadius: isCurrentLesson ? 12 : 8,
                  shadowOffset: { width: 0, height: isCurrentLesson ? 6 : 4 },
                  elevation: isCurrentLesson ? 4 : 2,
                }}
              >
                {isCurrentLesson ? (
                  <Icon name="star" size={32} color={primaryForeground} />
                ) : isFinishedLesson ? (
                  <Icon name="check" size={32} color={primaryForeground} />
                ) : index === 0 ? (
                  <Icon name="skip" size={32} color={primaryForeground} />
                ) : (
                  <Icon name="lock" size={32} color={muted} />
                )}
              </View>
            </Animated.View>
          )}
        </Pressable>
      </NativeView>

      {popoverAnchor.current && (
        <Popover
          isVisible={isVisible}
          from={popoverAnchor}
          onRequestClose={closePopover}
          popoverStyle={{
            borderRadius: layouts.radiusLg,
            backgroundColor: border,
            overflow: "hidden",
          }}
          backgroundStyle={{ backgroundColor: background, opacity: 0.6 }}
        >
          <View
            style={{
              width: 320,
              borderRadius: layouts.radiusLg,
              borderWidth: layouts.borderWidth,
              borderColor: border,
              backgroundColor: background,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}
          >
            <View
              style={{
                backgroundColor: primary,
                padding: layouts.padding * 1.25,
                gap: layouts.padding * 0.5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: primaryForeground,
                    letterSpacing: -0.2,
                    flex: 1,
                  }}
                >
                  Topic {topic.topic_order}
                </Text>
                {isCurrentLesson && (
                  <View
                    style={{
                      paddingVertical: layouts.padding / 3,
                      paddingHorizontal: layouts.padding * 0.75,
                      borderRadius: layouts.pill,
                      backgroundColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Text
                      style={{
                        textTransform: "uppercase",
                        fontWeight: "700",
                        fontSize: 10,
                        color: primaryForeground,
                        letterSpacing: 0.8,
                      }}
                    >
                      Current
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: "row", gap: layouts.padding * 1.5, marginTop: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Icon name="notebook" size={14} color={primaryForeground} />
                  <Text style={{ color: primaryForeground, fontSize: 12, fontWeight: "600" }}>
                    {totalMicroLessons} lessons
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Icon name="star" size={14} color={primaryForeground} />
                  <Text style={{ color: primaryForeground, fontSize: 12, fontWeight: "600" }}>
                    {totalQuizzes} quizzes
                  </Text>
                </View>
              </View>
            </View>

            {!isNotFinishedLesson && (
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: layouts.borderWidth,
                  borderBottomColor: border,
                }}
              >
                {(["microlessons", "quizzes"] as const).map((tab) => (
                  <Pressable
                    key={tab}
                    onPress={() => {
                      setActiveTab(tab);
                      setActiveQuizIndex(null);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: layouts.padding * 0.75,
                      alignItems: "center",
                      borderBottomWidth: 2,
                      borderBottomColor: activeTab === tab ? primary : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: activeTab === tab ? primary : mutedForeground,
                        textTransform: "capitalize",
                      }}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={{ padding: layouts.padding, gap: layouts.padding * 0.75 }}>
              {isNotFinishedLesson ? (
                <View style={{ alignItems: "center", paddingVertical: layouts.padding }}>
                  <Icon name="lock" size={28} color={mutedForeground} />
                  <Text
                    style={{
                      color: mutedForeground,
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: layouts.padding * 0.5,
                      lineHeight: 20,
                    }}
                  >
                    Complete all topics above to unlock this!
                  </Text>
                </View>
              ) : activeTab === "microlessons" ? (
                topic.microlessons.map((ml, i) => {
                  const isRead = readMicroLessons.has(ml.microlesson_id);
                  return (
                    <Pressable
                      key={ml.microlesson_id}
                      onPress={() => setActiveMicroLesson(ml)}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: layouts.padding * 0.75,
                        paddingVertical: layouts.padding * 0.5,
                        borderBottomWidth: i < topic.microlessons.length - 1 ? layouts.borderWidth : 0,
                        borderBottomColor: border,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 9999,
                          backgroundColor: isRead || isFinishedLesson ? primary : accent,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 1,
                        }}
                      >
                        {isRead || isFinishedLesson ? (
                          <Icon name="check" size={14} color={primaryForeground} />
                        ) : (
                          <Text style={{ fontSize: 11, fontWeight: "700", color: mutedForeground }}>
                            {ml.order}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: foreground,
                          fontWeight: "500",
                          flex: 1,
                          lineHeight: 18,
                        }}
                      >
                        {ml.title}
                      </Text>
                    </Pressable>
                  );
                })
              ) : currentQuiz ? (
                <View style={{ gap: layouts.padding }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: foreground, lineHeight: 20 }}>
                    {currentQuiz.question}
                  </Text>

                  {currentQuiz.options.map((option, optionIndex) => {
                    const wasAnswered = selectedOptionIndex != null;
                    const isCorrectOption = optionIndex === currentQuiz.correct;
                    const isSelected = optionIndex === selectedOptionIndex;

                    let optionBg = secondary;
                    if (wasAnswered && isCorrectOption) optionBg = "#DDF6D8";
                    if (wasAnswered && isSelected && !isCorrectOption) optionBg = "#FFE3E0";

                    return (
                      <Pressable
                        key={optionIndex}
                        onPress={() => selectQuizOption(optionIndex)}
                        disabled={wasAnswered}
                        style={{
                          paddingVertical: layouts.padding * 0.75,
                          paddingHorizontal: layouts.padding,
                          borderRadius: layouts.radius,
                          borderWidth: layouts.borderWidth,
                          borderColor: border,
                          backgroundColor: optionBg,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: layouts.padding * 0.5,
                        }}
                      >
                        <Text style={{ fontWeight: "700", color: foreground }}>
                          {String.fromCharCode(65 + optionIndex)}.
                        </Text>
                        <Text style={{ flex: 1, color: foreground }}>{option}</Text>
                      </Pressable>
                    );
                  })}

                  {selectedOptionIndex != null && (
                    <View style={{ gap: 8 }}>
                      <Text
                        style={{
                          color: selectedOptionIndex === currentQuiz.correct ? "#1D6B2A" : "#8D2323",
                          fontWeight: "700",
                        }}
                      >
                        {selectedOptionIndex === currentQuiz.correct ? "Correct" : "Incorrect"}
                      </Text>
                      <Text style={{ color: mutedForeground, lineHeight: 18 }}>
                        {currentQuiz.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                topic.quizzes.map((quiz, i) => (
                  <Pressable
                    key={quiz.quiz_id}
                    onPress={() => openQuiz(i)}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: layouts.padding * 0.75,
                      paddingVertical: layouts.padding * 0.5,
                      borderBottomWidth: i < topic.quizzes.length - 1 ? layouts.borderWidth : 0,
                      borderBottomColor: border,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: accent,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 1,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: mutedForeground }}>
                        {quiz.order}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: foreground,
                        fontWeight: "500",
                        flex: 1,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {quiz.question}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>

            <View style={{ padding: layouts.padding, paddingTop: 0 }}>
              {activeTab === "quizzes" && currentQuiz ? (
                <Button
                  onPress={goToNextQuizOrClose}
                  disabled={selectedOptionIndex == null}
                >
                  {activeQuizIndex != null && activeQuizIndex < topic.quizzes.length - 1 ? "Next" : "Close"}
                </Button>
              ) : (
                <Button
                  onPress={() => {
                    closePopover();
                    if (isFinishedLesson) {
                      router.push(`/pratice/${sectionId}/${chapterId}/${lessonId}/${exerciseId}`);
                    } else if (!isNotFinishedLesson) {
                      router.push("/lesson");
                    }
                  }}
                  disabled={isNotFinishedLesson}
                >
                  {isFinishedLesson
                    ? "Practice again"
                    : isNotFinishedLesson
                      ? "Locked"
                      : "Start topic"}
                </Button>
              )}
            </View>
          </View>
        </Popover>
      )}

      <Modal
        visible={activeMicroLesson != null}
        animationType="slide"
        onRequestClose={() => setActiveMicroLesson(null)}
      >
        <View style={{ flex: 1, padding: layouts.padding, backgroundColor: background, gap: layouts.padding }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: foreground }}>
            {activeMicroLesson?.title ?? ""}
          </Text>

          <ScrollView contentContainerStyle={{ gap: layouts.padding }}>
            {(activeMicroLesson?.content ?? []).map((paragraph, idx) => (
              <Text key={idx} style={{ color: foreground, lineHeight: 22 }}>
                {paragraph}
              </Text>
            ))}
          </ScrollView>

          <Button
            onPress={() => {
              if (activeMicroLesson) {
                setReadMicroLessons((prev) => new Set(prev).add(activeMicroLesson.microlesson_id));
              }
              setActiveMicroLesson(null);
            }}
          >
            Done
          </Button>
        </View>
      </Modal>
    </>
  );
}
