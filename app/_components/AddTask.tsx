"use client";
import {
  useState,
  useMemo,
  useEffect,
  useTransition,
  type ChangeEvent,
  useReducer,
} from "react";
import type { RefAttributes, ForwardRefExoticComponent } from "react";
import type { LucideProps } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  colorsColorPicker,
  errorToast,
  handleToast,
  formatDate,
  MONDAY_START_OF_WEEK,
} from "../_utils/utils";
import { TASK_ICONS, CardSpecificIcons } from "../_utils/icons";
import Button from "./reusable/Button";
import Input from "./reusable/Input";
import AnimatedPlaceholderInput from "./reusable/AnimatedPlaceholderInput";
import Modal, { ModalContext } from "./Modal";
import { createTaskAction } from "../_lib/actions";
import TagInput from "./TagInput";
import { DayOfWeek, RepetitionRule, TaskAnalytics } from "../_types/types";
import SwitchComponent from "./reusable/Switch";
import { preCreateRepeatingTask } from "../_lib/repeatingTasks";
import RepetitionRulesModal from "./RepetitionRules";
import TaskCustomization from "./TaskCustomization";
import { InputGroup } from "./reusable/InputGroup";
import { endOfWeek, startOfWeek } from "date-fns";
import DateInput from "./reusable/DateInput";
import Location from "./Location";
import { trackTaskEvent } from "../_lib/analytics";

export type Action = {
  type: string;
  payload:
    | number[]
    | number
    | string
    | boolean
    | Date
    | DayOfWeek[]
    | ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >
    | string[];
};

interface AddTaskProps {
  onCloseModal?: () => void;
}

const initialState = {
  selectedDate: new Date(),
  startTime: [0, 0],
  endTime: [23, 59],
  isRepeating: false,
  isPriority: false,
  isReminder: false,
  tags: [] as string[],
  duration: [0, 0],
  selectedColor: colorsColorPicker[0],
  selectedIcon: TASK_ICONS[0].icon,
  selectedDaysOfWeek: [] as DayOfWeek[],
  timesPerWeek: 1,
  interval: 1,
  startDate: new Date(),
  location: "",
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

export default function AddTask({ onCloseModal = undefined }: AddTaskProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isPending, startTransition] = useTransition();

  const [activeRepetitionType, setActiveRepetitionType] = useState<
    "interval" | "daysOfWeek" | "timesPerWeek" | "none"
  >("none");
  const [activeTab, setActiveTab] = useState<"Task" | "Customization">("Task");
  const tabs = ["Task", "Customization"];
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const [repetitionModalOpenName, setRepetitionModalOpenName] =
    useState<string>("");
  const openRepetitionModal = (name: string) =>
    setRepetitionModalOpenName(name);
  const closeRepetitionModal = () => setRepetitionModalOpenName("");
  const repetitionModalContextValue = useMemo(
    () => ({
      openName: repetitionModalOpenName,
      open: openRepetitionModal,
      close: closeRepetitionModal,
    }),
    [repetitionModalOpenName]
  );

  const [locationModalOpenName, setLocationModalOpenName] =
    useState<string>("");
  const openLocationModal = (name: string) => setLocationModalOpenName(name);
  const closeLocationModal = () => setLocationModalOpenName("");
  const locationModalContextValue = useMemo(
    () => ({
      openName: locationModalOpenName,
      open: openLocationModal,
      close: closeLocationModal,
    }),
    [locationModalOpenName]
  );

  useEffect(() => {
    if (state.isRepeating) {
      if (activeRepetitionType === "none") {
        setActiveRepetitionType("interval");
      }
      openRepetitionModal("repetition-rules");
    } else {
      setActiveRepetitionType("none");
      if (repetitionModalOpenName === "repetition-rules") {
        closeRepetitionModal();
      }
    }
  }, [state.isRepeating]);

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

  {
    /* !!! Careful */
  }
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
    startTransition(async () => {
      try {
        const title = formData.get("title") as string;
        const endHour = state.endTime[0];
        const endMinute = state.endTime[1];
        if (!title || !state.selectedColor || !state.selectedIcon) {
          throw new Error("Missing some required fields.");
        }

        const baseDueDate = new Date(state.selectedDate);
        baseDueDate.setHours(endHour, endMinute);
        const durationObject = {
          hours: state.duration[0],
          minutes: state.duration[1],
        };
        const taskTimeObject = {
          hour: state.startTime[0],
          minute: state.startTime[1],
        };

        let firstInstanceDueDate: Date | undefined = baseDueDate;
        let repetitionRule: RepetitionRule | undefined;

        if (state.isRepeating && activeRepetitionType !== "none") {
          let argInterval: number | undefined;
          let argTimesPerWeek: number | undefined;
          let argDaysOfWeek: DayOfWeek[] = [];

          switch (activeRepetitionType) {
            case "interval":
              argInterval = state.interval > 0 ? state.interval : undefined;
              break;
            case "timesPerWeek":
              argTimesPerWeek =
                state.timesPerWeek > 0 ? state.timesPerWeek : undefined;
              break;
            case "daysOfWeek":
              argDaysOfWeek = state.selectedDaysOfWeek;
              break;
          }

          const result = preCreateRepeatingTask(
            argInterval,
            argTimesPerWeek,
            argDaysOfWeek,
            baseDueDate,
            state.startDate
          );
          firstInstanceDueDate = result.dueDate as Date;
          repetitionRule = result.repetitionRule;
        }

        const res = await createTaskAction(
          formData,
          state.isPriority,
          state.isReminder,
          state.selectedColor,
          TASK_ICONS.filter((icon) => icon.icon === state.selectedIcon)[0]
            .label,
          firstInstanceDueDate,
          taskTimeObject,
          state.tags,
          durationObject,
          state.isRepeating,
          repetitionRule,
          state.startDate
        );

        handleToast(res, () => {
          if (res.success && res.data) {
            const createdTask = res.data;
            const analyticsData: TaskAnalytics = {
              userId: createdTask.userId,
              taskId: createdTask.id,
              action: "task_created",
              timestamp: new Date(),
              completionTime: undefined,
              dueDate: new Date(createdTask.dueDate),
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

              <ModalContext.Provider value={locationModalContextValue}>
                <Modal.Open opens="location-modal">
                  <Button
                    variant="noStyle"
                    type="button"
                    className="flex gap-3 text-text-gray items-center w-full px-3 py-2 bg-background-600 rounded-md focus:outline-none "
                  >
                    <CardSpecificIcons.Location
                      className="min-w-4 min-h-4"
                      size={16}
                    />
                    <span className="text-left">
                      {state.location || "Add location"}
                    </span>
                  </Button>
                </Modal.Open>
              </ModalContext.Provider>

              <input type="hidden" name="location" value={state.location} />
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
                  dispatch({ type: "isReminder", payload: !state.isReminder })
                }
                className={` ${
                  state.isReminder
                    ? "bg-blue-100 text-blue-800"
                    : "bg-background-500 text-text-low"
                }`}
              >
                <CardSpecificIcons.Reminder size={12} className="mr-1" />
                Reminders
              </Button>
            </div>

            <InputGroup>
              {/* Start Date */}
              <div className="space-y-1">
                <div className="grid grid-cols-[4rem_1fr_min-content] items-center gap-2">
                  <p className="text-sm text-nowrap text-text-low">
                    Starts at:
                  </p>
                  <DateInput
                    date={state.startDate}
                    setDate={(date) =>
                      dispatch({ type: "startDate", payload: date })
                    }
                  >
                    <div className="flex items-center gap-2 rounded-lg px-4 py-3 cursor-pointer">
                      <CardSpecificIcons.DueDate
                        size={20}
                        className="text-text-gray"
                      />
                      <span className="text-text-gray">
                        {formatDate(state.startDate)}
                      </span>
                    </div>
                  </DateInput>

                  {!state.wholeDay && (
                    <div className="flex items-center gap-1 rounded-lg  bg-background-600">
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
                  )}
                </div>
              </div>

              {/* End Date */}
              {!state.isRepeating && (
                <div className="grid grid-cols-[4rem_1fr_min-content] items-center gap-2">
                  <p className="text-sm text-nowrap text-text-low">Ends at:</p>
                  <DateInput
                    date={state.selectedDate}
                    setDate={(date) =>
                      dispatch({ type: "selectedDate", payload: date })
                    }
                  >
                    <div className="flex items-center gap-2 rounded-lg px-4 py-3 cursor-pointer">
                      <CardSpecificIcons.DueDate
                        size={20}
                        className="text-text-gray"
                      />
                      <span className="text-text-gray">
                        {formatDate(state.selectedDate)}
                      </span>
                    </div>
                  </DateInput>

                  {!state.wholeDay && (
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
                            isNaN(newMin)
                              ? 0
                              : Math.max(0, Math.min(59, newMin)),
                          ]);
                        }}
                        className="text-text-gray border-none text-center w-12 py-3 cursor-pointer focus-within:ring-0 focus-within:ring-transparent"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Duration */}
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
                        isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
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
            </InputGroup>

            <div className="flex flex-col gap-1 mt-6 ">
              <SwitchComponent
                id="isRepeating"
                name="isRepeating"
                label="Repeats"
                checked={state.isRepeating}
                onCheckedChange={(checked) => {
                  dispatch({ type: "isRepeating", payload: checked });
                  if (!checked) {
                    setActiveRepetitionType("none");
                  }
                }}
              />
              {state.isRepeating && activeRepetitionType !== "none" && (
                <Button
                  variant="secondary"
                  onClick={() => openRepetitionModal("repetition-rules")}
                  className="text-sm text-primary-500 hover:text-primary-400 text-left w-full"
                >
                  <CardSpecificIcons.Edit size={20} />
                  {activeRepetitionType === "interval" &&
                    `Repeats every ${state.interval} day${
                      state.interval === 1 ? "" : "s"
                    }`}
                  {activeRepetitionType === "daysOfWeek" &&
                    `Repeats on ${
                      state.selectedDaysOfWeek
                        .map(
                          (d) =>
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
                        )
                        .join(", ") || "selected days"
                    }`}
                  {activeRepetitionType === "timesPerWeek" &&
                    `Repeats ${state.timesPerWeek} time${
                      state.timesPerWeek === 1 ? "" : "s"
                    } per week`}
                  {state.startDate &&
                    ` starting ${formatDate(state.startDate)}`}
                </Button>
              )}
              {activeRepetitionType === "timesPerWeek" && (
                <p className="text-sm text-text-gray text-center">
                  Week from{" "}
                  {formatDate(
                    startOfWeek(state.startDate, MONDAY_START_OF_WEEK)
                  )}
                  {" - "}
                  {formatDate(endOfWeek(state.startDate, MONDAY_START_OF_WEEK))}
                </p>
              )}
            </div>

            <InputGroup containerClassName="my-6">
              <TagInput
                id="task-topics"
                tags={state.tags}
                setTags={(tags) => dispatch({ type: "tags", payload: tags })}
              />
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
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adding..." : "Add task"}
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

      <ModalContext.Provider value={repetitionModalContextValue}>
        <Modal.Window name="repetition-rules">
          <RepetitionRulesModal
            dispatch={dispatch}
            activeRepetitionType={activeRepetitionType}
            setActiveRepetitionType={setActiveRepetitionType}
            intervalValue={state.interval}
            timesPerWeekValue={state.timesPerWeek}
            selectedDaysOfWeek={state.selectedDaysOfWeek}
            onDone={closeRepetitionModal}
          />
        </Modal.Window>
      </ModalContext.Provider>

      <ModalContext.Provider value={locationModalContextValue}>
        <Modal.Window name="location-modal">
          <Location
            currentLocation={state.location}
            onLocationSelect={(location) =>
              dispatch({ type: "location", payload: location })
            }
          />
        </Modal.Window>
      </ModalContext.Provider>
    </div>
  );
}
