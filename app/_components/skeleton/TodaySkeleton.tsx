import { Plus } from "lucide-react";
import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";
import Bone from "./Bone";

export default function TodaySkeleton() {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8 space-y-6">
      <div className="bg-background-700 p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary-500">
            Today&apos;s Plan
          </h2>
          <div className="flex items-center gap-2 bg-primary-500/20 text-primary-400 px-4 py-2 rounded-lg">
            <Plus size={16} />
            Add Task
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="relative">
            <div className="flex flex-col space-y-0 border border-background-600 rounded-lg overflow-hidden">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative flex border-b border-background-600 last:border-b-0"
                  style={{ minHeight: "60px" }}
                >
                  <div className="w-16 shrink-0 p-2 text-sm text-text-gray border-r border-background-600">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  <div className="flex-1 p-2 relative">
                    {hour % 8 === 2 && (
                      <div className="absolute left-2 right-2 sm:p-2 px-2 py-1 rounded-md border-l-4 bg-background-600/50 border-background-500 h-16">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Bone className="h-4 w-28 rounded" />
                          <Bone className="h-5 w-16 rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto">
            <h3 className="text-md font-semibold text-text-low mb-3">
              Tasks for Today
            </h3>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <TaskCardSmallSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
