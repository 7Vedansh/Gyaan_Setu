import { Chapter } from "@/types/course";

import { lessonOne } from "./lessons/1";

export const chapterOne: Chapter = {
  id: 1,
  title: {
    en: "Unit 1",
  },
  description: {
    en: "Order food, describe people",
  },
  lessons: [lessonOne, lessonOne, lessonOne, lessonOne, lessonOne],
};
