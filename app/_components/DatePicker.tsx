import type { ChangeEvent } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Input from "./reusable/Input";

export default function DatePicker({
  date,
  setDate,
  endTime,
  setEndTime,
  timeInputsDisabled,
}: {
  date: Date;
  setDate: (date: Date) => void;
  endTime: number[];
  setEndTime: (endTime: number[]) => void;
  timeInputsDisabled?: boolean;
}) {
  const handleDaySelect = (day: Date) => {
    setDate(day);
  };

  const today = new Date();
  const disabledDays = { before: today };

  return (
    <div className="w-fit">
      <DayPicker
        captionLayout="label"
        required
        animate
        mode="single"
        selected={date}
        onSelect={handleDaySelect}
        disabled={disabledDays}
        footer={
          <Footer
            endTime={endTime}
            setEndTime={setEndTime}
            timeInputsDisabled={timeInputsDisabled}
          />
        }
      />
    </div>
  );
}
function Footer({
  endTime,
  setEndTime,
  timeInputsDisabled,
}: {
  endTime: number[];
  setEndTime: (endTime: number[]) => void;
  timeInputsDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-start text-sm text-text-gray">
      <div className="flex flex-col gap-2 ">
        <label className="text-sm font-medium text-text-low text-nowrap">
          Ends at:
        </label>
        <div className="flex items-center gap-2 p-1">
          <Input
            type="number"
            name="endTimeHour"
            value={endTime[0].toString().padStart(2, "0")}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newHour = parseInt(e.target.value, 10);
              setEndTime([
                isNaN(newHour) ? 0 : Math.max(0, Math.min(23, newHour)),
                endTime[1],
              ]);
            }}
            className="text-center bg-background-500 focus:ring-primary-500 outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="HH"
            disabled={timeInputsDisabled}
          />
          <span className="font-bold text-text-medium">:</span>
          <Input
            type="number"
            name="endTimeMinute"
            value={endTime[1].toString().padStart(2, "0")}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newMin = parseInt(e.target.value, 10);
              setEndTime([
                endTime[0],
                isNaN(newMin) ? 0 : Math.max(0, Math.min(59, newMin)),
              ]);
            }}
            disabled={timeInputsDisabled}
            className="text-center bg-background-500 focus:ring-primary-500 outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="MM"
          />
        </div>
      </div>
    </div>
  );
}
