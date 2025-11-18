import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../_lib/auth";
import ProgressVisualization from "../../../_components/fitness/ProgressVisualization";
import Loader from "../../../_components/Loader";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import Button from "@/app/_components/reusable/Button";

export const metadata = {
  title: "Progress Tracking - TaskFlow",
  description: "Visualize your fitness progress and track personal records",
};

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");

  const userId = session.user.id;

  return (
    <div className="p-1 sm:p-6 pb-8 container mx-auto">
      <div className="mb-6 md:mb-8">
        <Link href="/webapp/fitness">
          <Button variant="secondary">
            <ArrowLeft className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
            <span className="text-glow">Back</span>
          </Button>
        </Link>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Progress tracking</span>
        </h1>

        <p className="text-text-low">
          Stay on top of your tasks with smart notifications and alerts.
        </p>

        <Suspense fallback={<Loader />}>
          <ProgressVisualization userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
