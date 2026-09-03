import { Keyboard, PlusCircle, Search as SearchIcon } from "lucide-react";
import Bone from "./Bone";

function NoteCardSkeleton() {
  return (
    <div className="bg-background-650 p-4 rounded-lg shadow-lg border border-transparent flex flex-col justify-between min-h-[200px]">
      <div className="space-y-2 flex flex-col flex-grow">
        <Bone className="h-7 w-3/4 rounded mb-1" />
        <div className="flex-grow mb-2 space-y-2" style={{ maxHeight: "200px" }}>
          <Bone className="h-3 w-full rounded" />
          <Bone className="h-3 w-full rounded" />
          <Bone className="h-3 w-4/5 rounded" />
          <Bone className="h-3 w-3/4 rounded" />
          <Bone className="h-3 w-2/3 rounded" />
        </div>
        <div className="mt-auto pt-2 space-y-2">
          <div className="p-2 bg-background-700 rounded border border-divider">
            <div className="flex flex-wrap gap-4">
              <Bone className="h-3.5 w-16 rounded" />
              <Bone className="h-3.5 w-16 rounded" />
              <Bone className="h-3.5 w-14 rounded" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Bone className="h-3 w-32 rounded" />
            <div className="flex space-x-1">
              <Bone className="h-8 w-8 rounded" />
              <Bone className="h-8 w-8 rounded" />
              <Bone className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotesSkeleton() {
  return (
    <div className="container mx-auto p-1 sm:p-6 pb-8 h-screen">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400">
          My Notes
        </h1>
        <p className="text-text-low mt-1">
          Create and manage your personal notes.
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="relative isolate px-4 py-1 rounded-md flex items-center gap-2 text-sm sm:text-base font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/50">
            <PlusCircle size={18} />
            Add New Note
          </div>
          <div className="relative isolate px-4 py-1 rounded-md flex items-center gap-2 text-sm sm:text-base font-semibold bg-background-500/50 text-text-low border border-primary-500/10">
            <Keyboard size={18} />
            <span className="hidden sm:inline">Shortcuts</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray pointer-events-none" />
            <Bone className="h-10 w-full rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
