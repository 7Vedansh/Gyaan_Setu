import { ViewStyle, TextStyle } from "react-native";

export const theme = {
    colors: {
        primary: "#8B5CF6",       // Violet 500
        primaryLight: "#A78BFA",
        primaryDark: "#7C3AED",
        secondary: "#8b15faff",     // Soft yellow accent
        accent: "#EC4899",        // Soft pink highlight

        background: "#1E293B",    // Slate 800
        surface: "#263244",       // Custom Slate Surface

        text: {
            primary: "#F8FAFC",     // Slate 50
            secondary: "#CBD5E1",   // Slate 300
            inverse: "#0B1120",
        },

        // Compatibility aliases
        foreground: "#F9FAFB",    // Same as text.primary
        primaryForeground: "#F9FAFB",
        secondaryForeground: "#0B1120",
        muted: "#1F2937",
        mutedForeground: "#9CA3AF",
        accentForeground: "#0B1120",

        destructive: "#EF4444",
        destructiveForeground: "#F9FAFB",
        sucess: "#22C55E",
        sucessForeground: "#F9FAFB",

        status: {
            success: "#22C55E",
            warning: "#FACC15",
            error: "#EF4444",
            info: "#3B82F6",
        },

        border: "#334155",
    },

    typography: {
        fontFamily: {
            heading: "NunitoExtraBold", // Duolingo-style bold headings
            body: "Nunito", // Readable body font
        },
        sizes: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
        },
        weights: {
            regular: "400",
            medium: "500",
            bold: "700",
            black: "900",
        } as const,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        huge: 40,
    },
    radius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        round: 9999,
    },
    shadows: {
        sm: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        } as ViewStyle,
        md: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        } as ViewStyle,
        lg: {
            shadowColor: "#7C3AED",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
        } as ViewStyle,

    },
};

export type Theme = typeof theme;
