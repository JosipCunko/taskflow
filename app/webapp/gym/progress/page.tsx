import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../_lib/auth";
import ProgressVisualization from "./ProgressVisualization";
import Loader from "../../../_components/Loader";

export const metadata = {
  title: "Progress Tracking - TaskFlow",
  description: "Visualize your fitness progress and track personal records",
};

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  
  const userId = session.user.id;

  return (
    <div className="h-full overflow-auto bg-background-625 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-high mb-2">
            Progress Tracking
          </h1>
          <p className="text-text-medium">
            Visualize your fitness journey and track your personal records
          </p>
        </div>
        
        <Suspense fallback={<Loader />}>
          <ProgressVisualization userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}