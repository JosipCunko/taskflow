"use client";

type StreakBarProps = {
  points: number;
  maxPoints?: number;
};

export default function StreakBar({ points, maxPoints = 100 }: StreakBarProps) {
  // Calculate percentage, ensuring it stays between 0 and 100
  const percentage = Math.min(Math.max((points / maxPoints) * 100, 0), 100);

  // Determine color based on points
  let color = "bg-yellow-400";
  if (points < 0) {
    color = "bg-red-500";
  } else if (points > maxPoints * 0.8) {
    color = "bg-green-500";
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Reward Points</span>
        <span className="font-bold">{points}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        {percentage >= 80 ? (
          <span>Great job! Keep up the good work.</span>
        ) : percentage >= 40 ? (
          <span>You&apos;re making progress!</span>
        ) : (
          <span>Complete more tasks to increase your points.</span>
        )}
      </div>
    </div>
  );
}
