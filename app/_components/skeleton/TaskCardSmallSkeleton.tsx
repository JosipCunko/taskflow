export default function TaskCardSmallSkeleton() {
  return (
    <li className="group relative overflow-hidden list-none animate-pulse">
      {/* Animated gradient background overlay skeleton */}
      <div className="absolute inset-0 bg-background-500/10 rounded-xl" />

      {/* Main card container skeleton */}
      <div className="relative bg-gradient-to-br from-background-700 via-background-650 to-background-600 backdrop-blur-sm border border-background-500/50 rounded-xl p-5 shadow-lg">
        {/* Decorative top accent line skeleton */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-background-500" />

        {/* Header section with time and icon */}
        <div className="flex items-start justify-between mb-4">
          {/* Time display skeleton */}
          <div className="flex flex-col items-start">
            <div className="bg-background-800/80 px-3 py-2 rounded-lg border border-background-500/50 min-w-[85px] text-center">
              <div className="space-y-1">
                <div className="h-4 w-12 bg-background-500 rounded mx-auto" />
                <div className="w-4 h-px bg-background-500 mx-auto opacity-60" />
                <div className="h-4 w-12 bg-background-500 rounded mx-auto" />
              </div>
            </div>
          </div>

          {/* Task icon skeleton */}
          <div className="relative">
            <div className="p-3 rounded-xl shadow-md border border-background-500/30 backdrop-blur-sm bg-background-600">
              <div className="w-6 h-6 bg-background-500 rounded" />
            </div>

            {/* Floating notification dot skeleton */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-background-500" />
          </div>
        </div>

        {/* Task title skeleton */}
        <div className="mb-4">
          <div className="h-5 w-3/4 bg-background-500 rounded" />
        </div>

        {/* Status and feature badges skeleton */}
        <div className="flex flex-wrap gap-2">
          {/* Status badge skeleton */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-600 border border-background-500/30">
            <div className="w-3.5 h-3.5 bg-success rounded" />
            <div className="h-3 w-12 bg-success rounded" />
          </div>

          {/* Priority badge skeleton */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30">
            <div className="w-3.5 h-3.5 bg-orange-500/50 rounded" />
            <div className="h-3 w-12 bg-orange-500/50 rounded" />
          </div>

          {/* Reminder badge skeleton */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-600 border border-background-500/30">
            <div className="w-3.5 h-3.5 bg-purple-500 rounded" />
            <div className="h-3 w-12 bg-purple-500 rounded" />
          </div>
        </div>

        {/* Subtle bottom glow effect skeleton */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-2 opacity-50 bg-gradient-to-r from-transparent via-background-500 to-transparent" />
      </div>
    </li>
  );
}
