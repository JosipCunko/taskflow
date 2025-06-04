import FeatureCard from "./FeatureCard";
import {
  Zap,
  ListChecks,
  Tags,
  BellRing,
  BarChart3,
  Sparkles,
  Rocket,
} from "lucide-react";

const FEATURES_LIST = [
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

export default function FeaturesOverview() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background-600">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block p-3 mb-4 bg-primary-500/10 rounded-xl">
            <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-high">
            Features Designed for{" "}
            <span className="text-primary-400">Peak Performance</span>
          </h2>
          <p className="text-text-low mt-4 max-w-xl mx-auto text-base sm:text-lg">
            Everything you need to master your tasks and boost your
            productivity, wrapped in a smart and intuitive interface.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {FEATURES_LIST.map((feature) => (
            <FeatureCard
              key={feature.label}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
