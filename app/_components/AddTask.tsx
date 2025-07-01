"use client";
import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useTransition,
  type ChangeEvent,
} from "react";
import type { RefAttributes, ForwardRefExoticComponent } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { isSameDay } from "date-fns";

import ColorPicker from "./ColorPicker";
import {
  colorsColorPicker,
  errorToast,
  handleToast,
  formatDate,
} from "../_utils/utils";
import { TASK_ICONS, CardSpecificIcons } from "../_utils/icons";
import Button from "./reusable/Button";
import IconPicker from "./IconPicker";
import DatePicker from "./DatePicker";
import Input from "./reusable/Input";
import AnimatedPlaceholderInput from "./reusable/AnimatedPlaceholderInput";
import Modal, { ModalContext } from "./Modal";
import { createTaskAction } from "../_lib/actions";
import TagInput from "./TagInput";
import { DayOfWeek } from "../_types/types";
import SwitchComponent from "./reusable/Switch";
import { preCreateRepeatingTask } from "../_lib/repeatingTasks";
import RepetitionRulesModal from "./RepetitionRulesModal";

interface AddTaskProps {
  onCloseModal?: () => void;
}

interface InjectedShowMoreTriggerButtonProps {
  opens: string;
  onClick?: () => void;
}
const ShowMoreTriggerButton = ({
  opens,
  onClick,
}: InjectedShowMoreTriggerButtonProps) => {
  const context = useContext(ModalContext);
  const isOpen = context ? context.openName === opens : false;

  return (
    <Button variant="secondary" type="button" onClick={onClick}>
      <span className="text-gray-500">Customize task</span>
      <svg
        className={`w-5 h-5 text-gray-400 transition-transform ${
          isOpen ? "transform rotate-180" : ""
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </Button>
  );
};

const ShowMoreDetailsContent = ({
  selectedColor,
  setSelectedColor,
  selectedIcon,
  setSelectedIcon,
  onCloseModal,
  selectedDate,
  setSelectedDate,
  timeEnd,
  handleTimeEndChange,
  startTime,
  handleStartTimeChange,
  isRepeatingTask,
  setDuration,
}: {
  selectedColor: string;
  setSelectedColor: (s: string) => void;
  selectedIcon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  setSelectedIcon: (
    i: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >
  ) => void;
  onCloseModal?: () => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  timeEnd: number[];
  handleTimeEndChange: (time: number[]) => void;
  startTime: number[];
  handleStartTimeChange: (time: number[]) => void;
  isRepeatingTask: boolean;
  setDuration: (time: number[]) => void;
}) => {
  const handleDone = () => {
    onCloseModal?.();

    const isEndTimeDefault = timeEnd[0] === 23 && timeEnd[1] === 59;
    if (!isEndTimeDefault && (startTime[0] || startTime[1])) {
      const startTotalMinutes = startTime[0] * 60 + startTime[1];
      const endTotalMinutes = timeEnd[0] * 60 + timeEnd[1];
      let durationMinutes = endTotalMinutes - startTotalMinutes;

      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      const durationHours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;
      setDuration([durationHours, remainingMinutes]);
    }
  };

  return (
    <div className="flex flex-col gap-10 p-3 sm:p-6 items-center bg-background-650 rounded-lg  max-h-[85vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-text-high mb-1">
        Customize Task
      </h3>

      <div className="flex flex-col gap-4">
        <ColorPicker
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
        <IconPicker
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
        />
        {!isRepeatingTask && (
          <div className="grid place-items-center">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
        )}

        <div className="flex flex-col gap-1 text-sm mt-4">
          <label className="text-sm text-nowrap font-medium text-text-low">
            Starts at:
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              name="startTimeHour"
              value={startTime[0].toString().padStart(2, "0")}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newHour = parseInt(e.target.value, 10);
                handleStartTimeChange([
                  isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                  startTime[1],
                ]);
              }}
              className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
            />
            <span className="text-text-gray">h</span>
            <Input
              type="number"
              name="startTimeMinute"
              value={startTime[1].toString().padStart(2, "0")}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newMin = parseInt(e.target.value, 10);
                handleStartTimeChange([
                  startTime[0],
                  isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                ]);
              }}
              className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
            />
            <span className="text-text-gray">m</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm mt-4">
          <label className="text-sm font-medium text-text-low text-nowrap">
            Ends at:
          </label>
          <div className="flex items-center gap-2 p-1">
            <Input
              type="number"
              name="endTimeHour"
              value={timeEnd[0].toString().padStart(2, "0")}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newHour = parseInt(e.target.value, 10);
                handleTimeEndChange([
                  isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                  timeEnd[1],
                ]);
              }}
              className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
            />
            <span className="text-text-gray">h</span>
            <Input
              type="number"
              name="endTimeMinute"
              value={timeEnd[1].toString().padStart(2, "0")}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newMin = parseInt(e.target.value, 10);
                handleTimeEndChange([
                  timeEnd[0],
                  isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                ]);
              }}
              className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
            />
            <span className="text-text-gray">m</span>
          </div>
        </div>
      </div>

      <Button onClick={handleDone}>Done</Button>
    </div>
  );
};

export default function AddTask({ onCloseModal = undefined }: AddTaskProps) {
  const [isPending, startTransition] = useTransition();
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeEnd, setTimeEnd] = useState<number[]>([23, 59]);
  const [startTime, setStartTime] = useState<number[]>([0, 0]);

  const [isPriority, setIsPriority] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number[]>([0, 0]);
  const [selectedColor, setSelectedColor] = useState<string>(
    colorsColorPicker[0]
  );
  const [selectedIcon, setSelectedIcon] = useState<
    ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >
  >(TASK_ICONS[0].icon);

  const [isRepeatingTask, setIsRepeatingTask] = useState(false);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState<number>(1);
  const [interval, setInterval] = useState<number>(1);
  const [taskStartDate, setTaskStartDate] = useState<Date>(new Date());
  const [activeRepetitionType, setActiveRepetitionType] = useState<
    "interval" | "daysOfWeek" | "timesPerWeek" | "none"
  >("none");

  const [showMoreOpenName, setShowMoreOpenName] = useState<string>("");
  const openShowMore = (name: string) => setShowMoreOpenName(name);
  const closeShowMore = () => setShowMoreOpenName("");

  const showMoreModalContextValue = useMemo(
    () => ({
      openName: showMoreOpenName,
      open: openShowMore,
      close: closeShowMore,
    }),
    [showMoreOpenName]
  );

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

  useEffect(() => {
    if (isRepeatingTask) {
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
  }, [isRepeatingTask]);

  const isStartTimeSpecified = useMemo(
    () => startTime[0] !== 0 || startTime[1] !== 0,
    [startTime]
  );
  const isDurationSpecified = useMemo(
    () => duration[0] !== 0 || duration[1] !== 0,
    [duration]
  );

  const handleDurationChange = (newDuration: number[]) => {
    setDuration(newDuration);
    const endTimeDefault = timeEnd[0] === 23 && timeEnd[1] === 59;

    if (isStartTimeSpecified) {
      const totalMinutes =
        startTime[0] * 60 + startTime[1] + newDuration[0] * 60 + newDuration[1];
      const endHour = Math.floor(totalMinutes / 60) % 24;
      const endMinute = totalMinutes % 60;

      if (endHour === startTime[0] && endMinute === startTime[1])
        setTimeEnd([23, 59]);
      else setTimeEnd([endHour, endMinute]);
    } else if (!isStartTimeSpecified && !endTimeDefault) {
      const totalMinutes =
        timeEnd[0] * 60 + timeEnd[1] - newDuration[0] * 60 - newDuration[1];
      const startHour = Math.floor(totalMinutes / 60) % 24;
      const startMinute = totalMinutes % 60;
      setStartTime([startHour, startMinute]);
    }
  };

  const handleStartTimeChange = (newStartTime: number[]) => {
    setStartTime(newStartTime);

    const isStartTimeSpecified = newStartTime[0] !== 0 || newStartTime[1] !== 0;
    setDuration([0, 0]);

    if (isStartTimeSpecified && isDurationSpecified) {
      const totalMinutes =
        newStartTime[0] * 60 + newStartTime[1] + duration[0] * 60 + duration[1];
      const endHour = Math.floor(totalMinutes / 60) % 24;
      const endMinute = totalMinutes % 60;
      setTimeEnd([endHour, endMinute]);
    }
  };

  const handleEndTimeChange = (newTimeEnd: number[]) => {
    setTimeEnd(newTimeEnd);
    setDuration([0, 0]);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const title = formData.get("title") as string;
        const endHour = timeEnd[0];
        const endMinute = timeEnd[1];
        if (!title || !selectedColor || !selectedIcon) {
          throw new Error("Missing some required fields.");
        }

        const baseDueDate = new Date(selectedDate);
        baseDueDate.setHours(endHour, endMinute);
        const durationObject = { hours: duration[0], minutes: duration[1] };
        const taskTimeObject = { hour: startTime[0], minute: startTime[1] };

        if (isRepeatingTask && activeRepetitionType !== "none") {
          let argInterval: number | undefined;
          let argTimesPerWeek: number | undefined;
          let argDaysOfWeek: DayOfWeek[] = [];

          switch (activeRepetitionType) {
            case "interval":
              argInterval = interval > 0 ? interval : undefined;
              break;
            case "timesPerWeek":
              argTimesPerWeek = timesPerWeek > 0 ? timesPerWeek : undefined;
              break;
            case "daysOfWeek":
              argDaysOfWeek = selectedDaysOfWeek;
              break;
          }

          const { dueDate: firstInstanceDueDate, repetitionRule } =
            preCreateRepeatingTask(
              argInterval,
              argTimesPerWeek,
              argDaysOfWeek,
              baseDueDate,
              taskStartDate
            );

          const res = await createTaskAction(
            formData,
            isPriority,
            isReminder,
            selectedColor,
            TASK_ICONS.filter((icon) => icon.icon === selectedIcon)[0].label,
            firstInstanceDueDate as Date,
            taskTimeObject,
            tags,
            durationObject,
            true,
            repetitionRule
          );
          handleToast(res, () => {
            onCloseModal?.();
          });
        } else {
          const res = await createTaskAction(
            formData,
            isPriority,
            isReminder,
            selectedColor,
            TASK_ICONS.filter((icon) => icon.icon === selectedIcon)[0].label,
            baseDueDate,
            taskTimeObject,
            tags,
            durationObject,
            false,
            undefined
          );
          handleToast(res, () => {
            onCloseModal?.();
          });
        }
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
    <div className="w-[22rem] sm:w-[26rem] mx-auto px-4 bg-background-700 rounded-2xl shadow">
      <form action={handleSubmit}>
        <div>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-text-low mb-1"
            >
              Task name
            </label>
            <AnimatedPlaceholderInput
              type="text"
              id="title"
              name="title"
              isFocused={isTitleFocused}
              onBlur={(e) => setIsTitleFocused(e.target.value.length > 0)}
              onChange={() => {
                setIsTitleFocused(true);
              }}
              required
            />
          </div>

          <div className="mb-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text-low mb-1"
            >
              Short description (optional)
            </label>
            <Input type="text" placeholder="Description" name="description" />
          </div>
        </div>
        <TagInput
          id="task-topics"
          label="Tags"
          tags={tags}
          setTags={setTags}
          placeholder="e.g. family, gym"
        />
        <div className="flex items-center space-x-2 my-4 ">
          {!isRepeatingTask && (
            <Button
              variant="tag"
              onClick={() => {
                const today = new Date();
                setSelectedDate(
                  isSameDay(today, selectedDate)
                    ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
                    : today
                );
              }}
              className={` ${
                isSameDay(new Date(), selectedDate)
                  ? "bg-green-100 text-green-800"
                  : "bg-background-500 text-text-low"
              }`}
            >
              <Calendar size={16} className="mr-1" />
              Today
            </Button>
          )}

          <Button
            variant="tag"
            onClick={() => setIsPriority(!isPriority)}
            className={`${
              isPriority
                ? "bg-red-100 text-red-800"
                : "bg-background-500 text-text-low"
            }`}
          >
            <span className="mr-1">⚑</span>
            Priority
          </Button>

          <Button
            variant="tag"
            onClick={() => setIsReminder(!isReminder)}
            className={` ${
              isReminder
                ? "bg-blue-100 text-blue-800"
                : "bg-background-500 text-text-low"
            }`}
          >
            <CheckCircle size={16} className="mr-1" />
            Reminders
          </Button>
        </div>
        <ModalContext.Provider value={showMoreModalContextValue}>
          <Modal.Open opens="show-more">
            <ShowMoreTriggerButton opens="show-more" />
          </Modal.Open>

          <Modal.Window name="show-more">
            <ShowMoreDetailsContent
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              timeEnd={timeEnd}
              handleTimeEndChange={handleEndTimeChange}
              startTime={startTime}
              handleStartTimeChange={handleStartTimeChange}
              isRepeatingTask={isRepeatingTask}
              setDuration={setDuration}
            />
          </Modal.Window>
        </ModalContext.Provider>
        <div className="pt-4 ">
          <SwitchComponent
            id="isRepeating"
            name="isRepeating"
            label="Make this a repeating task"
            checked={isRepeatingTask}
            onCheckedChange={(checked) => {
              setIsRepeatingTask(checked);
              if (!checked) {
                setActiveRepetitionType("none");
              }
            }}
          />
          {isRepeatingTask && activeRepetitionType !== "none" && (
            <Button
              variant="secondary"
              onClick={() => openRepetitionModal("repetition-rules")}
              className="mt-2 text-sm text-primary-500 hover:text-primary-400  text-left w-full"
            >
              <CardSpecificIcons.Edit size={20} />
              {activeRepetitionType === "interval" &&
                `Repeats every ${interval} day(s)`}
              {activeRepetitionType === "daysOfWeek" &&
                `Repeats on ${
                  selectedDaysOfWeek
                    .map(
                      (d) =>
                        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
                    )
                    .join(", ") || "selected days"
                }`}
              {activeRepetitionType === "timesPerWeek" &&
                `Repeats ${timesPerWeek} time${
                  timesPerWeek === 1 ? "" : "s"
                } per week`}
              {taskStartDate && ` starting ${formatDate(taskStartDate)}`}
            </Button>
          )}
        </div>

        <ModalContext.Provider value={repetitionModalContextValue}>
          <Modal.Window name="repetition-rules">
            <RepetitionRulesModal
              activeRepetitionType={activeRepetitionType}
              setActiveRepetitionType={setActiveRepetitionType}
              intervalValue={interval}
              setIntervalValue={setInterval}
              timesPerWeekValue={timesPerWeek}
              setTimesPerWeekValue={setTimesPerWeek}
              selectedDaysOfWeek={selectedDaysOfWeek}
              setSelectedDaysOfWeek={setSelectedDaysOfWeek}
              repetitionTaskStartDate={taskStartDate}
              setRepetitionTaskStartDate={setTaskStartDate}
              onDone={closeRepetitionModal}
            />
          </Modal.Window>
        </ModalContext.Provider>

        <div className="mt-3 p-4 bg-background-600 rounded-lg border border-background-500">
          <p className="text-sm text-text-gray text-pretty">
            Specify how long the task takes
          </p>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                name="durationHours"
                value={duration[0].toString().padStart(2, "0")}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newHour = parseInt(e.target.value, 10);
                  handleDurationChange([
                    isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                    duration[1],
                  ]);
                }}
                className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
              />
              <span className="text-text-gray">h</span>
              <Input
                type="number"
                name="durationMinutes"
                value={duration[1].toString().padStart(2, "0")}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newMin = parseInt(e.target.value, 10);
                  handleDurationChange([
                    duration[0],
                    isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                  ]);
                }}
                className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
              />
              <span className="text-text-gray">m</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5">
          <div></div>
          <div className="flex items-center space-x-2">
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
      </form>
    </div>
  );
}
