import { ViewStyle, TextStyle } from "react-native";

export const theme = {
    colors: {
        primary: "#7C3AED",       // Purple 600
        primaryLight: "#9333EA",  // Purple 500
        primaryDark: "#6D28D9",
        secondary: "#22C55E",     // Green 500 (Online Dot)
        accent: "#9333EA",        // Accent for glow

        background: "#0F172A",    // Deep Slate (User request)
        backgroundGradient: ["#0F172A", "#1E293B"], // Gradient (User request)
        surface: "#1E293B",       // Surface (User request)
        surfaceDark: "#1F2937",   // Chat AI Bubble (User request)
        surfaceHover: "#334155",

        text: {
            primary: "#F8FAFC",     // Slate 50
            secondary: "#94A3B8",   // Slate 400
            inverse: "#FFFFFF",
        },

        // Compatibility aliases
        foreground: "#F8FAFC",
        primaryForeground: "#FFFFFF",
        secondaryForeground: "#FFFFFF",
        muted: "#1E293B",
        mutedForeground: "#64748B",
        accentForeground: "#FFFFFF",

        destructive: "#EF4444",
        destructiveForeground: "#F9FAFB",
        sucess: "#22C55E",
        sucessForeground: "#F9FAFB",

        status: {
            success: "#22C55E",
            warning: "#F59E0B",
            error: "#EF4444",
            info: "#0EA5E9",
        },

        border: "rgba(255, 255, 255, 0.08)", // Soft border (User request)
        glassBorder: "rgba(255, 255, 255, 0.12)",
        divider: "rgba(255, 255, 255, 0.04)",
        glow: "rgba(124, 58, 237, 0.4)", // Accent Glow (User request)
    },

    typography: {
        fontFamily: {
            heading: "NunitoExtraBold",
            body: "Nunito",
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
            medium: "500", // Chat text (User request)
            semibold: "600", // Headings (User request)
            bold: "700",
            black: "900",
        } as const,
        lineHeight: 1.5, // Increased line height (User request)
        letterSpacing: {
            title: 0.5, // Slight letter spacing for AI title (User request)
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        huge: 48,
    },
    radius: {
        xs: 6,
        sm: 10,
        md: 14,
        lg: 20,
        xl: 28,
        round: 9999,
    },
    shadows: {
        sm: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        } as ViewStyle,
        md: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
        } as ViewStyle,
        lg: {
            shadowColor: "#6366F1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
        } as ViewStyle,
    },
};

export type Theme = typeof theme;
