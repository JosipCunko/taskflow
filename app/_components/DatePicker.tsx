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
  setHour: (e: ChangeEvent<HTMLInputElement>) => void;
  setMin: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex mt-2 items-center text-sm gap-5 text-gray-500">
      <div>
        <span className="text-text-low">Selected Date: </span>
        <span>{format(day, "dd. MM. yyyy")}</span>
      </div>

      <div className="flex flex-row items-center gap-0.5">
        <div className="h-2 w-2 rounded-full bg-blue-500 "></div>
        <input
          type="number"
          onChange={(e) => setHour(e.target.value)}
          value={hour}
          className="w-7 grid place-items-center border rounded-[3px] user-valid:border-primary-500 border-transparent user-invalid:border-error text-text-low"
          min={0}
          max={24}
        />
        <span className="font-bold">:</span>
        <input
          type="number"
          onChange={(e) => setMin(e.target.value)}
          value={min}
          className="w-7 grid place-items-center border rounded-[3px] user-valid:border-primary-500 border-transparent user-invalid:border-error text-text-low"
          min={0}
          max={59}
        />
      </div>
    </div>
  );
}
