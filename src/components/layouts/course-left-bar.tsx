import { useRef } from "react";
import { Link, router, usePathname } from "expo-router";
import { Animated, Pressable } from "react-native";

import { Icon, Icons, TextLogo } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { useBreakpoint } from "@/context/breakpoints";
import { useTheme } from "@/context/theme";
import { NavItem } from "@/types";

interface Props {
  navItems: NavItem[];
  appName: string;
}

export function CourseLeftBar({ navItems, appName }: Props) {
  const { foreground, primary } = useTheme();
  const breakpoint = useBreakpoint();
  const pathname = usePathname();

  return (
    <View
      style={{
        padding: layouts.padding,
        borderRightWidth: layouts.borderWidth,
        borderRightColor: "#1f3b52",
        gap: layouts.padding,
        backgroundColor: "#0a2233",
      }}
    >
      <Link
        href="/learn"
        style={{
          paddingVertical: layouts.padding,
          paddingLeft: layouts.padding * 2,
        }}
      >
        {breakpoint == "xl" || breakpoint == "2xl" ? (
          <TextLogo size={28} />
        ) : (
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: primary,
              letterSpacing: -0.3,
            }}
          >
            {appName.charAt(0).toLowerCase()}
          </Text>
        )}
      </Link>
      {navItems.map((navItem, index) => (
        <NavItemComponent key={index} navItem={navItem} pathname={pathname} />
      ))}
    </View>
  );
}

interface NavItemProps {
  navItem: NavItem;
  pathname: string;
}

const NAV_ICON_COLORS: Record<string, string> = {
  LEARN: "#ffb020",
  CHARACTERS: "#4cc9ff",
  "PARTH AI": "#8b5cf6",
  LEADERBOARDS: "#facc15",
  PRACTICE: "#22c55e",
  TARGET: "#f97316",
  PROFILE: "#60a5fa",
};

function NavItemComponent({ navItem, pathname }: NavItemProps) {
  const { foreground } = useTheme();
  const breakpoint = useBreakpoint();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isActive =
    pathname === navItem.href || pathname.startsWith(navItem.href);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  return (
    <Pressable
      onPress={() => router.push(navItem.href)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {({ pressed, hovered }) => (
        <Animated.View
          style={{
            flexDirection: "row",
            gap: layouts.padding,
            alignItems: "center",
            paddingHorizontal:
              breakpoint == "xl" || breakpoint == "2xl"
                ? layouts.padding * 1.5
                : layouts.padding,
            paddingVertical: layouts.padding * 0.75,
            borderWidth: layouts.borderWidth,
            borderRadius: layouts.radius,
            borderColor: isActive ? "#3ba5e8" : colors.transparent,
            backgroundColor:
              pressed || hovered || isActive ? "#15374d" : colors.transparent,
            transform: [{ scale: scaleAnim }],
            shadowColor: "#000",
            shadowOpacity: isActive ? 0.05 : 0,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: isActive ? 1 : 0,
          }}
        >
          <Icon
            name={navItem.icon}
            color={isActive ? foreground : NAV_ICON_COLORS[navItem.label] || "#8fd8ff"}
          />
          {(breakpoint == "xl" || breakpoint == "2xl") && (
            <Text
              style={{
                fontWeight: "700",
                fontSize: 14,
                color: "#eaf6ff",
                letterSpacing: -0.2,
              }}
            >
              {navItem.label}
            </Text>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}