import { useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  View as NativeView,
  ViewStyle,
} from "react-native";

import { Icon } from "@/components/icons";
import { View } from "@/components/themed";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { TopicStage } from "@/services/topicFlow.service";
import { CourseProgression } from "@/types/course";

interface Props extends PressableProps {
  circleRadius: number;
  isCurrentLesson: boolean;
  isFinishedLesson: boolean;
  index: number;
  stage: TopicStage;
  courseProgression: CourseProgression;
  currentChapterMongoId: string;
  style?: StyleProp<ViewStyle>;
}

export function LessonItem({
  isCurrentLesson,
  isFinishedLesson,
  circleRadius,
  index,
  stage,
  courseProgression,
  currentChapterMongoId,
  ...props
}: Props) {
  const { style, ...pressableProps } = props;
  const { primary, primaryForeground, muted, accent } = useTheme();

  const isNotFinishedLesson = !isFinishedLesson && !isCurrentLesson;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { chapterId } = courseProgression;

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
    <NativeView style={style as StyleProp<ViewStyle>}>
      <Pressable
        onPress={() => {
          if (isNotFinishedLesson) return;
          const chapterParam = encodeURIComponent(currentChapterMongoId);
          const stageIdParam = encodeURIComponent(stage.stage_id);
          const sourceTopicParam = encodeURIComponent(stage.source_topic_id);
          router.push(
            `/topic/${chapterId}/${index}?chapterMongoId=${chapterParam}&stageId=${stageIdParam}&sourceTopicId=${sourceTopicParam}` as never
          );
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isNotFinishedLesson}
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
  );
}
