"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS: { step: 1 | 2 | 3; label: string }[] = [
  { step: 1, label: "Fill in constraints" },
  { step: 2, label: "Matching" },
  { step: 3, label: "Review trade-offs" },
];

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <ol className="mb-6 flex items-center gap-2 sm:gap-3">
      {STEPS.map(({ step, label }, i) => {
        const isComplete = step < currentStep;
        const isActive = step === currentStep;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isComplete && "bg-success text-success-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  !isComplete && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  isComplete ? "bg-success" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
