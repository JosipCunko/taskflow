import { motion } from "framer-motion";
import { ComponentProps, useState } from "react";

// NOT USED
function Step({ step, currentStep }: { step: number; currentStep: number }) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  return (
    <motion.div animate={status} className="relative">
      <motion.div
        variants={{
          active: {
            scale: 1,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          },
          complete: {
            scale: 1.25,
          },
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "tween",
          ease: "circOut",
        }}
        className="absolute inset-0 rounded-full bg-blue-200"
      />

      <motion.div
        initial={false}
        variants={{
          inactive: {
            backgroundColor: "#fff",
            borderColor: "#e5e5e5",
            color: "#a3a3a3",
          },
          active: {
            backgroundColor: "#fff",
            borderColor: "#3b82f6",
            color: "#3b82f6",
          },
          complete: {
            backgroundColor: "#3b82f6",
            borderColor: "#3b82f6",
            color: "#3b82f6",
          },
        }}
        transition={{ duration: 0.2 }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold"
      >
        <div className="flex items-center justify-center">
          {status === "complete" ? (
            <CheckIcon className="h-6 w-6 text-white" />
          ) : (
            <span>{step}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default function MultistepWizard() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gray-900/90 p-4 backdrop-blur-xl sm:aspect-[4/3] md:aspect-[2/1]">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex justify-between rounded p-8">
          <Step step={1} currentStep={step} />
          <Step step={2} currentStep={step} />
          <Step step={3} currentStep={step} />
          <Step step={4} currentStep={step} />
        </div>

        {/* Dynamic content based on `step` */}
        <div className="space-y-2 px-8">
          <div className="h-4 w-5/6 rounded bg-neutral-100" />
          <div className="h-4 rounded bg-neutral-100" />
          <div className="h-4 w-4/6 rounded bg-neutral-100" />
        </div>

        <div className="px-8 pb-8">
          <div className="mt-10 flex justify-between">
            <button
              onClick={() => setStep(step < 2 ? step : step - 1)}
              className={`${
                step === 1 ? "pointer-events-none opacity-50" : ""
              } duration-350 rounded px-2 py-1 text-neutral-400 transition hover:text-neutral-700`}
            >
              Back
            </button>
            <button
              onClick={() => setStep(step > 4 ? step : step + 1)}
              className={`${
                step > 4 ? "pointer-events-none opacity-50" : ""
              } bg duration-350 flex items-center justify-center rounded-full bg-blue-500 py-1.5 px-3.5 font-medium tracking-tight text-white transition hover:bg-blue-600 active:bg-blue-700`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
