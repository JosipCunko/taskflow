import { CalendarDays, ChevronLeft, ChevronRight, ListChecks, Repeat } from "lucide-react";
import { format } from "date-fns";
import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";
import Bone from "./Bone";
import { formatDate } from "@/app/_utils/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarSkeleton() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const startOffset = firstOfMonth.getDay();
  const todayIndex = startOffset + today.getDate() - 1;

  return (
    <div className="container mx-auto text-text-low p-1 sm:p-6 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <CalendarDays className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">My Calendar</span>
        </h1>
        <p className="text-text-low mt-1 text-sm sm:text-base">
          Manage your schedule and tasks efficiently.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8">
          <div className="lg:col-span-4 bg-background-600 p-3 sm:p-4 rounded-xl shadow-xl flex justify-center items-start relative overflow-x-auto">
            <div className="relative w-[308px] max-w-full mx-auto">
              <div className="flex items-center h-11">
                <span className="font-bold text-lg leading-none">
                  {format(today, "MMMM yyyy")}
                </span>
              </div>
              <div className="absolute top-0 right-0 flex items-center h-11">
                <div className="h-9 w-9 flex items-center justify-center text-primary-400">
                  <ChevronLeft size={18} />
                </div>
                <div className="h-9 w-9 flex items-center justify-center text-primary-400">
                  <ChevronRight size={18} />
                </div>
              </div>

              <div className="grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="h-9 w-11 flex items-center justify-center text-xs font-medium text-text-low/75"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {[...Array(42)].map((_, i) => {
                  const isSelected = i === todayIndex;
                  const isOutside =
                    i < startOffset || i >= startOffset + daysInMonth;
                  return (
                    <div
                      key={i}
                      className="w-11 h-11 flex items-center justify-center"
                    >
                      <div
                        className={`w-[42px] h-[42px] rounded-full flex items-center justify-center ${
                          isSelected ? "ring-2 ring-primary-500" : ""
                        } ${isOutside ? "opacity-40" : ""}`}
                      >
                        <Bone className="h-4 w-4 rounded" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl relative max-h-[370px]">
            <div className="flex items-center mb-4 sm:mb-6">
              <ListChecks className="w-6 h-6 mr-2 text-primary-400" />
              <h2 className="text-xl sm:text-2xl font-semibold text-text-low">
                {format(today, "MMMM do, yyyy")}
              </h2>
            </div>
            <ul className="space-y-3 max-h-[60vh] pr-1">
              {[...Array(2)].map((_, i) => (
                <TaskCardSmallSkeleton key={i} />
              ))}
            </ul>
          </div>
        </div>

        <section className="bg-background-600 p-4 sm:p-6 rounded-xl shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <Repeat className="w-6 h-6 mr-2 text-purple-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold text-text-low">
              Repeating tasks available on {formatDate(today)}
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <TaskCardSmallSkeleton key={i} repeating />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
