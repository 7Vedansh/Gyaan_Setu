import { Lesson } from "@/types/course";

import { exerciseOne } from "./exercises/1";

export const lessonOne: Lesson = {
  id: 1,
  description: {
    en: "Order food",
  },
  exercises: [exerciseOne],
};
