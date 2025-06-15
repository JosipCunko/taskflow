import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DatePicker({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
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
      />
    </div>
  );
}
