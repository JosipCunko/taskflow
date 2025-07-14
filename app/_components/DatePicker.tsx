import { Dispatch } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Action } from "./AddTask";

export default function DatePicker({
  date,
  dispatch,
}: {
  date: Date;
  dispatch: Dispatch<Action>;
}) {
  const handleDaySelect = (day: Date) => {
    dispatch({ type: "selectedDate", payload: day });
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
      />
    </div>
  );
}
