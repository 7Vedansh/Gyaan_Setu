import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";

type TextVariant = "h1" | "h2" | "h3" | "body" | "caption" | "label";

export interface TextProps extends RNTextProps {
    variant?: TextVariant;
    color?: string;
    weight?: keyof typeof theme.typography.weights;
    align?: "left" | "center" | "right";
}

export const Text = ({
    style,
    variant = "body",
    color,
    weight,
    align,
    children,
    ...props
}: TextProps) => {
    const getStyle = () => {
        switch (variant) {
            case "h1":
                return styles.h1;
            case "h2":
                return styles.h2;
            case "h3":
                return styles.h3;
            case "body":
                return styles.body;
            case "caption":
                return styles.caption;
            case "label":
                return styles.label;
            default:
                return styles.body;
        }
    };

    const customStyle = {
        color: color || (variant === "caption" ? theme.colors.text.secondary : theme.colors.text.primary),
        fontWeight: weight ? theme.typography.weights[weight] : undefined,
        textAlign: align,
    };

    return (
        <RNText style={[getStyle(), customStyle, style]} {...props}>
            {children}
        </RNText>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: theme.typography.sizes.xxxl,
        fontWeight: theme.typography.weights.bold,
        lineHeight: 40,
    },
    h2: {
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        lineHeight: 32,
    },
    h3: {
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        lineHeight: 28,
    },
    body: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sizes.md,
        lineHeight: 24,
    },
    caption: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sizes.xs,
        lineHeight: 16,
    },
    label: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.bold,
        lineHeight: 20,
    },
});
