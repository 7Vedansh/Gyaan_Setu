import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Animated, Pressable, PressableProps } from "react-native";
import Popover from "react-native-popover-view/dist/Popover";

import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { CourseProgression, ExerciseSet } from "@/types/course";

interface Props extends PressableProps {
  circleRadius: number;
  isCurrentLesson: boolean;
  isFinishedLesson: boolean;
  index: number;
  lessonDescription: string;
  totalExercise: number;
  currentExercise: ExerciseSet;
  courseProgression: CourseProgression;
}

export function LessonItem({
  isCurrentLesson,
  isFinishedLesson,
  circleRadius,
  index,
  lessonDescription,
  totalExercise,
  currentExercise,
  courseProgression,
  ...props
}: Props) {
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
  const [isVisiable, setIsVisiable] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const openPopover = () => setIsVisiable(true);
  const closePopover = () => setIsVisiable(false);

  // Pulse animation for current lesson
  useEffect(() => {
    if (isCurrentLesson) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCurrentLesson, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  };

  const {
    sectionId: sectionId,
    chapterId: chapterId,
    lessonId: lessonId,
    exerciseId: exerciseId,
  } = courseProgression;

  return (
    <Popover
      isVisible={isVisiable}
      onRequestClose={closePopover}
      popoverStyle={{
        borderRadius: layouts.radiusLg,
        backgroundColor: border,
        overflow: "hidden",
      }}
      backgroundStyle={{
        backgroundColor: background,
        opacity: 0.6,
      }}
      from={
        <Pressable
          onPress={openPopover}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...props}
        >
          {({ pressed }) => (
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
                    isCurrentLesson || isFinishedLesson || index === 0
                      ? primary
                      : accent,
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
      }
    >
      <View
        style={{
          padding: layouts.padding,
          borderRadius: layouts.radiusLg,
          width: 300,
          borderWidth: layouts.borderWidth,
          borderColor: border,
          gap: layouts.padding,
          backgroundColor: background,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: layouts.padding,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: isNotFinishedLesson ? mutedForeground : foreground,
              letterSpacing: -0.2,
            }}
          >
            {lessonDescription}
          </Text>
          {isCurrentLesson && (
            <View
              style={{
                paddingVertical: layouts.padding / 2.5,
                paddingHorizontal: layouts.padding * 0.75,
                borderRadius: layouts.pill,
                backgroundColor: accent,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  fontWeight: "700",
                  fontSize: 11,
                  color: mutedForeground,
                  letterSpacing: 0.5,
                }}
              >
                {currentExercise.difficulty}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: mutedForeground, fontSize: 14, lineHeight: 20 }}>
          {isFinishedLesson
            ? "Prove your proficiency with Legendary"
            : isNotFinishedLesson
              ? "Complete all levels above to unlock this!"
              : `Exercise ${currentExercise.id} of ${totalExercise}`}
        </Text>
        <Button
          onPress={() => {
            closePopover();
            if (isFinishedLesson) {
              router.push(
                `/pratice/${sectionId}/${chapterId}/${lessonId}/${exerciseId}`
              );
            } else {
              router.push("/lesson");
            }
          }}
          disabled={isNotFinishedLesson}
        >
          {isFinishedLesson
            ? `Practice +${currentExercise.xp / 2} xp`
            : isNotFinishedLesson
              ? "Locked"
              : `Start +${currentExercise.xp} xp`}
        </Button>
      </View>
    </Popover>
  );
}
