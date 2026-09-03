import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Inbox,
  RefreshCw,
  Search as SearchIcon,
  Trophy,
} from "lucide-react";
import Bone from "./Bone";

const FILTERS = [
  { label: "All", icon: Bell },
  { label: "Unread", icon: Bell },
  { label: "Priority", icon: AlertTriangle },
  { label: "Overdue", icon: Clock },
  { label: "Achievements", icon: Trophy },
];

function NotificationCardSkeleton() {
  return (
    <div className="relative p-4 rounded-lg border border-background-500 bg-background-700">
      <Bone className="absolute top-2 right-2 w-2 h-2 rounded-full" />
      <div className="flex items-start gap-3">
        <Bone className="w-5 h-5 rounded mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Bone className="h-4 w-3/4 rounded" />
            <Bone className="h-4 w-12 rounded shrink-0" />
          </div>
          <Bone className="h-3 w-full rounded mb-2" />
          <Bone className="h-3 w-2/3 rounded mb-3" />
          <div className="flex items-center justify-between">
            <Bone className="h-6 w-20 rounded" />
            <Bone className="h-3 w-16 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Bone className="w-8 h-8 rounded" />
          <Bone className="w-8 h-8 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function InboxSkeleton() {
  return (
    <div className="p-0 sm:p-6 pb-8 container mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Inbox className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Inbox</span>
        </h1>
        <p className="text-text-low mt-2">
          Stay on top of your tasks with smart notifications and alerts.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 pb-2">
            {FILTERS.map((option) => (
              <div
                key={option.label}
                className="relative isolate px-2 sm:px-3 py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold bg-background-500/50 text-text-low border border-primary-500/10 min-w-fit"
              >
                <option.icon size={14} className="sm:w-4 sm:h-4 shrink-0" />
                <span className="whitespace-nowrap">{option.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 sm:max-w-xs relative flex items-center">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray pointer-events-none" />
              <Bone className="h-10 w-full rounded-md" />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Bone className="h-9 w-20 sm:w-24 rounded-lg shrink-0" />
              <div className="relative isolate px-2 sm:px-3 py-2 rounded-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50 min-w-fit">
                <CheckCircle2 size={14} className="sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-background-700 text-text-low rounded-lg text-xs sm:text-sm font-medium min-w-fit">
                <RefreshCw size={14} className="sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Refresh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <NotificationCardSkeleton key={i} />
          ))}
        </div>

        <div className="mt-8 p-4 bg-background-700 rounded-lg">
          <h3 className="text-sm font-medium text-text-low mb-2">
            Notification Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {["Total:", "Unread:", "High Priority:", "Urgent:"].map((label) => (
              <div key={label}>
                <span className="text-text-low">{label}</span>
                <Bone className="inline-block ml-2 h-4 w-6 rounded align-middle" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
