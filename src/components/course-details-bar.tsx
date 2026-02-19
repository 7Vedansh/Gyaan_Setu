import { useRef } from "react";
import { Animated, Pressable } from "react-native";
import { Icon } from "@/components/icons";
import { Text, View, ViewProps } from "@/components/themed";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { SupportedLanguageCode } from "@/types";
import { useStreak } from "@/hooks/useStreak";
import { StreakBadge } from "@/components/StreakBadge";

interface Props extends ViewProps {
  courseId: SupportedLanguageCode;
}

export function CourseDetailsBar({ courseId, style, ...props }: Props) {
  const { currentStreak } = useStreak();
  const { primary } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }),
    ]).start();
  };

  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: layouts.padding,
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          paddingHorizontal: layouts.padding,
          paddingVertical: layouts.padding * 0.5,
          borderRadius: layouts.pill,
          backgroundColor: "#12344a",
          shadowColor: primary,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            fontSize: 11,
            color: "#8fd8ff",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          English
        </Text>
      </View>

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Pressable onPress={() => console.log("Open streak details")}>
          <StreakBadge streak={currentStreak} />
        </Pressable>
      </Animated.View>

      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: layouts.padding * 0.5,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Pressable onPress={animatePress}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="donut" />
            <Text style={{ fontWeight: "700", fontSize: 14, color: "#eaf6ff" }}>500</Text>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: layouts.padding * 0.5,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Pressable onPress={animatePress}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="heart" />
            <Text style={{ fontWeight: "700", fontSize: 14, color: "#eaf6ff" }}>5</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}