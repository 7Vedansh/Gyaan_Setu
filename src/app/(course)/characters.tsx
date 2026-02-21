import { useState } from "react";
import { Pressable, ScrollView } from "react-native";

import { Text, View } from "@/components/themed";
import { layouts } from "@/constants/layouts";
import { useCourseContent } from "@/hooks/useCourseContent";
import { useBreakpoint } from "@/context/breakpoints";
import { useCourse } from "@/context/course";
import { useTheme } from "@/context/theme";

export default function Characters() {
  const { courseId } = useCourse();
  const breakpoint = useBreakpoint();
  const { mutedForeground, border, foreground, accent, primary } = useTheme();
  const { course } = useCourseContent();
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  if (!courseId) return null;

  const characters = course.characters[courseId];

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        {characters.map(({ role }, index) => (
          <Pressable
            key={index}
            style={{
              flex: 1,
              paddingBottom: layouts.padding,
              paddingTop:
                breakpoint === "sm"
                  ? layouts.padding
                  : breakpoint === "md"
                    ? layouts.padding * 2
                    : layouts.padding * 3,
              borderBottomWidth: layouts.borderWidth,
              borderBottomColor: activeIndex === index ? primary : border,
            }}
            onPress={() => (activeIndex !== index ? setActiveIndex(index) : {})}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: activeIndex === index ? primary : mutedForeground,
                textAlign: "center",
              }}
            >
              {role}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          padding: breakpoint === "sm" ? layouts.padding : layouts.padding * 2,
          gap: breakpoint === "sm" ? layouts.padding / 2 : layouts.padding,
          justifyContent: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {characters[activeIndex].dialogueItems.map((item, index) => {
          const size =
            breakpoint === "sm"
              ? (containerWidth -
                ((layouts.padding / 2) * 4 + layouts.padding * 2)) /
              5
              : (containerWidth -
                (layouts.padding * 4 + layouts.padding * 2.0079 * 2)) /
              5;

          return (
            <Pressable key={index}>
              {({ pressed }) => (
                <View
                  style={{
                    width: size,
                    height: size,
                    borderWidth: layouts.borderWidth,
                    borderColor: border,
                    borderRadius: layouts.radius,
                    backgroundColor: accent,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: pressed ? [{ scale: 0.97 }] : undefined,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 1,
                  }}
                >
                  <Text
                    style={{ fontSize: 24, fontWeight: "800", color: foreground }}
                  >
                    {item}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
