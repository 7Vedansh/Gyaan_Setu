import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Animated, Pressable, PressableProps, StyleProp, View as NativeView, ViewStyle } from "react-native";
import Popover from "react-native-popover-view/dist/Popover";

import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { CourseProgression } from "@/types/course";
import { StoredTopic } from "@/types/store";

interface Props extends PressableProps {
  circleRadius: number;
  isCurrentLesson: boolean;
  isFinishedLesson: boolean;
  index: number;
  topic: StoredTopic;
  totalMicroLessons: number;
  totalQuizzes: number;
  courseProgression: CourseProgression;
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
  } = useTheme();

  const isNotFinishedLesson = !isFinishedLesson && !isCurrentLesson;
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"microlessons" | "quizzes">("microlessons");

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popoverAnchor = useRef<NativeView>(null);

  const openPopover = () => setIsVisible(true);
  const closePopover = () => setIsVisible(false);

  const { sectionId, chapterId, lessonId, exerciseId } = courseProgression;

  // Pulse animation for current lesson
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
            {/* ── Header ───────────────────────────────────────────────── */}
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

              {/* Stats row */}
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

            {/* ── Tab bar ──────────────────────────────────────────────── */}
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
                    onPress={() => setActiveTab(tab)}
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

            {/* ── Content ──────────────────────────────────────────────── */}
            <View style={{ padding: layouts.padding, gap: layouts.padding * 0.75 }}>
              {isNotFinishedLesson ? (
                // Locked state
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
                // Microlessons list
                topic.microlessons.map((ml, i) => (
                  <View
                    key={ml.microlesson_id}
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
                        backgroundColor: isFinishedLesson ? primary : accent,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 1,
                      }}
                    >
                      {isFinishedLesson ? (
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
                  </View>
                ))
              ) : (
                // Quizzes list
                topic.quizzes.map((quiz, i) => (
                  <View
                    key={quiz.quiz_id}
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
                        backgroundColor: isFinishedLesson ? primary : accent,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 1,
                      }}
                    >
                      {isFinishedLesson ? (
                        <Icon name="check" size={14} color={primaryForeground} />
                      ) : (
                        <Text style={{ fontSize: 11, fontWeight: "700", color: mutedForeground }}>
                          {quiz.order}
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
                      numberOfLines={2}
                    >
                      {quiz.question}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* ── Action button ─────────────────────────────────────────── */}
            <View style={{ padding: layouts.padding, paddingTop: 0 }}>
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
            </View>
          </View>
        </Popover>
      )}
    </>
  );
}