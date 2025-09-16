import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../_lib/auth";
import GymDashboard from "./GymDashboard";
import Loader from "../../_components/Loader";

export const metadata = {
  title: "Gym Tracking - TaskFlow",
  description: "Track your workouts and monitor your fitness progress",
};

export default async function GymPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  
  const userId = session.user.id;

  return (
    <div className="h-full overflow-auto bg-background-625 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-high mb-2">
            Gym Tracking
          </h1>
          <p className="text-text-medium">
            Track your workouts, monitor progress, and achieve your fitness goals
          </p>
        </div>
        
        <Suspense fallback={<Loader />}>
          <GymDashboard userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}