"use client";
import {
  useState,
  useMemo,
  useEffect,
  useTransition,
  type ChangeEvent,
  useReducer,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import { colorsColorPicker, errorToast, handleToast } from "../_utils/utils";
import { TASK_ICONS, CardSpecificIcons } from "../_utils/icons";
import Button from "./reusable/Button";
import AnimatedPlaceholderInput from "./reusable/AnimatedPlaceholderInput";
import { createTaskAction } from "../_lib/actions";
import { TaskAnalytics } from "../_types/types";
import TaskCustomization from "./TaskCustomization";
import { InputGroup } from "./reusable/InputGroup";
import { trackTaskEvent } from "../_lib/analytics";
import Input from "./reusable/Input";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

export type Action = {
  type: string;
  payload:
    | number[]
    | number
    | string
    | boolean
    | Date
    | ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >
    | string[];
};

interface AddTodayTaskProps {
  onCloseModal?: () => void;
}

const initialState = {
  startTime: [0, 0],
  endTime: [23, 59],
  isPriority: false,
  autoDelay: false,
  duration: [0, 0],
  selectedColor: colorsColorPicker[0],
  selectedIcon: TASK_ICONS[0].icon,
  wholeDay: true,
  title: "",
  description: "",
};

const reducer = (state: typeof initialState, action: Action) => {
  if (action.type === "wholeDay") {
    return {
      ...state,
      wholeDay: !state.wholeDay,
      startTime: [0, 0],
      endTime: [23, 59],
    };
  }
  return { ...state, [action.type]: action.payload };
};

export default function AddTodayTask({
  onCloseModal = undefined,
}: AddTodayTaskProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"Task" | "Customization">("Task");
  const tabs = ["Task", "Customization"];
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const isStartTimeSpecified = useMemo(
    () => state.startTime[0] !== 0 || state.startTime[1] !== 0,
    [state.startTime]
  );
  const isDurationSpecified = useMemo(
    () => state.duration[0] !== 0 || state.duration[1] !== 0,
    [state.duration]
  );

  const handleDurationChange = (newDuration: number[]) => {
    dispatch({ type: "duration", payload: newDuration });
    const endTimeDefault = state.endTime[0] === 23 && state.endTime[1] === 59;

    if (isStartTimeSpecified) {
      const totalMinutes =
        state.startTime[0] * 60 +
        state.startTime[1] +
        newDuration[0] * 60 +
        newDuration[1];
      const endHour = Math.floor(totalMinutes / 60) % 24;
      const endMinute = totalMinutes % 60;

      if (endHour === state.startTime[0] && endMinute === state.startTime[1])
        dispatch({ type: "endTime", payload: [23, 59] });
      else dispatch({ type: "endTime", payload: [endHour, endMinute] });
    } else if (!isStartTimeSpecified && !endTimeDefault) {
      const totalMinutes =
        state.endTime[0] * 60 +
        state.endTime[1] -
        newDuration[0] * 60 -
        newDuration[1];
      const startHour = Math.floor(totalMinutes / 60) % 24;
      const startMinute = totalMinutes % 60;
      dispatch({ type: "startTime", payload: [startHour, startMinute] });
    }
  };

  const handleStartTimeChange = (newStartTime: number[]) => {
    dispatch({ type: "startTime", payload: newStartTime });

    const isStartTimeSpecified = newStartTime[0] !== 0 || newStartTime[1] !== 0;
    dispatch({ type: "duration", payload: [0, 0] });

    if (isStartTimeSpecified && isDurationSpecified) {
      const totalMinutes =
        newStartTime[0] * 60 +
        newStartTime[1] +
        state.duration[0] * 60 +
        state.duration[1];
      const endHour = Math.floor(totalMinutes / 60) % 24;
      const endMinute = totalMinutes % 60;
      dispatch({ type: "endTime", payload: [endHour, endMinute] });
    }
  };

  const handleEndTimeChange = (newTimeEnd: number[]) => {
    dispatch({ type: "endTime", payload: newTimeEnd });
    dispatch({ type: "duration", payload: [0, 0] });
  };

  useEffect(() => {
    const isEndTimeDefault = state.endTime[0] === 23 && state.endTime[1] === 59;
    if (!isEndTimeDefault && (state.startTime[0] || state.startTime[1])) {
      const startTotalMinutes = state.startTime[0] * 60 + state.startTime[1];
      const endTotalMinutes = state.endTime[0] * 60 + state.endTime[1];
      let durationMinutes = endTotalMinutes - startTotalMinutes;

      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      const durationHours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;
      dispatch({
        type: "duration",
        payload: [durationHours, remainingMinutes],
      });
    }
  }, [state.endTime, state.startTime]);

  const handleSubmit = async (formData: FormData) => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const title = formData.get("title") as string;
        const endHour = state.endTime[0];
        const endMinute = state.endTime[1];
        if (!title || !state.selectedColor || !state.selectedIcon) {
          throw new Error("Missing some required fields.");
        }

        const today = new Date();
        today.setHours(endHour, endMinute, 0, 0);

        const durationObject = {
          hours: state.duration[0],
          minutes: state.duration[1],
        };
        const taskTimeObject = {
          hour: state.startTime[0],
          minute: state.startTime[1],
        };

        const res = await createTaskAction(
          formData,
          state.isPriority,
          false, // no reminder for today tasks
          state.selectedColor,
          TASK_ICONS.filter((icon) => icon.icon === state.selectedIcon)[0]
            .label,
          today.getTime(), // always today
          taskTimeObject,
          [], // no tags for today tasks
          durationObject,
          false, // no repeating for today tasks
          undefined, // no repetition rule
          today.getTime(), // start date is today
          state.autoDelay
        );

        handleToast(res, () => {
          if (res.success && res.data) {
            const createdTask = res.data;
            const analyticsData: TaskAnalytics = {
              userId: createdTask.userId,
              taskId: createdTask.id,
              action: "task_created",
              timestamp: Date.now(),
              dueDate: createdTask.dueDate,
              isPriority: createdTask.isPriority,
              isReminder: createdTask.isReminder,
              isRepeating: createdTask.isRepeating || false,
              delayCount: createdTask.delayCount,
              risk: createdTask.risk,
              hour: new Date().getHours(),
              points: createdTask.points,
            };
            trackTaskEvent("task_created", analyticsData);
          }
          onCloseModal?.();
        });
      } catch (err) {
        const error = err as Error;
        console.error("Error in handleSubmit:", error);
        errorToast(error.message || "Failed to create task. Please try again.");
      }
    });
  };

  const handleCancel = () => {
    onCloseModal?.();
  };

  return (
    <div className="modal">
      <div className="flex border-b border-background-600 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "Task" | "Customization")}
            className={`relative flex-1 py-3 text-center font-semibold transition-colors duration-150 ${
              activeTab === tab
                ? "text-white"
                : "text-text-low hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary-500"
                layoutId="underline"
              />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeTab === "Task" && (
          <motion.form
            key="task"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            action={handleSubmit}
          >
            <InputGroup className="border-none focus-within:ring-0 focus-within:ring-transparent">
              <AnimatedPlaceholderInput
                type="text"
                id="title"
                name="title"
                value={state.title}
                isFocused={isTitleFocused}
                onBlur={(e) => setIsTitleFocused(e.target.value.length > 0)}
                onChange={(e) => {
                  setIsTitleFocused(true);
                  dispatch({ type: "title", payload: e.target.value });
                }}
                required
              />
            </InputGroup>

            {/* Button tags*/}
            <div className="flex flex-wrap items-center gap-2 my-3 ">
              <Button
                variant="tag"
                onClick={() =>
                  dispatch({ type: "wholeDay", payload: !state.wholeDay })
                }
                className={` ${
                  state.wholeDay
                    ? "bg-green-100 text-green-800"
                    : "bg-background-500 text-text-low"
                }`}
              >
                <CardSpecificIcons.DueDate size={12} className="mr-1" />
                <span className="text-nowrap">Whole day</span>
              </Button>

              <Button
                variant="tag"
                onClick={() =>
                  dispatch({ type: "isPriority", payload: !state.isPriority })
                }
                className={`${
                  state.isPriority
                    ? "bg-red-100 text-red-800"
                    : "bg-background-500 text-text-low"
                }`}
              >
                <CardSpecificIcons.Priority size={12} className="mr-1" />
                Priority
              </Button>

              <Button
                variant="tag"
                onClick={() =>
                  dispatch({ type: "autoDelay", payload: !state.autoDelay })
                }
                className={` ${
                  state.autoDelay
                    ? "bg-purple-100 text-purple-800"
                    : "bg-background-500 text-text-low"
                }`}
              >
                <CardSpecificIcons.DueDate size={12} className="mr-1" />
                Auto delay
              </Button>
            </div>

            <InputGroup>
              {/* Start Time */}
              {!state.wholeDay && (
                <div className="space-y-1">
                  <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
                    <p className="text-sm text-nowrap text-text-low">
                      Starts at:
                    </p>
                    <div className="flex items-center gap-1 rounded-lg bg-background-600">
                      <Input
                        type="number"
                        name="startTimeHour"
                        value={state.startTime[0].toString().padStart(2, "0")}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newHour = parseInt(e.target.value, 10);
                          handleStartTimeChange([
                            isNaN(newHour)
                              ? 0
                              : Math.max(0, Math.min(23, newHour)),
                            state.startTime[1],
                          ]);
                        }}
                        className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                      />
                      <span className="text-text-gray ">:</span>
                      <Input
                        type="number"
                        name="startTimeMinute"
                        value={state.startTime[1].toString().padStart(2, "0")}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newMin = parseInt(e.target.value, 10);
                          handleStartTimeChange([
                            state.startTime[0],
                            isNaN(newMin)
                              ? 0
                              : Math.max(0, Math.min(59, newMin)),
                          ]);
                        }}
                        className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* End Time */}
              {!state.wholeDay && (
                <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
                  <p className="text-sm text-nowrap text-text-low">Ends at:</p>
                  <div className="flex items-center gap-1 ">
                    <Input
                      type="number"
                      name="endTimeHour"
                      value={state.endTime[0].toString().padStart(2, "0")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newHour = parseInt(e.target.value, 10);
                        handleEndTimeChange([
                          isNaN(newHour)
                            ? 0
                            : Math.max(0, Math.min(23, newHour)),
                          state.endTime[1],
                        ]);
                      }}
                      className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                    />
                    <span className="text-text-gray ">:</span>
                    <Input
                      type="number"
                      name="endTimeMinute"
                      value={state.endTime[1].toString().padStart(2, "0")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newMin = parseInt(e.target.value, 10);
                        handleEndTimeChange([
                          state.endTime[0],
                          isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                        ]);
                      }}
                      className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Duration */}
              {!state.wholeDay && (
                <div className="grid grid-cols-[4rem_min-content_1fr] items-center gap-2">
                  <p className="text-sm text-nowrap text-text-low">Duration:</p>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      name="durationHours"
                      value={state.duration[0].toString().padStart(2, "0")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newHour = parseInt(e.target.value, 10);
                        handleDurationChange([
                          isNaN(newHour)
                            ? 0
                            : Math.max(0, Math.min(23, newHour)),
                          state.duration[1],
                        ]);
                      }}
                      className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                    />
                    <span className="text-text-gray ">:</span>
                    <Input
                      type="number"
                      name="durationMinutes"
                      value={state.duration[1].toString().padStart(2, "0")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newMin = parseInt(e.target.value, 10);
                        handleDurationChange([
                          state.duration[0],
                          isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                        ]);
                      }}
                      className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                    />
                  </div>
                  <div></div>
                </div>
              )}
            </InputGroup>

            <InputGroup containerClassName="my-6">
              <textarea
                placeholder="Description"
                name="description"
                value={state.description}
                onChange={(e) =>
                  dispatch({ type: "description", payload: e.target.value })
                }
                className="w-full min-h-24 max-h-24 px-3 py-2 rounded-md focus-within:outline-none placeholder:text-text-gray resize-none"
              />
            </InputGroup>

            <div className="flex justify-between items-center">
              <div></div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Adding..." : "Add today's task"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
        {activeTab === "Customization" && (
          <motion.div
            key="customization"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TaskCustomization
              state={state}
              dispatch={dispatch}
              onCloseTab={() => setActiveTab("Task")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
