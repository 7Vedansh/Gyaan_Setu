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
      icon: "brain",
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
      label: "QUIZ",
      href: "/quiz",
    },
    {
      icon: "boxs",
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
    {
      icon: "brain",
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
      label: "QUIZ",
      href: "/quiz",
    },
    {
      icon: "profile",
      label: "PROFILE",
      href: "/profile",
    },
  ],
};
