import React from "react";
import { StyleSheet, ViewStyle, View } from "react-native";
import { MotiView } from "moti";
import { theme } from "@/theme/theme";

interface CardProps {
    children: React.ReactNode;
    variant?: "elevated" | "outlined" | "flat";
    padding?: keyof typeof theme.spacing;
    style?: ViewStyle;
    animate?: boolean;
}

export const Card = ({
    children,
    variant = "elevated",
    padding = "md",
    style,
    animate = false,
}: CardProps) => {
    const getStyle = () => {
        switch (variant) {
            case "elevated":
                return styles.elevated;
            case "outlined":
                return styles.outlined;
            case "flat":
                return styles.flat;
            default:
                return styles.elevated;
        }
    };

    const containerStyle = [
        styles.container,
        getStyle(),
        { padding: theme.spacing[padding] },
        style,
    ];

    if (animate) {
        return (
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500 }}
                style={containerStyle}
            >
                {children}
            </MotiView>
        );
    }

    return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
    },
    elevated: {
        ...theme.shadows.md,
    },
    outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    flat: {
        backgroundColor: theme.colors.background,
    },
});
