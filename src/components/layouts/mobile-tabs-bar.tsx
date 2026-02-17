import { useRef } from "react";
import { router, usePathname } from "expo-router";
import { Animated, Pressable } from "react-native";

import { Icon } from "@/components/icons";
import { View } from "@/components/themed";
import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { NavItem } from "@/types";

interface Props {
  navItems: NavItem[];
}

export function MobileTabsBar({ navItems }: Props) {
  const pathname = usePathname();
  const { border, accent, foreground, background } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: layouts.padding * 1.5,
        paddingVertical: layouts.padding,
        borderTopWidth: layouts.borderWidth,
        borderTopColor: border,
        backgroundColor: background,
        shadowColor: foreground,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -4 },
        elevation: 4,
      }}
    >
      {navItems.map((navItem, index) => {
        const isActive =
          pathname === navItem.href || pathname.startsWith(navItem.href);
        return (
          <MobileTabItem key={index} navItem={navItem} isActive={isActive} />
        );
      })}
    </View>
  );
}

interface TabItemProps {
  navItem: NavItem;
  isActive: boolean;
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, opacity: number) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
    : hex;
};

// ...

function MobileTabItem({ navItem, isActive }: TabItemProps) {
  const theme = useTheme() as any;
  const { border, accent, foreground, primary, text } = theme;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
            padding: layouts.padding * 0.75,
            borderWidth: layouts.borderWidth,
            borderRadius: layouts.radius,
            borderColor: isActive ? hexToRgba(primary, 0.4) : colors.transparent,
            backgroundColor:
              isActive ? hexToRgba(primary, 0.2) : pressed ? hexToRgba(primary, 0.1) : colors.transparent,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Icon
            name={navItem.icon}
            color={isActive ? primary : text?.secondary}
          />
        </Animated.View>
      )}
    </Pressable>
  );
}