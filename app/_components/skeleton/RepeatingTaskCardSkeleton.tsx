import Bone from "./Bone";

export default function RepeatingTaskCardSkeleton() {
  return (
    <div className="p-3 rounded-xl shadow-md border-l-4 border border-divider bg-background-600 flex flex-col justify-between h-full">
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-background-500/40">
              <Bone className="w-5 h-5 rounded" />
            </div>
            <Bone className="h-4 w-28 rounded" />
          </div>
          <Bone className="w-8 h-8 rounded-md shrink-0" />
        </div>

        <div className="flex items-center mb-1.5">
          <Bone className="w-3 h-3 rounded mr-1.5" />
          <Bone className="h-3 w-40 rounded" />
        </div>

        <Bone className="w-full h-1.5 rounded-full mb-2" />
        <div className="flex justify-end mb-1">
          <Bone className="h-3 w-16 rounded" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-md bg-background-500/30">
          <Bone className="w-3.5 h-3.5 rounded" />
          <Bone className="h-3 w-14 rounded" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-divider/30">
        <div className="flex items-center gap-1">
          <Bone className="w-3 h-3 rounded" />
          <Bone className="h-3 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}
