"use client";
/*
 dueDate Parameter: You pass dueDate but then overwrite it for timesPerWeek and daysOfWeek with endOfWeek(new Date(), MONDAY_START_OF_WEEK). For interval tasks, you use the passed dueDate. This is a bit inconsistent. The dueDate for the first instance of a repeating task can be a user choice. The subsequent due dates are then calculated.
 */

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
import { format, isSameDay, addMinutes, getHours, getMinutes } from "date-fns";

import ColorPicker from "./ColorPicker";
import {
  colorsColorPicker,
  errorToast,
  handleToast,
  TASK_ICONS,
} from "../utils";
import Button from "./reusable/Button";
import IconPicker from "./IconPicker";
import DatePicker from "./DatePicker";
import Input from "./reusable/Input";
import Modal, { ModalContext } from "./Modal";
import { createTaskAction } from "../_lib/actions";
import TagInput from "./TagInput";
import { DayOfWeek } from "../_types/types";
import Checkbox from "./reusable/Checkbox";
import { preCreateRepeatingTask } from "../_lib/repeatingTasks";
import RepetitionRulesModal from "./RepetitionRulesModal";

interface AddTaskProps {
  onCloseModal?: () => void;
}

interface InjectedShowMoreTriggerButtonProps {
  opens: string;
  onClick?: () => void;
}
const ShowMoreTriggerButton = (props: InjectedShowMoreTriggerButtonProps) => {
  const context = useContext(ModalContext);
  const { opens, onClick } = props;
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
  setTimeEnd,
  startTime,
  setStartTime,
  isRepeatingTask,
  isTimeEndDisabled,
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
  setTimeEnd: (time: number[]) => void;
  startTime: number[];
  setStartTime: (time: number[]) => void;
  isRepeatingTask: boolean;
  isTimeEndDisabled?: boolean;
}) => {
  const handleDone = () => {
    onCloseModal?.();
  };

  return (
    //!!! SEE IF THE DESIGN STILL BREAKS OM MOBILE
    <div className="flex flex-col gap-10 p-6 items-center bg-background-650 rounded-lg max-h-[85vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-text-high mb-1">
        Customize Task
      </h3>
      <div className="flex lg:flex-row flex-col gap-6 md:gap-10 justify-center">
        <div className="flex flex-col gap-4">
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <IconPicker
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
          />
          <div className="flex flex-col gap-1 text-sm mt-4">
            <label className="text-sm text-nowrap font-medium text-text-low">
              Starts at:
            </label>
            <div className="flex items-center gap-2 p-1 ">
              <Input
                type="number"
                name="startTimeHour"
                value={startTime[0].toString().padStart(2, "0")}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newHour = parseInt(e.target.value, 10);
                  setStartTime([
                    isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                    startTime[1],
                  ]);
                }}
                className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="font-bold text-text-medium">:</span>
              <Input
                type="number"
                name="startTimeMinute"
                value={startTime[1].toString().padStart(2, "0")}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newMin = parseInt(e.target.value, 10);
                  setStartTime([
                    startTime[0],
                    isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                  ]);
                }}
                className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {!isRepeatingTask && (
            <div className="flex flex-col gap-1">
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                endTime={timeEnd}
                setEndTime={setTimeEnd}
                timeInputsDisabled={isTimeEndDisabled}
              />
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleDone} variant="primary">
        Done
      </Button>
    </div>
  );
};

export default function AddTask({ onCloseModal = undefined }: AddTaskProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeEnd, setTimeEnd] = useState<number[]>([23, 59]);
  const [startTime, setStartTime] = useState<number[]>([0, 0]);
  const [isTimeEndDisabled, setIsTimeEndDisabled] = useState(false);

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

  const isStartTimeSpecified = useMemo(
    () => startTime[0] !== 0 || startTime[1] !== 0,
    [startTime]
  );
  const isDurationSpecified = useMemo(
    () => duration[0] > 0 || duration[1] > 0,
    [duration]
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

  useEffect(() => {
    if (isDurationSpecified && isStartTimeSpecified) {
      const startDateForCalc = new Date(selectedDate);
      startDateForCalc.setHours(startTime[0], startTime[1], 0, 0);

      const durationTotalMinutes = duration[0] * 60 + duration[1];
      const endDateCalc = addMinutes(startDateForCalc, durationTotalMinutes);

      setTimeEnd([getHours(endDateCalc), getMinutes(endDateCalc)]);
      setIsTimeEndDisabled(true);
    } else {
      setIsTimeEndDisabled(false);
    }
  }, [
    startTime,
    duration,
    selectedDate,
    setTimeEnd,
    isDurationSpecified,
    isStartTimeSpecified,
    setIsTimeEndDisabled,
  ]);

  const handleRepetitionDone = () => {
    if (activeRepetitionType === "none") {
      setIsRepeatingTask(false);
    } else {
      closeRepetitionModal();
    }
  };

  const showMoreModalContextValue = useMemo(
    () => ({
      openName: showMoreOpenName,
      open: openShowMore,
      close: closeShowMore,
    }),
    [showMoreOpenName]
  );

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const title = formData.get("title") as string;
        const endHour = timeEnd[0];
        const endMinute = timeEnd[1];

        if (
          !title ||
          endHour === undefined ||
          endMinute === undefined ||
          !selectedColor ||
          !selectedIcon
        ) {
          throw new Error("Missing some required fields.");
        }

        const baseDueDate = new Date(selectedDate);
        baseDueDate.setHours(endHour, endMinute, 0, 0);

        const durationDetails =
          duration[0] > 0 || duration[1] > 0
            ? { hours: duration[0], minutes: duration[1] }
            : undefined;

        const taskTimeObject = { hour: startTime[0], minute: startTime[1] };

        if (isRepeatingTask && activeRepetitionType !== "none") {
          let argInterval: number | undefined;
          let argTimesPerWeek: number | undefined;
          let argDaysOfWeek: DayOfWeek[] | undefined;

          switch (activeRepetitionType) {
            case "interval":
              argInterval = interval > 0 ? interval : undefined;
              break;
            case "timesPerWeek":
              argTimesPerWeek = timesPerWeek > 0 ? timesPerWeek : undefined;
              break;
            case "daysOfWeek":
              argDaysOfWeek =
                selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : undefined;
              if (!argDaysOfWeek) {
                errorToast(
                  "Please select days for 'Specific Days' repetition or choose a different type."
                );
                setIsRepeatingTask(false);
                setActiveRepetitionType("none");
                return;
              }
              break;
          }

          const repetitionArgs = {
            interval: argInterval,
            timesPerWeek: argTimesPerWeek,
            daysOfWeek: argDaysOfWeek || [],
          };

          const { dueDate: firstInstanceDueDate, repetitionRule } =
            preCreateRepeatingTask(
              repetitionArgs.interval,
              repetitionArgs.timesPerWeek,
              repetitionArgs.daysOfWeek,
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
            durationDetails,
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
            durationDetails,
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
    <div className="w-full max-w-md mx-auto px-4 bg-background-700 rounded-2xl shadow">
      <form action={handleSubmit}>
        <div>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-text-low mb-1"
            >
              Task name
            </label>
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="e.q. Buy barbecue sauce tommorow"
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
        <div className="flex items-center space-x-2 mt-4 mb-6 ">
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
              setTimeEnd={setTimeEnd}
              startTime={startTime}
              setStartTime={setStartTime}
              isRepeatingTask={isRepeatingTask}
              isTimeEndDisabled={isTimeEndDisabled}
            />
          </Modal.Window>
        </ModalContext.Provider>
        <div className="pt-4 ">
          <Checkbox
            id="isRepeating"
            name="isRepeating"
            label="Make this a repeating task"
            checked={isRepeatingTask}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsRepeatingTask(checked);
              if (!checked) {
                setActiveRepetitionType("none");
              }
            }}
          />
          {isRepeatingTask && activeRepetitionType !== "none" && (
            <button
              type="button"
              onClick={() => openRepetitionModal("repetition-rules")}
              className="mt-2 text-sm text-primary-500 hover:text-primary-400 underline text-left w-full"
            >
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
                `Repeats ${timesPerWeek} time(s) per week`}
              {taskStartDate &&
                ` starting ${format(taskStartDate, "MMM d, yyyy")}`}
              <span className="ml-1">(Edit)</span>
            </button>
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
              onDone={handleRepetitionDone}
            />
          </Modal.Window>
        </ModalContext.Provider>

        {!isStartTimeSpecified ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label
                htmlFor="durationHours"
                className="text-sm font-medium text-text-low block mb-1"
              >
                Duration (optional)
              </label>
              <div className="flex items-center gap-2 p-1 ">
                <Input
                  type="number"
                  name="durationHours"
                  value={duration[0].toString().padStart(2, "0")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const newHour = parseInt(e.target.value, 10);
                    setDuration([
                      isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                      duration[1],
                    ]);
                  }}
                  className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="font-bold text-text-medium">:</span>
                <Input
                  type="number"
                  name="durationMinutes"
                  value={duration[1].toString().padStart(2, "0")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const newMin = parseInt(e.target.value, 10);
                    setDuration([
                      duration[0],
                      isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
                    ]);
                  }}
                  className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 text-sm text-text-gray p-3 bg-background-600 rounded-md border border-background-500 flex flex-col gap-3">
            <div>
              <p className="font-medium text-text-medium">
                Duration Input Hidden
              </p>
              <p className="mt-1 text-xs">
                Duration input is hidden because a start time is set. If a
                duration was previously set, it helps calculate the end time.
                Otherwise, set the end time manually via &apos;Ends at&apos;.
              </p>
            </div>
          </div>
        )}

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
