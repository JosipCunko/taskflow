import Bone from "./Bone";

export default function TaskCardSmallSkeleton({
  repeating = false,
}: {
  repeating?: boolean;
}) {
  return (
    <li className="group relative list-none overflow-hidden">
      <div className="relative bg-gradient-to-br from-background-700/80 via-background-650/80 to-background-600/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-transparent flex flex-col gap-2 justify-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-background-600/80">
            <Bone className="w-[22px] h-[22px] rounded" />
          </div>
          <Bone className="h-5 w-36 max-w-[70%] rounded" />
        </div>

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-background-800/60 border border-background-500/40 w-fit">
          <Bone className="w-3 h-3 rounded" />
          <Bone className="h-3 w-24 rounded" />
        </div>

        {repeating && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-background-800/60 border border-background-500/40 w-fit">
            <Bone className="w-3 h-3 rounded" />
            <Bone className="h-3 w-40 rounded" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-background-500/30 bg-background-600/60">
            <Bone className="w-[13px] h-[13px] rounded" />
            <Bone className="h-3 w-14 rounded" />
          </div>
          {repeating && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-purple-500/15 to-violet-500/15 border border-purple-500/30">
              <Bone className="w-[13px] h-[13px] rounded bg-purple-500/40" />
              <Bone className="h-3 w-16 rounded bg-purple-500/40" />
            </div>
          )}
        </div>

        <Bone className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full" />
      </div>
    </li>
  );
}
