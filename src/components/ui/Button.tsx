import React from "react";
import { StyleSheet, Pressable, ViewStyle, ActivityIndicator, TextStyle } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "./Text";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "default";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
    label?: string;
    children?: React.ReactNode;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: ViewStyle;
    viewStyle?: ViewStyle; // Added for backward compatibility
    textStyle?: TextStyle; // Added for backward compatibility
}

export const Button = ({
    label,
    children,
    onPress,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    style,
    viewStyle,
    textStyle,
}: ButtonProps) => {
    const getBackgroundColor = () => {
        if (disabled) return theme.colors.border;
        switch (variant) {
            case "primary":
            case "default": // Backward compatibility
                return theme.colors.primary;
            case "secondary":
                return theme.colors.secondary;
            case "outline":
            case "ghost":
                return "transparent";
            case "danger":
                return theme.colors.status.error;
            default:
                return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.text.secondary;
        switch (variant) {
            case "primary":
            case "default": // Backward compatibility
            case "danger":
                return theme.colors.text.inverse;
            case "secondary":
                return theme.colors.text.primary;
            case "outline":
            case "ghost":
                return theme.colors.primary;
            default:
                return theme.colors.text.inverse;
        }
    };

    const getBorderColor = () => {
        if (variant === "outline") return disabled ? theme.colors.border : theme.colors.primary;
        return "transparent";
    };

    const getHeight = () => {
        switch (size) {
            case "sm":
                return 32;
            case "md":
                return 48;
            case "lg":
                return 56;
            default:
                return 48;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case "sm":
                return "sm";
            case "md":
                return "md";
            case "lg":
                return "lg";
            default:
                return "md";
        }
    };

    const content = label || children;
    const isStringContent = typeof content === "string";

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === "outline" ? 2 : 0,
                    height: getHeight(),
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                style,
                viewStyle,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {leftIcon && <Text style={{ marginRight: 8 }}>{leftIcon}</Text>}
                    {isStringContent ? (
                        <Text
                            variant="label"
                            color={getTextColor()}
                            style={[
                                {
                                    fontSize: theme.typography.sizes[getFontSize() as keyof typeof theme.typography.sizes],
                                },
                                textStyle,
                            ]}
                        >
                            {content as string}
                        </Text>
                    ) : (
                        content
                    )}
                    {rightIcon && <Text style={{ marginLeft: 8 }}>{rightIcon}</Text>}
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.xl,
        paddingHorizontal: theme.spacing.lg,
        ...theme.shadows.sm,
    },
});
