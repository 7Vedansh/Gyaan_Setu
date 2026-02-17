import { ThemeColors } from "@/types";

import { theme } from "@/theme/theme";

export const themeColors: ThemeColors = {
  light: theme.colors as any, // Enforce dark theme even in light mode
  dark: theme.colors as any,
};

export const colors = {
  transparent: "rgba(0, 0, 0, 0)",
};
