import { Link } from "expo-router";

import { Container } from "@/components/container";
import { Text, View, ViewProps } from "@/components/themed";
import { siteConfig } from "@/config/site";
import { layouts } from "@/constants/layouts";
import { useBreakpoint } from "@/context/breakpoints";
import { useTheme } from "@/context/theme";
import { changeColorOpacity } from "@/lib/utils";

export const MAIN_HEADER_HEIGHT = 60;

interface Props extends ViewProps {}

export function MainHeader({ style, ...props }: Props) {
  const { border, accent, accentForeground, background } = useTheme();
  const breakpoint = useBreakpoint();

  return (
    <View
      style={[
        {
          borderBottomWidth: layouts.borderWidth,
          borderBottomColor: border,
          height: MAIN_HEADER_HEIGHT,
          shadowColor: "#000",
          shadowOpacity: 0.02,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
        style,
      ]}
      {...props}
    >
      <Container>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal:
              breakpoint === "sm" ? layouts.padding : layouts.padding * 2,
          }}
        >
          <Link href="/">
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                letterSpacing: -0.3,
              }}
            >
              {siteConfig.name.toLowerCase()}
            </Text>
          </Link>
          <View
            style={{
              paddingHorizontal: layouts.padding,
              paddingVertical: layouts.padding / 2.5,
              borderRadius: layouts.pill,
              backgroundColor: accent,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: accentForeground,
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              English STEM
            </Text>
          </View>
        </View>
      </Container>
    </View>
  );
}
