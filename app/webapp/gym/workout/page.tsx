import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../_lib/auth";
import WorkoutSession from "./WorkoutSession";
import Loader from "../../../_components/Loader";

export const metadata = {
  title: "Workout Session - TaskFlow",
  description: "Track your active workout session",
};

interface WorkoutPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function WorkoutPage({ searchParams }: WorkoutPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  
  const userId = session.user.id;
  const resolvedSearchParams = await searchParams;
  const workoutId = resolvedSearchParams.id;

  return (
    <div className="h-full overflow-auto bg-background-625 p-4">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<Loader />}>
          <WorkoutSession userId={userId} workoutId={workoutId} />
        </Suspense>
      </div>
    </div>
  );
}