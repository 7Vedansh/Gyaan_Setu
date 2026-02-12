import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { changeColorOpacity } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";

export interface ButtonProps extends PressableProps {
  children?: React.ReactNode;
  variant?: Variant;
  viewStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  children,
  variant = "default",
  viewStyle,
  textStyle,
  ...props
}: ButtonProps) {
  const { foreground, primaryForeground, mutedForeground, accentForeground } =
    useTheme();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isJustText = typeof children === "string";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 7,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 100,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {({ pressed, hovered }) => (
        <Animated.View
          style={[
            useThemedStyles({
              variant,
              pressed,
              hovered,
              disabled: props.disabled,
            }),
            { transform: [{ scale: scaleAnim }] },
            viewStyle,
          ]}
        >
          {isJustText ? (
            <Text
              style={[
                {
                  fontWeight: "800",
                  color: hovered ? accentForeground : foreground,
                  fontSize: 18,
                  letterSpacing: 0.5,
                },
                variant === "default" && { color: primaryForeground },
                props.disabled && { color: mutedForeground },
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

const useThemedStyles = ({
  variant,
  hovered,
  pressed,
  disabled,
}: {
  variant: Variant;
  pressed: boolean;
  hovered: boolean;
  disabled?: boolean | null;
}) => {
  const { background, border, primary, accent, muted, accentForeground } =
    useTheme();

  const styles = StyleSheet.create({
    common: {
      backgroundColor: background,
      alignItems: "center",
      paddingVertical: layouts.padding,
      paddingHorizontal: layouts.padding,
      borderRadius: layouts.radius,
      minHeight: 52, // Larger touch targets for children
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    default: {
      backgroundColor:
        hovered || pressed ? changeColorOpacity(primary, 0.85) : primary,
    },
    outline: {
      borderWidth: layouts.borderWidth,
      borderColor: border,
      backgroundColor: hovered || pressed ? accent : colors.transparent,
    },
    ghost: {
      backgroundColor:
        pressed || hovered
          ? changeColorOpacity(accentForeground, 0.1)
          : colors.transparent,
    },
  });

  const variantStyles =
    variant === "default"
      ? styles.default
      : variant === "outline"
      ? styles.outline
      : variant === "ghost"
      ? styles.ghost
      : {};

  const themedStyles = {
    ...styles.common,
    ...variantStyles,
    ...(disabled && { backgroundColor: muted }),
  };
  return themedStyles;
};