import { CardSpecificIcons } from "./icons";
import {
  ListChecks,
  Tags,
  BellRing,
  BarChart3,
  Sparkles,
  Rocket,
} from "lucide-react";

export const stats = [
  {
    icon: CardSpecificIcons.User,
    value: 1,
    label: "Active Users",
    suffix: "",
  },
  {
    icon: CardSpecificIcons.MarkComplete,
    value: 460,
    label: "Total tasks Created",
    suffix: "+",
  },
  {
    icon: CardSpecificIcons.Time,
    value: 7200,
    label: "Tasks reviewed",
    suffix: "",
  },
  {
    icon: CardSpecificIcons.Priority,
    value: 100,
    label: "Reliability",
    suffix: "%",
  },
];

export const images = [
  {
    src: "/addTask.png",
    alt: "A user adds a new task to their list in the TaskFlow application.",
    title: "Add New Task",
    category: "Management",
  },
  {
    src: "/calendar.png",
    alt: "A user views their calendar in the TaskFlow application.",
    title: "View Your Calendar",
    category: "Planning",
  },
  {
    src: "/customizeTask.png",
    alt: "A user customizes a task, setting a due date and duration.",
    title: "Customize Your Tasks",
    category: "Customization",
  },
  {
    src: "/profile.png",
    alt: "The user profile page, displaying statistics and settings.",
    title: "Manage Your Profile",
    category: "Analytics",
  },
  {
    src: "/tasks2.png",
    alt: "The user tasks page, displaying tasks and settings.",
    title: "Manage Your Tasks",
    category: "Organization",
  },
  {
    src: "/today.png",
    alt: "A user views their tasks for the current day in the TaskFlow application.",
    title: "Tasks for Today",
    category: "Focus",
  },
];

export const features = [
  {
    icon: ListChecks,
    label: "Smart Task Management",
    description:
      "Create tasks with dependencies, enjoy auto-rescheduling for missed items, track statuses (pending, completed, delayed), and earn experience points for completion.",
  },
  {
    icon: Tags,
    label: "Advanced Tagging & Customization",
    description:
      "Organize with custom tags (e.g., morning routine, gym), a versatile color palette, priority focus tags, and a wide selection of task icons.",
  },
  {
    icon: BellRing,
    label: "Intelligent Reminders",
    description:
      "Set flexible reminders with snooze functionality and multiple dismiss options to stay on top of your schedule effortlessly.",
  },
  {
    icon: BarChart3,
    label: "Progress Tracking & Analytics",
    description:
      "Monitor your consistency with streak visuals, earn reward points, and view detailed performance metrics like completion rates and delay statistics on your dashboard.",
  },
  {
    icon: Sparkles,
    label: "Seamless User Experience",
    description:
      "Enjoy a modern, eye-friendly dark theme, fully responsive design for all devices, intuitive navigation, and smooth loading states for a delightful experience.",
  },
  {
    icon: Rocket,
    label: "Optimized & Modern Tech",
    description:
      "Built with Next.js 15 (App Router), React 19, and Firebase for a fast, scalable, and reliable task management solution with real-time updates.",
  },
];

export const programmingFeatures = [
  {
    title: "Real-time Data Sync",
    tag: "SYS_SYNC",
    imgPath: "/database.png",
  },
  {
    title: "Secure Auth Layer",
    tag: "AUTH_GATE",
    imgPath: "/security.png",
  },
  {
    title: "Dynamic UI Engine",
    tag: "UI_CORE",
    imgPath: "/usage.png",
  },
];
