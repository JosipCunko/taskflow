import { BarChart4, Clock, CheckCircle2, Home } from "lucide-react";
import { ReactNode } from "react";

export default async function DashboardPage() {
  return (
    <div className="p-6 ">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Home className="w-8 h-8 mr-3 text-primary-500" />
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Today's Tasks"
          value="0/0"
          icon={<Clock className="text-primary" size={24} />}
        />
        <DashboardCard
          title="Completed Tasks"
          value="0"
          icon={<CheckCircle2 className="text-success" size={24} />}
        />
        <DashboardCard
          title="Reward Points"
          value="0"
          icon={<BarChart4 className="text-accent" size={24} />}
        />
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-low">
            Upcoming Tasks
          </h2>
          <span className="text-sm text-text-low">Today & Tomorrow</span>
        </div>
        <div className="bg-background-700 rounded-lg p-6">
          <p className="text-center text-text-low py-8">No upcoming tasks</p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-low text-xl font-semibold">
            Weekly Progress
          </h2>
        </div>
        <div className="bg-background-700 rounded-lg p-6">
          <p className="text-center text-text-low py-8">
            No data available yet
          </p>
        </div>
      </section>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <div className="bg-background-700 rounded-lg p-6 ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-low">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
