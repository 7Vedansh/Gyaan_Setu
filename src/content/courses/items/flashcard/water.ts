import { FlashCardExercise } from "@/types/course";

export const waterFlashCard: FlashCardExercise = {
  id: 1,
  type: "flashCard",
  question: {
    en: 'इनमें से कौन सा "पानी" है?',
  },
  words: [
    {
      id: 0,
      content: {
        en: "tea",
      },
      image: "https://www.svgrepo.com/show/475139/tea.svg",
    },
    {
      id: 1,
      content: {
        en: "water",
      },
      image: "https://www.svgrepo.com/show/218416/water.svg",
    },
    {
      id: 2,
      content: {
        en: "sushi",
      },
      image: "https://www.svgrepo.com/show/402766/sushi.svg",
    },
    {
      id: 3,
      content: {
        en: "rice",
      },
      image: "https://www.svgrepo.com/show/505200/rice.svg",
    },
  ],
  correctWordId: 1,
};
