"use client";

import { useContext, useState, useMemo, useEffect } from "react";
import type { RefAttributes, ForwardRefExoticComponent } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { toast } from "react-hot-toast";

import ColorPicker from "./ColorPicker";
import { colorsColorPicker, handleToast, TASK_ICONS } from "../utils";
import Button from "./reusable/Button";
import IconPicker from "./IconPicker";
import DatePicker from "./DatePicker";
import Input from "./reusable/Input";
import Modal, { ModalContext } from "./Modal";
import { createTaskAction } from "../_lib/actions";
import { format, isSameDay } from "date-fns";
import TagInput from "./TagInput";
import {
  DayOfWeek,
  RepetitionFrequency,
  RepetitionRule,
} from "../_types/types";
import Checkbox from "./reusable/Checkbox";
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
      <span className="text-gray-500">Show more</span>
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

  const [isToday, setIsToday] = useState(true);
  const [isPriority, setIsPriority] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const [selectedColor, setSelectedColor] = useState<string>(
    colorsColorPicker[0]
  );
  const [selectedIcon, setSelectedIcon] = useState<
    ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >
  >(TASK_ICONS[0].icon);

  const [isRepeatingTask, setIsRepeatingTask] = useState(false);
  const [repetitionFreq, setRepetitionFreq] =
    useState<RepetitionFrequency>("daily");
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DayOfWeek[]>([]); // Complete every saturday
  const [timesPerWeek, setTimesPerWeek] = useState<number>(1); // For X times per week
  const [interval, setInterval] = useState<number>(1); // Every X days
  const [taskStartDate, setTaskStartDate] = useState<Date>(new Date());

  const [showMoreOpenName, setShowMoreOpenName] = useState<string>("");
  const openShowMore = (name: string) => setShowMoreOpenName(name);
  const closeShowMore = () => setShowMoreOpenName("");

  useEffect(
    function () {
      if (!isSameDay(new Date(), selectedDate)) {
        setIsToday(false);
      }
      if (isSameDay(new Date(), selectedDate)) {
        setIsToday(true);
      }
    },
    [selectedDate]
  );

  // Memoize the context value for the "show-more" modal to prevent unnecessary re-renders and to ensure its stability across AddTask re-renders.
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

      if (
        !title ||
        !selectedDate ||
        !hour ||
        !min ||
        !selectedColor ||
        !selectedIcon
      ) {
        throw new Error("Missing some required fields.");
      }

      const dueDate = new Date(selectedDate);
      dueDate.setHours(hour);
      dueDate.setMinutes(min);

      const isRepeating = isRepeatingTask;
      const repetitionRuleData: RepetitionRule = {
        frequency: repetitionFreq,
        interval: interval ? interval : undefined,
        timesPerWeek: timesPerWeek ? timesPerWeek : undefined,
        daysOfWeek:
          selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : undefined,
        startDate: taskStartDate,
        completions: 0,
        lastInstanceCompletedDate: undefined,
      };

      // !!! UPDATE creteTaskAction
      const res = await createTaskAction(
        formData,
        isToday,
        isPriority,
        isReminder,
        selectedColor,
        selectedIcon.displayName || selectedIcon.name,
        dueDate,
        tags,
        isRepeating,
        repetitionRuleData
      );
      handleToast(res, () => {
        onCloseModal?.();
      });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
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
              placeholder="Check notes before meeting Friday"
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
          <Button
            variant="tag"
            onClick={() => {
              setIsToday(!isToday);
              setSelectedDate(new Date());
            }}
            className={` ${
              isToday
                ? "bg-green-100 text-green-800"
                : "bg-background-500 text-text-low"
            }`}
          >
            <Calendar size={16} className="mr-1" />
            Today
          </Button>

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

        <div className="mt-4">
          <Checkbox
            id="isRepeating"
            name="isRepeating"
            label="Make this a repeating task"
            checked={isRepeatingTask}
            onChange={(e) => setIsRepeatingTask(e.target.checked)}
          />
        </div>

        {isRepeatingTask && (
          <div className="mt-4 p-4 bg-background-600 rounded-lg border border-divider space-y-4 animate-fadeIn">
            <h4 className="text-sm font-medium text-text-low mb-2">
              Repetition Rules
            </h4>

            <div>
              <label
                htmlFor="repetitionFreq"
                className="block text-xs font-medium text-text-low mb-1"
              >
                Frequency
              </label>
              <select
                id="repetitionFreq"
                value={repetitionFreq}
                onChange={(e) =>
                  setRepetitionFreq(e.target.value as RepetitionFrequency)
                }
                className="w-full bg-background-650 border border-background-500 text-text-high p-2 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Conditional UI based on frequency */}
            {repetitionFreq === "weekly" && (
              <>
                {/* Option 1: Specific Days of Week */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-low mb-1">
                    Select days (for &quot;Weekly on specific days&quot;):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
                    ).map((dayLabel, index) => {
                      const dayValue = ((index + 1) % 7) as DayOfWeek;
                      return (
                        <button
                          type="button"
                          key={dayLabel}
                          onClick={() => {
                            setSelectedDaysOfWeek((prev) =>
                              prev.includes(dayValue)
                                ? prev.filter((d) => d !== dayValue)
                                : [...prev, dayValue]
                            );
                          }}
                          className={`px-3 py-1.5 text-xs rounded-md border transition-colors
${
  selectedDaysOfWeek.includes(dayValue)
    ? "bg-primary-500 text-white border-primary-500"
    : "bg-background-500 text-text-low border-background-400 hover:border-primary-400"
}`}
                        >
                          {dayLabel}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-2xs text-text-medium mt-1">
                    Selected:{" "}
                    {selectedDaysOfWeek
                      .map(
                        (d) =>
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
                      )
                      .join(", ") || "None"}
                  </p>
                  <p className="text-2xs text-text-medium mt-1">
                    Note: Setting &quot;Select times per week&quot; &quot;Select
                    interval&quot; above will override this.
                  </p>
                </div>
                {/* Option 2: Times per week */}
                <div className="border-t border-divider pt-3 mt-3">
                  <label
                    htmlFor="timesPerWeek"
                    className="block text-xs font-medium text-text-low mb-1"
                  >
                    Or, occur this many times per week (any day):
                  </label>
                  <Input
                    type="number"
                    id="timesPerWeek"
                    name="timesPerWeek"
                    min="1"
                    max="7"
                    value={String(timesPerWeek)}
                    onChange={(e) =>
                      setTimesPerWeek(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    placeholder="e.g., 3"
                    className="bg-background-650 border-background-500 text-sm"
                  />
                  <p className="text-2xs text-text-medium mt-1">
                    Note: Setting &quot;Select days&quot; &quot;Select
                    interval&quot; above will override this.
                  </p>
                </div>

                {/* Option 3: Interval */}
                <div className="border-t border-divider pt-3 mt-3">
                  <label
                    htmlFor="interval"
                    className="block text-xs font-medium text-text-low mb-1"
                  >
                    Or, occur every few days:
                  </label>
                  <Input
                    type="number"
                    id="interval"
                    name="interval"
                    value={interval}
                    onChange={(e) => setInterval(+e.target.value)}
                    className="bg-background-650 border-background-500 text-sm"
                  />
                  <p className="text-2xs text-text-medium mt-1">
                    Note: Setting &quot;Select days of week&quot; and
                    &quot;Select times per week&quot; above will override this.
                  </p>
                </div>
              </>
            )}

            {/* Start Date for repetition */}
            <div>
              <label className="block text-xs font-medium text-text-low mb-1">
                Start repeating on
              </label>
              <Input
                type="date"
                name="taskStartDate"
                value={format(taskStartDate, "yyyy-MM-dd")}
                onChange={(e) => setTaskStartDate(new Date(e.target.value))}
                className="bg-background-650 border-background-500 text-sm"
              />
            </div>
          </div>
        )}

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
