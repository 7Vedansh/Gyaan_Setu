import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, useWindowDimensions } from "react-native";

import { Container } from "@/components/container";
import { MAIN_HEADER_HEIGHT } from "@/components/layouts/main-header";
import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/button";
import { layouts } from "@/constants/layouts";
import { getCommonTranslation } from "@/content/translations";
import { useBreakpoint } from "@/context/breakpoints";
import { DEFAULT_LANGUAGE_CODE } from "@/constants/default";
import { useTheme } from "@/context/theme";

export default function Home() {
  const breakpoint = useBreakpoint();
  const language = DEFAULT_LANGUAGE_CODE;
  const screen = useWindowDimensions();
  const { primary, mutedForeground } = useTheme();

  return (
    <>
      <Metadata />
      <View style={{ flex: 1 }}>
        <Container>
          <ScrollView
            contentContainerStyle={{
              minHeight: screen.height - MAIN_HEADER_HEIGHT,
              padding:
                breakpoint === "sm" ? layouts.padding : layouts.padding * 2,
            }}
            showsVerticalScrollIndicator={false}
          >
            {breakpoint === "sm" ? (
              <View style={{ flex: 1, gap: layouts.padding * 2 }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <View>
                    <Image
                      source="https://www.svgrepo.com/show/493363/conversation-person.svg"
                      alt="Learning English"
                      contentFit="contain"
                      style={{ width: "100%", aspectRatio: 1 }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "700",
                      textAlign: "center",
                      color: primary,
                      lineHeight: 40,
                      letterSpacing: -0.3,
                    }}
                  >
                    {getCommonTranslation("landingPageContent", language)}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      color: mutedForeground,
                      marginTop: layouts.padding * 0.75,
                      fontSize: 15,
                      lineHeight: 22,
                    }}
                  >
                    Build English STEM confidence with bite-sized lessons.
                  </Text>
                </View>
                <View
                  style={{
                    gap: layouts.padding * 0.75,
                  }}
                >
                  <Button onPress={() => router.push("/register")}>
                    {getCommonTranslation("getStarted", language)}
                  </Button>
                  <Button variant="outline">
                    {getCommonTranslation("iAlreadyHaveAnAccount", language)}
                  </Button>
                </View>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: layouts.padding * 2,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <View>
                    <Image
                      source="https://www.svgrepo.com/show/493363/conversation-person.svg"
                      alt="Learning English"
                      contentFit="contain"
                      style={{ width: "100%", aspectRatio: 1 }}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <View style={{ gap: layouts.padding * 1.5 }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "700",
                        textAlign: "center",
                        color: primary,
                        lineHeight: 44,
                        letterSpacing: -0.4,
                      }}
                    >
                      {getCommonTranslation("landingPageContent", language)}
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        color: mutedForeground,
                        fontSize: 16,
                        lineHeight: 24,
                      }}
                    >
                      Build English STEM confidence with bite-sized lessons.
                    </Text>
                    <View
                      style={{
                        gap: layouts.padding * 0.75,
                        width: breakpoint === "md" ? "100%" : 300,
                        marginHorizontal: "auto",
                      }}
                    >
                      <Button onPress={() => router.push("/register")}>
                        {getCommonTranslation("getStarted", language)}
                      </Button>
                      <Button variant="outline">
                        {getCommonTranslation(
                          "iAlreadyHaveAnAccount",
                          language
                        )}
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </Container>
      </View>
    </>
  );
}
