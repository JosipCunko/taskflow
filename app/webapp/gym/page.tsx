import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../_lib/auth";
import GymDashboard from "./GymDashboard";
import Loader from "../../_components/Loader";
import { Dumbbell } from "lucide-react";

export const metadata = {
  title: "Gym Tracking - TaskFlow",
  description: "Track your workouts and monitor your fitness progress",
};

export default async function GymPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  const userId = session.user.id;

  return (
    <div className="container mx-auto p-2 sm:p-6 max-h-full overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
            <Dumbbell className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
            <span className="text-glow">Gym progress tracker</span>
          </h1>
          <p className="text-text-low">
            Track your workouts, monitor progress, and achieve your fitness
            goals
          </p>
        </div>

        <Suspense fallback={<Loader />}>
          <GymDashboard userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
