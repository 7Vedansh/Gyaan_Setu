import { TranslateExercise } from "@/types/course";

export const sushiPleaseTranslate: TranslateExercise = {
  id: 0,
  type: "translate",
  question: {
    en: "Translate this sentence",
  },
  sentence: {
    content: {
      en: "Sushi, please",
    },
  },
  options: [
    {
      id: 0,
      word: {
        content: {
          en: "tea",
        },
      },
    },
    {
      id: 1,
      word: {
        content: {
          en: "sushi",
        },
      },
    },
    {
      id: 2,
      word: {
        content: {
          en: "please",
        },
      },
    },
    {
      id: 3,
      word: {
        content: {
          en: "water",
        },
      },
    },
  ],
  correctOrderIds: {
    en: [1, 2],
  },
};
