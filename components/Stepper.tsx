"use client";

/** Shared horizontal progress stepper used across multi-step module workflows.
 *  Pass `onStepClick` to make reachable steps clickable; omit it to keep the
 *  stepper purely decorative (existing behavior for read-only usages).
 *  `maxStep` caps how far a user can jump ahead (defaults to no cap). */
export default function Stepper({
  steps,
  activeStep,
  onStepClick,
  maxStep,
}: {
  steps: string[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  maxStep?: number;
}) {
  return (
    <div className="flex items-center w-full overflow-x-auto">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const active = stepNum === activeStep;
        const clickable = Boolean(onStepClick) && stepNum <= (maxStep ?? Infinity);
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none min-w-fit">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick?.(stepNum)}
              className={`flex items-center gap-2 shrink-0 ${
                clickable ? "cursor-pointer" : "cursor-not-allowed"
              } ${!clickable && onStepClick ? "opacity-50" : ""}`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  active ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {stepNum}
              </span>
              <span
                className={`text-sm whitespace-nowrap ${
                  active ? "text-slate-900 font-medium" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </button>
            {stepNum !== steps.length && (
              <div className="flex-1 h-px bg-gray-200 mx-4 min-w-6" />
            )}
          </div>
        );
      })}
    </div>
  );
}
