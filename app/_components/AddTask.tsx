"use client";

import { useContext, useState, useMemo } from "react";
import type {
  FormEvent,
  RefAttributes,
  ForwardRefExoticComponent,
} from "react";
import { Calendar, CheckCircle } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { toast } from "react-hot-toast";

import ColorPicker from "./ColorPicker";
import { COLORS, TASK_ICONS, taskTypeOptions } from "../utils";
import Button from "./reusable/Button";
import IconPicker from "./IconPicker";
import DatePicker from "./DatePicker";
import Input from "./reusable/Input";
import Modal, { ModalContext } from "./Modal";
import { format } from "date-fns";
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
    <div className="flex flex-col gap-10 p-6 items-center">
      <h3 className="text-lg font-semibold text-text-high mb-1">
        Customize Task
      </h3>
      <div className="grid grid-cols-2 items-center gap-10">
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
  const [hour, setHour] = useState(12);
  const [min, setMin] = useState(30);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isToday, setIsToday] = useState(true);
  const [isPriority, setIsPriority] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
  const [type, setType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<
    ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >
  >(TASK_ICONS[0].icon);

  const [showMoreOpenName, setShowMoreOpenName] = useState<string>("");
  const openShowMore = (name: string) => setShowMoreOpenName(name);
  const closeShowMore = () => setShowMoreOpenName("");

  // Memoize the context value for the "show-more" modal to prevent unnecessary re-renders and to ensure its stability across AddTask re-renders.
  const showMoreModalContextValue = useMemo(
    () => ({
      openName: showMoreOpenName,
      open: openShowMore,
      close: closeShowMore,
    }),
    [showMoreOpenName]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    try {
      console.log("Task to be created:", {
        title,
        description,
        type,
        isToday,
        isPriority,
        isReminder,
        selectedColor,
        selectedIcon,
      });
      toast.success("Task added successfully!");
      setShowMoreOpenName("");
      onCloseModal?.();
    } catch (error) {
      toast.error("Failed to add task");
      console.error(error);
    }
  };

  const handleCancel = () => {
    onCloseModal?.();
    setShowMoreOpenName("");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 bg-background-700 rounded-2xl shadow">
      <form onSubmit={handleSubmit}>
        <div>
          <div className="mb-4">
            <label
              htmlFor="categoryName"
              className="block text-sm font-medium text-text-low mb-1"
            >
              Task name
            </label>
            <Input
              type="text"
              id="categoryName"
              name="categoryName"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Check notes before meeting Friday"
            />
          </div>

          <div className="mb-2">
            <label
              htmlFor="categoryName"
              className="block text-sm font-medium text-text-low mb-1"
            >
              Short description
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              name="description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-low mb-1">
              Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 rounded-md bg-background-700 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-background-500"
              >
                <span
                  className={`${!type ? "text-gray-500" : "text-text-low"}`}
                >
                  {type || "Select type"}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
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
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-background-700 rounded-md shadow-lg text-text-low">
                  <ul className="py-1 max-h-60 overflow-auto">
                    {taskTypeOptions.map((option) => (
                      <li
                        key={option}
                        className="px-3 py-2 text-text-low cursor-pointer hover:bg-background-500"
                        onClick={() => {
                          setType(option);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 mb-6 ">
          <Button
            variant="tag"
            onClick={() => setIsToday(!isToday)}
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
