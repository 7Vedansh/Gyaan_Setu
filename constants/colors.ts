import { ThemeColors } from "@/types";

export const themeColors: ThemeColors = {
  light: {
    // Primary brand colors - Modern gradient from teal to cyan
    background: "rgb(248, 250, 252)",
    foreground: "rgb(15, 23, 42)",
    primary: "rgb(20, 184, 166)",
    primaryForeground: "rgb(255, 255, 255)",
    
    // Secondary colors - Soft blue tones
    secondary: "rgb(226, 242, 254)",
    secondaryForeground: "rgb(12, 74, 110)",
    
    // Muted/background colors - Neutral grays
    muted: "rgb(241, 245, 249)",
    mutedForeground: "rgb(71, 85, 105)",
    
    // Accent colors - Fresh emerald for highlights
    accent: "rgb(236, 253, 245)",
    accentForeground: "rgb(5, 122, 85)",
    
    // Semantic colors
    destructive: "rgb(254, 226, 226)",
    destructiveForeground: "rgb(190, 24, 93)",
    sucess: "rgb(220, 252, 231)",
    sucessForeground: "rgb(22, 163, 74)",
    border: "rgb(226, 232, 240)",
  },
  dark: {
    background: "rgb(248, 250, 252)",
    foreground: "rgb(15, 23, 42)",
    primary: "rgb(16, 185, 129)",
    primaryForeground: "rgb(255, 255, 255)",
    secondary: "rgb(226, 242, 254)",
    secondaryForeground: "rgb(12, 74, 110)",
    muted: "rgb(241, 245, 249)",
    mutedForeground: "rgb(71, 85, 105)",
    accent: "rgb(236, 253, 245)",
    accentForeground: "rgb(5, 122, 85)",
    destructive: "rgb(254, 226, 226)",
    destructiveForeground: "rgb(190, 24, 93)",
    sucess: "rgb(220, 252, 231)",
    sucessForeground: "rgb(22, 163, 74)",
    border: "rgb(226, 232, 240)",
  },
};

export const colors = {
  transparent: "rgba(0, 0, 0, 0)",
};
