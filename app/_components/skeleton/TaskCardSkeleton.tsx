import Bone from "./Bone";

export default function TaskCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg shadow-md border-l-4 border-background-500 flex flex-col h-full">
      <div className="p-4 flex items-start justify-between border-b border-divider">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="p-2.5 rounded-md w-10 h-10 flex items-center justify-center shrink-0 bg-background-600">
            <Bone className="w-5 h-5 rounded" />
          </div>
          <div className="min-w-0 mt-1">
            <Bone className="h-5 w-36 rounded" />
          </div>
        </div>
        <Bone className="w-8 h-8 rounded-md shrink-0 ml-2" />
      </div>

      <div className="p-4 space-y-3 grow">
        <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md w-fit bg-blue-500/10">
          <Bone className="w-3.5 h-3.5 rounded" />
          <Bone className="h-3 w-28 rounded" />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-background-600">
            <Bone className="w-3.5 h-3.5 rounded" />
            <Bone className="h-3 w-16 rounded" />
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-orange-500/10">
            <Bone className="w-3.5 h-3.5 rounded" />
            <Bone className="h-3 w-14 rounded" />
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-background-main/50 border-t border-divider text-xs space-y-1 rounded-b-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Bone className="h-3 w-14 rounded" />
            <Bone className="h-3 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <Bone className="h-3 w-32 rounded" />
            <Bone className="h-3 w-6 rounded" />
          </div>
        </div>
        <div className="flex justify-end">
          <Bone className="h-3 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}
