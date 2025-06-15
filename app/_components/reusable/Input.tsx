import { ChangeEvent } from "react";

function Input({
  type,
  id,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  className,
  placeholder,
  required,
  min,
  max,
  disabled,
}: {
  type: string;
  id?: string;
  value?: string | number | undefined;
  defaultValue?: string | number | undefined;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  name: string;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  return (
    <input
      min={min}
      max={max}
      type={type}
      id={id ? id : name}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      className={`w-full px-3 py-2 rounded-md focus:outline-none border-1 border-background-500 focus:ring-2 focus:ring-background-500 placeholder:text-text-gray ${
        className ? className : ""
      }`}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
    />
  );
}
export default Input;
