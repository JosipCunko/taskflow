import {
  calcNextPointsMilestone,
  getProgressPercentage,
} from "../_utils/utils";

type StreakBarProps = {
  points: number;
};

export default function StreakBar({ points }: StreakBarProps) {
  const { nextMilestone: currentGoal, currentMilestoneColor } =
    calcNextPointsMilestone(points);

  const percentage = getProgressPercentage(points, currentGoal);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Reward Points</span>
        <span className="font-bold">
          {points} / {currentGoal}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-in-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: currentMilestoneColor,
          }}
        />
      </div>
      <div className="text-xs text-gray-500">
        {currentGoal >= 1000 && points >= 1000 ? (
          <span>
            🏆 Maximum level achieved! You&apos;re a productivity master!
          </span>
        ) : percentage >= 80 ? (
          <span>
            Almost there! {currentGoal - points} points to next milestone.
          </span>
        ) : percentage >= 40 ? (
          <span>You&apos;re making progress! Keep going!</span>
        ) : (
          <span>Complete more tasks to reach {currentGoal} points.</span>
        )}
      </div>
    </div>
  );
}
