import { History, MessageSquarePlus, Send } from "lucide-react";
import Bone from "./Bone";

export default function AISkeleton() {
  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-col h-full w-full relative overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="text-center mb-8 sm:mb-12 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent drop-shadow-sm">
                What can I help with?
              </h1>
              <p className="text-text-low text-base sm:text-lg">
                Your intelligent AI assistant for tasks, productivity, and
                creative work
              </p>
            </div>

            <div className="w-full max-w-3xl space-y-8 rounded-2xl">
              <div className="relative rounded-2xl bg-background-600/50 p-1">
                <div className="relative rounded-2xl bg-background-600 border border-primary-500/20">
                  <div className="flex flex-col gap-2 p-2">
                    <Bone className="w-full min-h-[120px] rounded-xl" />
                    <div className="flex items-center justify-between gap-2 px-2 pb-2">
                      <Bone className="h-9 w-32 rounded-md" />
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="md:hidden p-2.5 rounded-xl border border-primary-500/30">
                          <History size={18} className="text-primary-300" />
                        </div>
                        <div className="bg-primary-500/50 text-white p-3 rounded-xl">
                          <Send size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {[...Array(4)].map((_, i) => (
                  <Bone
                    key={i}
                    className="h-10 w-40 sm:w-52 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden md:flex md:w-72 h-full shrink-0">
        <div className="flex flex-col h-full w-full min-w-0 overflow-hidden bg-background-700 md:rounded-2xl">
          <div className="p-4 border-b border-background-600">
            <div className="relative isolate px-4 py-1 rounded-md flex items-center justify-center gap-2 text-sm font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/30 w-full">
              <MessageSquarePlus size={18} />
              <span className="font-semibold">New Chat</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="space-y-2 px-1">
              {[60, 40, 70, 50, 65].map((width, i) => (
                <div
                  key={i}
                  className="flex items-center p-3 gap-3 rounded-lg bg-background-600/30"
                >
                  <Bone className="h-4 w-4 rounded-sm shrink-0" />
                  <Bone
                    className="h-4 rounded-md"
                    style={{ width: `${width}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
