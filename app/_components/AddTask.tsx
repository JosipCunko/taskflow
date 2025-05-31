"use client";
/*
 dueDate Parameter: You pass dueDate but then overwrite it for timesPerWeek and daysOfWeek with endOfWeek(new Date(), MONDAY_START_OF_WEEK). For interval tasks, you use the passed dueDate. This is a bit inconsistent. The dueDate for the first instance of a repeating task can be a user choice. The subsequent due dates are then calculated.
 */

import { useContext, useState, useMemo, useEffect } from "react";
import type { RefAttributes, ForwardRefExoticComponent } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import type { LucideProps } from "lucide-react";

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
import { format, isSameDay } from "date-fns";
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
    // Pass the onClick from props (injected by Modal.Open) to the actual Button component
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
  hour,
  min,
  setHour,
  setMin,
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
  hour: number;
  setHour: (hour: number) => void;
  min: number;
  setMin: (min: number) => void;
}) => {
  const handleDone = () => {
    onCloseModal?.();
  };

  return (
    <div className="flex flex-col gap-10 p-6 items-center bg-background-650 rounded-lg">
      <h3 className="text-lg font-semibold text-text-high mb-1">
        Customize Task
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 md:gap-10">
        <div className="flex flex-col gap-4">
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <IconPicker
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
          />
        </div>

        <DatePicker
          date={selectedDate}
          setDate={setSelectedDate}
          hour={hour}
          setHour={setHour}
          min={min}
          setMin={setMin}
        />
      </div>

      <Button onClick={handleDone} variant="primary">
        Done
      </Button>
    </div>
  );
};

export default function AddTask({ onCloseModal = undefined }: AddTaskProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hour, setHour] = useState(23);
  const [min, setMin] = useState(59);

  const [isPriority, setIsPriority] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
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
  const isDueDateToday = isSameDay(new Date(), selectedDate);

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

  useEffect(() => {
    if (isRepeatingTask && repetitionModalOpenName !== "repetition-rules") {
      if (activeRepetitionType === "none") {
        setActiveRepetitionType("interval");
      }
      openRepetitionModal("repetition-rules");
    }
    // Added repetitionModalOpenName
  }, [isRepeatingTask, activeRepetitionType, repetitionModalOpenName]);

  useEffect(() => {
    if (!isRepeatingTask) {
      setActiveRepetitionType("none");
    }
  }, [isRepeatingTask]);
  const handleRepetitionDone = () => {
    if (activeRepetitionType === "none") {
      setIsRepeatingTask(false);
    }
    closeRepetitionModal();
  };

  const showMoreModalContextValue = useMemo(
    () => ({
      openName: showMoreOpenName,
      open: openShowMore,
      close: closeShowMore,
    }),
    [showMoreOpenName]
  );

  const handleSubmit = async (formData: FormData) => {
    try {
      const title = formData.get("title");

      if (!title || !hour || !selectedColor || !selectedIcon) {
        throw new Error("Missing some required fields.");
      }

      //CAREFUL for interval tasks
      const dueDate = new Date(selectedDate);
      dueDate.setHours(hour, min, 0, 0);

      let argInterval: number | undefined = undefined;
      let argTimesPerWeek: number | undefined = undefined;
      let argDaysOfWeek: DayOfWeek[] = [];

      if (isRepeatingTask && activeRepetitionType !== "none") {
        switch (activeRepetitionType) {
          case "interval":
            argInterval = interval;
            break;
          case "timesPerWeek":
            argTimesPerWeek = timesPerWeek;
            break;
          case "daysOfWeek":
            argDaysOfWeek =
              selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : [];
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
      } else if (isRepeatingTask && activeRepetitionType === "none") {
        setIsRepeatingTask(false);
      }

      const {
        dueDate: effectiveDueDate,
        isRepeating,
        repetitionRule,
      } = preCreateRepeatingTask(
        argInterval,
        argTimesPerWeek,
        argDaysOfWeek,
        dueDate,
        taskStartDate
      );
      const durationObject =
        durationDays > 0 || durationHours > 0 || durationMinutes > 0
          ? {
              minutes: durationMinutes,
              hours: durationHours,
              days: durationDays,
            }
          : undefined;

      const res = await createTaskAction(
        formData,
        isPriority,
        isReminder,
        selectedColor,
        selectedIcon.displayName || selectedIcon.name,
        effectiveDueDate as Date,
        tags,
        durationObject,
        isRepeating as boolean,
        repetitionRule
      );
      handleToast(res, () => {
        onCloseModal?.();
      });
    } catch (err) {
      const error = err as Error;
      errorToast(error.message);
    }
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
                setSelectedDate(new Date());
              }}
              className={` ${
                isDueDateToday
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
              hour={hour}
              setHour={setHour}
              min={min}
              setMin={setMin}
              // onCloseModal is automatically passed by Modal.Window, will be 'closeShowMore' from memoized context
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
          {/* Display summary of repetition if set */}
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

        {/* --- DURATION UI --- */}
        <div className="pt-4">
          <h4 className="text-sm font-semibold text-text-low mb-2 mt-2">
            Estimated Duration (Optional)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="durationDays"
                className="block text-xs font-medium text-text-low mb-1"
              >
                Days
              </label>
              <Input
                type="number"
                id="durationDays"
                name="durationDays"
                min="0"
                value={String(durationDays)}
                onChange={(e) =>
                  setDurationDays(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full bg-background-650 border-background-500 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="durationHours"
                className="block text-xs font-medium text-text-low mb-1"
              >
                Hours
              </label>
              <Input
                type="number"
                id="durationHours"
                name="durationHours"
                min="0"
                max="23"
                value={String(durationHours)}
                onChange={(e) =>
                  setDurationHours(
                    Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                  )
                }
                className="w-full bg-background-650 border-background-500 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="durationMinutes"
                className="block text-xs font-medium text-text-low mb-1"
              >
                Minutes
              </label>
              <Input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                min="0"
                max="59"
                value={String(durationMinutes)}
                onChange={(e) =>
                  setDurationMinutes(
                    Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                  )
                }
                className="w-full bg-background-650 border-background-500 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <div></div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add task</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
