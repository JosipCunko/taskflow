import Button from "./Button";

export default function NumberInputs({
  count,
  values,
  setValues,
  isTimeInput = false,
}: {
  count: number;
  values: number[];
  setValues: (values: number[]) => void;
  isTimeInput?: boolean;
}) {
  const codes: NodeListOf<HTMLInputElement> =
    document.querySelectorAll(".code");

  codes.forEach((code, i) => {
    code.addEventListener("keydown", function (e) {
      if (parseInt(e.key) >= 0 && parseInt(e.key) <= 9) {
        codes[i].value = "";
        setTimeout(() => codes[i + 1]?.focus(), 10);
      } else if (e.key === "Backspace") {
        setTimeout(() => codes[i - 1]?.focus(), 10);
      }
    });
  });

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="verifyCode">
        {/* Time input */}

        {Array.from({ length: count }).map((_, index) => {
          return (
            <>
              <input
                key={index}
                type="number"
                className="code "
                min="0"
                max={
                  isTimeInput && index === 0 ? "3" : values[0] === 2 ? "3" : "9"
                }
                placeholder="0"
                onChange={(e) => {
                  setValues([...values, parseInt(e.target.value)]);
                }}
              />
              {isTimeInput && index === 1 && (
                <span className="text-sm text-gray-500 font-bold">:</span>
              )}
            </>
          );
        })}
      </div>
      <Button variant="secondary" type="submit">
        Submit
      </Button>
    </div>
  );
}
