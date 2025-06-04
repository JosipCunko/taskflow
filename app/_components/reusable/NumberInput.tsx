"use client";
import Button from "./Button";

import { useState } from "react";
export default function NumberInput({ numInputs }: { numInputs: number }) {
  const [code, setCode] = useState<number[]>([]);

  return (
    <form
      action={(formData: FormData) => {
        Array.from({ length: numInputs }).map((_, index) =>
          setCode((prev) => [...prev, formData.get(`code-${index}`) as number])
        );
      }}
      className="flex flex-col items-center justify-center gap-2"
    >
      <div className="verifyCode">
        {Array.from({ length: numInputs }).map((_, index) => (
          <input
            name={`code-${index}`}
            key={index}
            type="number"
            className="code"
            min="0"
            max="9"
            placeholder="0"
          />
        ))}
      </div>
      <Button variant="secondary" type="submit">
        Submit
      </Button>
    </form>
  );
}
