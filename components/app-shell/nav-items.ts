import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  LayoutTemplate,
  UserSquare2,
  ListChecks,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Book", href: "/books/new", icon: PlusCircle },
  { label: "My Books", href: "/books", icon: BookOpen },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Brand Profiles", href: "/brand-profiles", icon: UserSquare2 },
  { label: "Generation Queue", href: "/queue", icon: ListChecks },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];
