"use client";
import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useTransition,
  type ChangeEvent,
  useReducer,
} from "react";
import type { RefAttributes, ForwardRefExoticComponent, Dispatch } from "react";
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
  selectedIcon,
  onCloseModal,
  selectedDate,
  timeEnd,
  handleTimeEndChange,
  startTime,
  handleStartTimeChange,
  isRepeatingTask,
  dispatch,
}: {
  selectedColor: string;
  selectedIcon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  onCloseModal?: () => void;
  selectedDate: Date;
  timeEnd: number[];
  handleTimeEndChange: (time: number[]) => void;
  startTime: number[];
  handleStartTimeChange: (time: number[]) => void;
  isRepeatingTask: boolean;
  dispatch: Dispatch<Action>;
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
      dispatch({
        type: "duration",
        payload: [durationHours, remainingMinutes],
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 p-3 sm:p-6 items-center bg-background-650 rounded-lg  max-h-[85vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-text-high mb-1">
        Customize Task
      </h3>

      <div className="flex flex-col gap-4">
        <ColorPicker selectedColor={selectedColor} dispatch={dispatch} />
        <IconPicker selectedIcon={selectedIcon} dispatch={dispatch} />
        {!isRepeatingTask && (
          <div className="grid place-items-center">
            <DatePicker date={selectedDate} dispatch={dispatch} />
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
};

const reducer = (state: typeof initialState, action: Action) => {
  return { ...state, [action.type]: action.payload };
};

export default function AddTask({ onCloseModal = undefined }: AddTaskProps) {
  const [isPending, startTransition] = useTransition();
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [activeRepetitionType, setActiveRepetitionType] = useState<
    "interval" | "daysOfWeek" | "timesPerWeek" | "none"
  >("none");

  const [state, dispatch] = useReducer(reducer, initialState);

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

          const { dueDate: firstInstanceDueDate, repetitionRule } =
            preCreateRepeatingTask(
              argInterval,
              argTimesPerWeek,
              argDaysOfWeek,
              baseDueDate,
              state.startDate
            );

          const res = await createTaskAction(
            formData,
            state.isPriority,
            state.isReminder,
            state.selectedColor,
            TASK_ICONS.filter((icon) => icon.icon === state.selectedIcon)[0]
              .label,
            firstInstanceDueDate as Date,
            taskTimeObject,
            state.tags,
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
            state.isPriority,
            state.isReminder,
            state.selectedColor,
            TASK_ICONS.filter((icon) => icon.icon === state.selectedIcon)[0]
              .label,
            baseDueDate,
            taskTimeObject,
            state.tags,
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
          tags={state.tags}
          setTags={(tags) => dispatch({ type: "tags", payload: tags })}
          placeholder="e.g. family, gym"
        />
        <div className="flex items-center space-x-2 my-4 ">
          {!state.isRepeating && (
            <Button
              variant="tag"
              onClick={() => {
                const today = new Date();
                dispatch({
                  type: "date",
                  payload: isSameDay(today, state.selectedDate)
                    ? new Date(
                        state.selectedDate.getTime() + 24 * 60 * 60 * 1000
                      )
                    : today,
                });
              }}
              className={` ${
                isSameDay(new Date(), state.selectedDate)
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
            onClick={() =>
              dispatch({ type: "isPriority", payload: !state.isPriority })
            }
            className={`${
              state.isPriority
                ? "bg-red-100 text-red-800"
                : "bg-background-500 text-text-low"
            }`}
          >
            <span className="mr-1">⚑</span>
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
              selectedColor={state.selectedColor}
              dispatch={dispatch}
              selectedIcon={state.selectedIcon}
              selectedDate={state.selectedDate}
              timeEnd={state.endTime}
              handleTimeEndChange={handleEndTimeChange}
              startTime={state.startTime}
              handleStartTimeChange={handleStartTimeChange}
              isRepeatingTask={state.isRepeating}
            />
          </Modal.Window>
        </ModalContext.Provider>
        <div className="pt-4 ">
          <SwitchComponent
            id="isRepeating"
            name="isRepeating"
            label="Make this a repeating task"
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
              className="mt-2 text-sm text-primary-500 hover:text-primary-400  text-left w-full"
            >
              <CardSpecificIcons.Edit size={20} />
              {activeRepetitionType === "interval" &&
                `Repeats every ${state.interval} day(s)`}
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
              {state.startDate && ` starting ${formatDate(state.startDate)}`}
            </Button>
          )}
        </div>

        <ModalContext.Provider value={repetitionModalContextValue}>
          <Modal.Window name="repetition-rules">
            <RepetitionRulesModal
              dispatch={dispatch}
              activeRepetitionType={activeRepetitionType}
              setActiveRepetitionType={setActiveRepetitionType}
              intervalValue={state.interval}
              timesPerWeekValue={state.timesPerWeek}
              selectedDaysOfWeek={state.selectedDaysOfWeek}
              repetitionTaskStartDate={state.startDate}
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
                value={state.duration[0].toString().padStart(2, "0")}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newHour = parseInt(e.target.value, 10);
                  handleDurationChange([
                    isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                    state.duration[1],
                  ]);
                }}
                className="text-text-gray text-center bg-background-500 focus:ring-primary-500 outline-none w-16"
              />
              <span className="text-text-gray">h</span>
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
