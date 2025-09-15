import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../_lib/auth";
import HealthSkeleton from "../../_components/skeleton/HealthSkeleton";
import HealthClientUI from "./HealthClientUI";
import { Heart } from "lucide-react";

export default async function HealthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return (
    <div className="container mx-auto p-2 sm:p-6 max-h-full overflow-auto">
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
        <Suspense fallback={<HealthSkeleton />}>
          <HealthClientUI />
        </Suspense>
      </div>
    </div>
  );
}
