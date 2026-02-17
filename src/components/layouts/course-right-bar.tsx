import { CourseDetailsBar } from "@/components/course-details-bar";
import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { SupportedLanguageCode } from "@/types";

interface Props {
  courseId: SupportedLanguageCode;
}

export function CourseRightBar({ courseId }: Props) {
  const { muted, mutedForeground, primary } = useTheme();
  return (
    <View
      style={{
        padding: layouts.padding,
        borderLeftWidth: layouts.borderWidth,
        borderLeftColor: "#1f3b52",
        flexShrink: 0,
        gap: layouts.padding,
        backgroundColor: "#0a2233",
      }}
    >
      <CourseDetailsBar courseId={courseId} />
      <View
        style={{
          borderRadius: layouts.radiusLg,
          borderWidth: layouts.borderWidth,
          borderColor: "#2a4961",
          padding: layouts.padding * 1.5,
          gap: layouts.padding * 1.5,
          backgroundColor: "#0d283d",
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
          <Text style={{ fontSize: 14, fontWeight: "700", letterSpacing: -0.2, color: "#eaf6ff" }}>Daily Quests</Text>
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
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#eaf6ff" }}>Earn 10 XP</Text>
            <View style={{ flexDirection: "row", gap: layouts.padding * 0.5 }}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <View
                  style={{
                    height: 14,
                    backgroundColor: "#294255",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopLeftRadius: layouts.pill,
                    borderBottomLeftRadius: layouts.pill,
                  }}
                >
                  <Text style={{ fontSize: 11, color: "#d1e8fa", fontWeight: "600" }}>
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
          borderColor: "#2a4961",
          padding: layouts.padding * 1.5,
          gap: layouts.padding * 1.5,
          backgroundColor: "#0d283d",
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
            color: "#eaf6ff",
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