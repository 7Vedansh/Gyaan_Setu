import React from "react";
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "./Text";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
}

export const Input = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerStyle,
    style,
    ...props
}: InputProps) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text variant="label" style={styles.label}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    error ? styles.errorBorder : null,
                    props.editable === false ? styles.disabled : null,
                ]}
            >
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={theme.colors.text.secondary}
                    cursorColor={theme.colors.primary}
                    {...props}
                />
                {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </View>
            {error ? (
                <Text variant="caption" color={theme.colors.status.error} style={styles.helperText}>
                    {error}
                </Text>
            ) : helperText ? (
                <Text variant="caption" color={theme.colors.text.secondary} style={styles.helperText}>
                    {helperText}
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        marginBottom: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
        color: theme.colors.text.primary,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.md,
        height: 48,
        ...theme.shadows.sm,
    },
    input: {
        flex: 1,
        height: "100%",
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sizes.md,
    },
    errorBorder: {
        borderColor: theme.colors.status.error,
    },
    disabled: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    },
    iconLeft: {
        marginRight: theme.spacing.sm,
    },
    iconRight: {
        marginLeft: theme.spacing.sm,
    },
    helperText: {
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
    },
});
