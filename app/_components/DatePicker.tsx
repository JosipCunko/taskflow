import type { ChangeEvent } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

export default function DatePicker({
  date,
  setDate,
  hour,
  setHour,
  min,
  setMin,
}: {
  date: Date;
  setDate: (date: Date) => void;
  hour: number;
  setHour: (hour: number) => void;
  min: number;
  setMin: (min: number) => void;
}) {
  const handleDaySelect = (day: Date) => {
    setDate(day);
  };

  return (
    <div className="w-fit">
      <DayPicker
        captionLayout="label"
        required
        animate
        mode="single"
        selected={date}
        onSelect={handleDaySelect}
        footer={
          <Footer
            day={date}
            hour={hour}
            min={min}
            setMin={setMin}
            setHour={setHour}
          />
        }
      />
    </div>
  );
}
function Footer({
  day,
  hour,
  min,
  setHour,
  setMin,
}: {
  day: Date;
  hour: number;
  min: number;
  setHour: (hour: number) => void;
  setMin: (min: number) => void;
}) {
  const handleHourChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setHour(value);
    }
  };

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setMin(value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row mt-2 items-start sm:items-center text-sm gap-3 sm:gap-5 text-gray-500">
      <div>
        <span className="text-text-low">Selected Date: </span>
        <span>{format(day, "dd. MM. yyyy")}</span>
      </div>

      <div className="flex flex-row items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-blue-500 "></div>
        <input
          type="number"
          onChange={handleHourChange}
          value={hour}
          className="w-10 px-1 text-center border rounded-[3px] user-valid:border-primary-500 border-transparent user-invalid:border-error text-text-low bg-background-600 focus:ring-1 focus:ring-primary-500 outline-none"
          min={0}
          max={23}
        />
        <span className="font-bold">:</span>
        <input
          type="number"
          onChange={handleMinChange}
          value={min}
          className="w-10 px-1 text-center border rounded-[3px] user-valid:border-primary-500 border-transparent user-invalid:border-error text-text-low bg-background-600 focus:ring-1 focus:ring-primary-500 outline-none"
          min={0}
          max={59}
        />
      </div>
    </div>
  );
}
