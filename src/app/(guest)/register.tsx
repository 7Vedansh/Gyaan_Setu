import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView } from "react-native";

import { Container } from "@/components/container";
import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { colors } from "@/constants/colors";
import { DEFAULT_LANGUAGE_CODE } from "@/constants/default";
import { layouts } from "@/constants/layouts";
import { getCommonTranslation } from "@/content/translations";
import { useBreakpoint } from "@/context/breakpoints";
import { useCourse } from "@/context/course";
import { useTheme } from "@/context/theme";
import ContentService from "@/services/content.service";
import ApiService from "@/services/api.service";

export default function Register() {
  const { border, accent, background, mutedForeground, primary } = useTheme();
  const breakpoint = useBreakpoint();
  const { setCourseId } = useCourse();
  const [containerWidth, setContainerWidth] = useState(0);
  const languageCode = DEFAULT_LANGUAGE_CODE;
  const languageTiles = [
    {
      name: "English",
      subtitle: "STEM-ready lessons",
      flag: "https://www.svgrepo.com/show/405645/flag-for-flag-united-states.svg",
    },
    {
      name: "Marathi",
      subtitle: "STEM-ready lessons",
      flag: "https://www.svgrepo.com/show/405500/flag-for-flag-india.svg",
    },
  ];

  return (
    <>
      <Metadata title="Register" />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <Container
            style={{
              padding:
                breakpoint === "sm" ? layouts.padding : layouts.padding * 2,
              paddingTop: layouts.padding * 2,
            }}
          >
            <View style={{ gap: layouts.padding * 2 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  textAlign: "center",
                  color: primary,
                }}
              >
                {getCommonTranslation("iWantToLearn", languageCode)}
              </Text>
              <View
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                style={{
                  flexDirection: "row",
                  gap: layouts.padding,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  paddingBottom:
                    breakpoint === "sm" ? layouts.padding : layouts.padding * 2,
                }}
              >
                {languageTiles.map((tile) => (
                  <Pressable
                    key={tile.name}
                    style={{
                      width:
                        containerWidth > 0
                          ? breakpoint === "sm"
                            ? containerWidth
                            : Math.min(containerWidth, 360)
                          : 320,
                    }}
                    onPress={async () => {
                      setCourseId(languageCode);
                      try {
                        const structure = await ApiService.fetchCourseStructure();
                        const language = structure[0];
                        const subject = language?.subjects?.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
                        const firstChapter = subject?.chapters
                          ?.slice()
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

                        if (subject?._id && firstChapter?._id) {
                          await ContentService.downloadFirstChapter(subject._id, firstChapter._id);
                        } else {
                          console.error("[Register] Missing subject/chapter IDs from course-structure");
                        }
                      } catch (error) {
                        console.error("[Register] Failed to fetch course-structure:", error);
                      }

                      router.push("/learn");
                    }}
                  >
                    {({ pressed, hovered }) => (
                      <View
                        style={{
                          padding: layouts.padding * 1.5,
                          borderWidth: layouts.borderWidth,
                          borderColor: border,
                          alignItems: "center",
                          borderRadius: layouts.radiusLg,
                          gap: layouts.padding,
                          backgroundColor: hovered || pressed ? accent : background,
                          transform: pressed ? [{ scale: 0.98 }] : undefined,
                          shadowColor: "#000",
                          shadowOpacity: 0.08,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 5 },
                          elevation: 2,
                        }}
                      >
                        <View
                          style={{
                            width: 120,
                            aspectRatio: 4 / 3,
                            overflow: "hidden",
                            borderRadius: layouts.radiusSm,
                            backgroundColor: colors.transparent,
                            borderWidth: layouts.borderWidth,
                            borderColor: border,
                          }}
                        >
                          <Image
                            source={tile.flag}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </View>
                        <View style={{ alignItems: "center", gap: 6 }}>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "800",
                              color: mutedForeground,
                            }}
                          >
                            {tile.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: mutedForeground,
                            }}
                          >
                            {tile.subtitle}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </Container>
        </ScrollView>
      </View>
    </>
  );
}
