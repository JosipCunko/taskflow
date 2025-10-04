"use client";
import { Task } from "@/app/_types/types";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import Modal, { ModalContext } from "./Modal";
import AddTodayTask from "./AddTodayTask";
import { getStartAndEndTime } from "@/app/_utils/utils";
import TaskCardSmall from "./TaskCardSmall";

interface TodayPlanSectionProps {
  todayTasks: Task[];
}

export default function TodayPlanSection({
  todayTasks,
}: TodayPlanSectionProps) {
  const [modalOpenName, setModalOpenName] = useState<string>("");
  const openModal = (name: string) => setModalOpenName(name);
  const closeModal = () => setModalOpenName("");
  const modalContextValue = useMemo(
    () => ({
      openName: modalOpenName,
      open: openModal,
      close: closeModal,
    }),
    [modalOpenName]
  );

  // Filter tasks that need to be completed today and are not completed
  const incompleteTodayTasks = todayTasks.filter(
    (task) => task.status !== "completed"
  );

  // Separate scheduled tasks (with specific times) and whole day tasks
  const { scheduledTasks, wholeDayTasks } = useMemo(() => {
    const scheduled: Task[] = [];
    const wholeDay: Task[] = [];

    incompleteTodayTasks.forEach((task) => {
      const { startTime, endTime } = getStartAndEndTime(task);
      // If task has specific time (not the default 00:00 to 23:59)
      if (startTime !== "00:00" || endTime !== "23:59") {
        scheduled.push(task);
      } else {
        wholeDay.push(task);
      }
    });

    return { scheduledTasks: scheduled, wholeDayTasks: wholeDay };
  }, [incompleteTodayTasks]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate task positions in the grid
  const getTaskPosition = (task: Task) => {
    const { startTime, endTime } = getStartAndEndTime(task);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startPos = startHour + startMinute / 60;
    const endPos = endHour + endMinute / 60;
    const duration = endPos - startPos;

    return { startPos, duration };
  };

  if (incompleteTodayTasks.length === 0) {
    return (
      <div className="bg-background-700 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-6 text-primary-500">
          Today&apos;s Plan
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-text-low mb-4">No plan for today yet</p>
          <ModalContext.Provider value={modalContextValue}>
            <Modal.Open opens="add-today-task">
              <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors">
                <Plus size={20} />
                Create today&apos;s plan
              </button>
            </Modal.Open>
            <Modal.Window name="add-today-task">
              <div className="p-6 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Add Task for Today
                </h2>
                <AddTodayTask onCloseModal={closeModal} />
              </div>
            </Modal.Window>
          </ModalContext.Provider>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-700 p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary-500">
          Today&apos;s Plan
        </h2>
        <ModalContext.Provider value={modalContextValue}>
          <Modal.Open opens="add-today-task">
            <button className="flex items-center gap-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 px-4 py-2 rounded-lg transition-colors">
              <Plus size={16} />
              Add Task
            </button>
          </Modal.Open>
          <Modal.Window name="add-today-task">
            <div className="p-6 max-w-2xl">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Add Task for Today
              </h2>
              <AddTodayTask onCloseModal={closeModal} />
            </div>
          </Modal.Window>
        </ModalContext.Provider>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Time Grid Section */}
        <div className="relative">
          <div className="flex flex-col space-y-0 border border-background-600 rounded-lg overflow-hidden">
            {hours.map((hour) => {
              const tasksInThisHour = scheduledTasks.filter((task) => {
                const { startPos, duration } = getTaskPosition(task);
                return startPos <= hour && startPos + duration > hour;
              });

              return (
                <div
                  key={hour}
                  className="relative flex border-b border-background-600 last:border-b-0"
                  style={{ minHeight: "60px" }}
                >
                  {/* Hour Label */}
                  <div className="w-16 flex-shrink-0 p-2 text-sm text-text-gray border-r border-background-600">
                    {hour.toString().padStart(2, "0")}:00
                  </div>

                  {/* Task Area */}
                  <div className="flex-1 p-2 relative">
                    {tasksInThisHour.map((task) => {
                      const { startPos, duration } = getTaskPosition(task);
                      const isStartHour = Math.floor(startPos) === hour;

                      if (!isStartHour) return null;

                      return (
                        <div
                          key={task.id}
                          className="absolute left-2 right-2 p-2 rounded-md border-l-4 bg-background-600/50"
                          style={{
                            borderLeftColor: task.color,
                            height: `${duration * 60}px`,
                            top: `${(startPos - hour) * 60}px`,
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {task.title}
                            </span>
                            {task.isPriority && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                                Priority
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Whole Day Tasks Section */}
        <div>
          <h3 className="text-md font-semibold text-text-low mb-3">
            Tasks for Today
          </h3>
          {wholeDayTasks.length > 0 ? (
            <div className="space-y-3">
              {wholeDayTasks.map((task) => (
                <TaskCardSmall key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-gray text-sm">
              No whole day tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
