import { CourseDetailsBar } from "@/components/course-details-bar";
import { Icon } from "@/components/icons";
import { VoiceAssistant } from "@/components/voice-assistant";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { SupportedLanguageCode } from "@/types";

interface Props {
  courseId: SupportedLanguageCode;
}

export function CourseRightBar({ courseId }: Props) {
  const { border, muted, mutedForeground, secondary, primary } = useTheme();
  return (
    <View
      style={{
        padding: layouts.padding,
        borderLeftWidth: layouts.borderWidth,
        borderLeftColor: border,
        flexShrink: 0,
        gap: layouts.padding,
      }}
    >
      <CourseDetailsBar courseId={courseId} />
      <VoiceAssistant style={{ height: 420 }} />
      <View
        style={{
          borderRadius: layouts.radiusLg,
          borderWidth: layouts.borderWidth,
          borderColor: border,
          padding: layouts.padding * 1.5,
          gap: layouts.padding * 1.5,
          backgroundColor: secondary,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", letterSpacing: -0.2 }}>Daily Quests</Text>
          <Text
            style={{
              color: primary,
              fontWeight: "700",
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            View all
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: layouts.padding }}>
          <Icon name="bolt" size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600" }}>Earn 10 XP</Text>
            <View style={{ flexDirection: "row", gap: layouts.padding * 0.5 }}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <View
                  style={{
                    height: 14,
                    backgroundColor: muted,
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopLeftRadius: layouts.pill,
                    borderBottomLeftRadius: layouts.pill,
                  }}
                >
                  <Text style={{ fontSize: 11, color: mutedForeground, fontWeight: "600" }}>
                    0 / 10
                  </Text>
                </View>
              </View>
              <Icon name="box" size={24} />
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          borderRadius: layouts.radiusLg,
          borderWidth: layouts.borderWidth,
          borderColor: border,
          padding: layouts.padding * 1.5,
          gap: layouts.padding * 1.5,
          backgroundColor: secondary,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            maxWidth: 256,
            letterSpacing: -0.2,
          }}
        >
          Create a profile to save your progress!
        </Text>
        <View style={{ gap: layouts.padding * 0.75 }}>
          <Button>Create a profile</Button>
          <Button variant="outline">Sign in</Button>
        </View>
      </View>
    </View>
  );
}