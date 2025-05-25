import { CheckCircle2 } from "lucide-react";

export default function CompletedSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-8 h-8 text-success" />
          <div className="h-8 w-32 bg-background-500 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-background-500 rounded-lg"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-background-500 rounded"></div>
              <div className="h-6 w-6 bg-background-500 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-background-500 rounded"></div>
            <div className="h-4 w-20 bg-background-500 rounded mt-2"></div>
          </div>
        ))}
      </div>

      {/* Completed Tasks List */}
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-background-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-5 w-5 bg-background-500 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-background-500 rounded"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-24 bg-background-500 rounded"></div>
                    <div className="h-3 w-3 bg-background-500 rounded-full"></div>
                    <div className="h-3 w-32 bg-background-500 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-16 bg-background-500 rounded-full"></div>
                <div className="h-8 w-8 bg-background-500 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
