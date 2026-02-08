import { Section } from "@/types/course";

import { chapterOne } from "./chapters/1";

export const sectionOne: Section = {
  id: 1,
  title: {
    en: "Section 1: Rookie",
  },
  chapters: [chapterOne],
};
