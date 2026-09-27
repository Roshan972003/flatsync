"use client";

import { Droplets, Smartphone, ArrowUpDown, Car, Check, X, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChecklistItemKey, ChecklistStatus, VisitChecklist } from "@/lib/types";

const CHECKLIST_ITEMS: { key: ChecklistItemKey; label: string; icon: typeof Droplets; hint: string }[] = [
  { key: "waterPressure", label: "Water pressure", icon: Droplets, hint: "Run a tap for 30 seconds" },
  { key: "mobileSignal", label: "Mobile signal", icon: Smartphone, hint: "Check bars in every room" },
  { key: "liftCondition", label: "Lift condition", icon: ArrowUpDown, hint: "Working, clean, not overloaded" },
  { key: "peakTraffic", label: "Peak-traffic reality", icon: Car, hint: "Visit once during evening rush" },
];

const STATUS_STYLES: Record<ChecklistStatus, string> = {
  unchecked: "border-input bg-background text-muted-foreground",
  good: "border-success/40 bg-success/10 text-success",
  bad: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function PropertyVisitChecklist({
  checklist,
  onUpdate,
}: {
  checklist: VisitChecklist;
  onUpdate: (item: ChecklistItemKey, patch: { status?: ChecklistStatus; note?: string }) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Bring this up on your walkthrough — mark each item once you&apos;ve actually checked it in
        person, notes are saved for the whole group.
      </p>
      {CHECKLIST_ITEMS.map(({ key, label, icon: Icon, hint }) => {
        const state = checklist[key] ?? { status: "unchecked" as ChecklistStatus, note: "" };
        return (
          <div key={key} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
                <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
                  — {hint}
                </span>
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  title="Good"
                  onClick={() => onUpdate(key, { status: "good" })}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                    state.status === "good"
                      ? STATUS_STYLES.good
                      : "border-input text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Not okay"
                  onClick={() => onUpdate(key, { status: "bad" })}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                    state.status === "bad"
                      ? STATUS_STYLES.bad
                      : "border-input text-muted-foreground hover:bg-muted"
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Not checked yet"
                  onClick={() => onUpdate(key, { status: "unchecked" })}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                    state.status === "unchecked"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Circle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <Input
              placeholder="Add a note from the visit..."
              value={state.note}
              onChange={(e) => onUpdate(key, { note: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        );
      })}
    </div>
  );
}
