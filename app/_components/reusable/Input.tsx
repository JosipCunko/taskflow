import { ChangeEvent } from "react";

function Input({
  type,
  id,
  name,
  value,
  onChange,
  className,
  placeholder,
  required,
  min,
  max,
}: {
  type: string;
  id?: string;
  value?: string | number | undefined;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  name: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <input
      min={min}
      max={max}
      type={type}
      id={id ? id : name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 rounded-md focus:outline-none border-1 border-background-500 focus:ring-2 focus:ring-background-500 placeholder:text-text-gray ${
        className ? className : ""
      }`}
      placeholder={placeholder}
      required={required}
    />
  );
}
export default Input;
