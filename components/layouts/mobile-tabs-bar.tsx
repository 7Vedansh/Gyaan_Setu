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
        paddingHorizontal: layouts.padding,
        paddingVertical: layouts.padding * 0.75,
        borderTopWidth: layouts.borderWidth,
        borderTopColor: border,
        backgroundColor: background,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
        elevation: 1,
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

function MobileTabItem({ navItem, isActive }: TabItemProps) {
  const { border, accent, foreground } = useTheme();
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
            borderColor: isActive ? border : colors.transparent,
            backgroundColor:
              pressed || hovered || isActive ? accent : colors.transparent,
            transform: [{ scale: scaleAnim }],
            shadowColor: "#000",
            shadowOpacity: isActive ? 0.04 : 0,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: isActive ? 1 : 0,
          }}
        >
          <Icon
            name={navItem.icon}
            color={isActive ? foreground : undefined}
          />
        </Animated.View>
      )}
    </Pressable>
  );
}
