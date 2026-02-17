import { Platform } from "react-native";

export function isWeb() {
  return Platform.OS === "web";
}

export function changeColorOpacity(color: string, opacity: number): string {
  const validOpacity = Math.min(1, Math.max(0, opacity));

  // HEX format
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");

    const bigint = parseInt(hex, 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${validOpacity})`;
  }

  // rgb() or rgba()
  if (color.startsWith("rgb")) {
    const values = color.match(/\d+/g);

    if (!values || values.length < 3) {
      throw new Error("Invalid RGB color format");
    }

    const [r, g, b] = values;
    return `rgba(${r}, ${g}, ${b}, ${validOpacity})`;
  }

  throw new Error("Unsupported color format");
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}

export function calculatePrecentage(part: number, whole: number) {
  return (part / whole) * 100;
}
