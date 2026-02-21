import { NavItem } from "@/types";

type CourseConfig = {
  sidebarNavItems: NavItem[];
  mobileNavItems: NavItem[];
};

export const courseConfig: CourseConfig = {
  sidebarNavItems: [
    {
      icon: "home",
      label: "LEARN",
      href: "/learn",
    },
    {
      icon: "languageSquare",
      label: "CHARACTERS",
      href: "/characters",
    },
    {
      icon: "targetCircle",
      label: "PARTH AI",
      href: "/tutor",
    },
    {
      icon: "shieldStar",
      label: "LEADERBOARDS",
      href: "/leaderboards",
    },
    {
      icon: "bolt",
      label: "PRACTICE",
      href: "/quiz",
    },
    {
      icon: "box",
      label: "TARGET",
      href: "/quests",
    },
    {
      icon: "profile",
      label: "PROFILE",
      href: "/profile",
    },
  ],
  mobileNavItems: [
    {
      icon: "home",
      label: "LEARN",
      href: "/learn",
    },
    // {
    //   icon: "heart",
    //   label: "ANIMATION",
    //   href: "/animation",
    // },
    {
      icon: "targetCircle",
      label: "PARTH AI",
      href: "/tutor",
    },
    {
      icon: "shieldStar",
      label: "LEADERBOARDS",
      href: "/leaderboards",
    },
    {
      icon: "notebook",
      label: "PRACTICE",
      href: "/quiz",
    },
    {
      icon: "profile",
      label: "PROFILE",
      href: "/profile",
    },
  ],
};