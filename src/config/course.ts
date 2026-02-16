import { NavItem } from "@/types";

type CourseConfig = {
  sidebarNavItems: NavItem[];
  mobileNavItems: NavItem[];
};

export const courseConfig: CourseConfig = {
  sidebarNavItems: [
    {
      icon: "home",
      label: "Learn",
      href: "/learn",
    },
    {
      icon: "languageSquare",
      label: "Characters",
      href: "/characters",
    },
    {
      icon: "shieldStar",
      label: "Parth AI",
      href: "/tutor",
    },
    {
      icon: "shieldStar",
      label: "Leaderboards",
      href: "/leaderboards",
    },
    {
      icon: "notebook",
      label: "Quiz",
      href: "/quiz",
    },
    {
      icon: "box",
      label: "Quests",
      href: "/quests",
    },
    {
      icon: "profile",
      label: "Profile",
      href: "/profile",
    },
  ],
  mobileNavItems: [
    {
      icon: "home",
      label: "Learn",
      href: "/learn",
    },
    {
      icon: "shieldStar",
      label: "Parth AI",
      href: "/tutor",
    },
    {
      icon: "shieldStar",
      label: "Leaderboards",
      href: "/leaderboards",
    },
    {
      icon: "notebook",
      label: "Quiz",
      href: "/quiz",
    },
    {
      icon: "profile",
      label: "Profile",
      href: "/profile",
    },
  ],
};
