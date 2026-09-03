import { Heart } from "lucide-react";
import HealthSkeleton from "../../_components/skeleton/HealthSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-0 sm:p-6 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
            <Heart className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
            <span className="text-glow">Health</span>
          </h1>
          <p className="text-text-low">
            Track your daily calories and macronutrients to maintain a healthy
            lifestyle
          </p>
        </div>
        <HealthSkeleton />
      </div>
    </div>
  );
}
