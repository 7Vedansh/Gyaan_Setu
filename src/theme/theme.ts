import { ViewStyle, TextStyle } from "react-native";

export const theme = {
    colors: {
        primary: "#6C47FF", // Playful Purple/Blue
        secondary: "#FFB800", // Energetic Yellow/Orange
        accent: "#FF6B6B", // Soft Red/Pink
        background: "#F8F9FA", // Soft Paper White
        surface: "#FFFFFF", // Pure White
        text: {
            primary: "#2D3748", // Dark Grey for readability
            secondary: "#718096", // Soft Grey
            inverse: "#FFFFFF",
        },
        status: {
            success: "#48BB78",
            warning: "#ECC94B",
            error: "#F56565",
            info: "#4299E1",
        },
        border: "#E2E8F0",
    },
    typography: {
        fontFamily: {
            heading: "VarelaRound", // Friendly rounded font (need to load this)
            body: "Nunito", // Readable body font (need to load this)
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
        } as ViewStyle,
    },
};

export type Theme = typeof theme;
