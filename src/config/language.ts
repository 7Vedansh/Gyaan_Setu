import { Languages, SupportedLanguageCode } from "@/types";

export const languages = {
  en: {
    name: "English",
    flag: "https://www.svgrepo.com/show/405645/flag-for-flag-united-states.svg",
  },
} satisfies Languages;

export function getLanguage(code: SupportedLanguageCode) {
  return languages[code];
}

export const validLanguages: SupportedLanguageCode[] = ["en"];
