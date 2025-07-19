import { PlusCircle } from "lucide-react";

function NoteCardSkeleton() {
  return (
    <div className="bg-background-650 p-4 rounded-lg shadow-lg flex flex-col justify-between min-h-[200px] animate-pulse">
      <div className="space-y-2 flex flex-col flex-grow">
        {/* Note title skeleton */}
        <div className="h-6 w-3/4 bg-background-500 rounded mb-1"></div>

        {/* Note content skeleton */}
        <div className="flex-grow mb-2 space-y-2">
          <div className="h-3 w-full bg-background-500 rounded"></div>
          <div className="h-3 w-full bg-background-500 rounded"></div>
          <div className="h-3 w-4/5 bg-background-500 rounded"></div>
          <div className="h-3 w-3/4 bg-background-500 rounded"></div>
          <div className="h-3 w-2/3 bg-background-500 rounded"></div>
        </div>

        {/* Footer with date and actions */}
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="h-3 w-24 bg-background-500 rounded"></div>
          <div className="flex space-x-2">
            <div className="h-6 w-6 bg-background-500 rounded"></div>
            <div className="h-6 w-6 bg-background-500 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotesSkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 max-h-full overflow-auto animate-pulse">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400">
          My Notes
        </h1>
        <p className="text-text-low mt-1">
          Create and manage your personal notes.
        </p>
      </div>

      <div>
        {/* Add Note Button skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-background-500 rounded-lg w-fit">
            <PlusCircle size={18} className="text-background-400" />
            <div className="h-4 w-24 bg-background-400 rounded"></div>
          </div>
        </div>

        {/* Notes grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
