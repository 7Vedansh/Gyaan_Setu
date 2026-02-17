import { useRef } from "react";
import { Link, router, usePathname } from "expo-router";
import { Animated, Pressable } from "react-native";

import { Icon, Icons, TextLogo } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { useBreakpoint } from "@/context/breakpoints";
import { useTheme } from "@/context/theme";
import { theme } from "@/theme/theme";
import { NavItem } from "@/types";

interface Props {
  navItems: NavItem[];
  appName: string;
}

export function CourseLeftBar({ navItems, appName }: Props) {
  const { border, accent, foreground, primary } = useTheme();
  const breakpoint = useBreakpoint();
  const pathname = usePathname();

  return (
    <View
      style={{
        padding: layouts.padding,
        borderRightWidth: layouts.borderWidth,
        borderRightColor: border,
        gap: layouts.padding,
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
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: 22,
              color: primary,
              letterSpacing: -0.3,
            }}
          >
            {appName}
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


// ... (imports remain)

const sidebarColors: Record<string, string> = {
  learn: "#8B5CF6",
  characters: "#FACC15",
  "parth ai": "#38BDF8",
  leaderboards: "#F97316",
  quiz: "#22C55E",
  target: "#A78BFA",
  quests: "#A78BFA",
  profile: "#60A5FA",
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, opacity: number) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
    : hex;
};

function NavItemComponent({ navItem, pathname }: NavItemProps) {
  const themeContext = useTheme() as any; // renamed to avoid conflict
  const { text } = themeContext;
  const breakpoint = useBreakpoint();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getColor = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("learn")) return sidebarColors.learn;
    if (normalized.includes("char")) return sidebarColors.characters;
    if (normalized.includes("tutor") || normalized.includes("ai") || normalized.includes("parth")) return sidebarColors["parth ai"];
    if (normalized.includes("leader")) return sidebarColors.leaderboards;
    if (normalized.includes("quiz")) return sidebarColors.quiz;
    if (normalized.includes("quest") || normalized.includes("target")) return sidebarColors.target;
    if (normalized.includes("profile")) return sidebarColors.profile;
    return themeContext?.primary || "#8B5CF6"; // Fallback
  };

  const activeColor = getColor(navItem.label);

  const isActive =
    pathname === navItem.href || (pathname.startsWith(navItem.href) && navItem.href !== "/");

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

  // Icon Container Size
  const iconSize = 24; // Standard
  // Icon Badge
  const IconBadge = () => (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: hexToRgba(activeColor, 0.2),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={navItem.icon} color={activeColor} size={22} />
    </View>
  );

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
            gap: 16,
            alignItems: "center",
            paddingHorizontal: 12, // Compact padding inside the item
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: isActive
              ? hexToRgba(activeColor, 0.25)
              : hovered
                ? hexToRgba(activeColor, 0.1)
                : "transparent",
            transform: [{ scale: scaleAnim }],
            marginBottom: 4,
          }}
        >
          <IconBadge />
          {(breakpoint == "xl" || breakpoint == "2xl") && (
            <Text
              style={{
                fontFamily: theme.typography.fontFamily.heading, // "Nunito-ExtraBold" for sidebar items mostly uppercase/bold in Duolingo
                fontSize: 15,
                color: isActive ? activeColor : text?.secondary,
                fontWeight: "800", // ExtraBold
                letterSpacing: 0.5,
                textTransform: "uppercase",
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