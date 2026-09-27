"use client";

import { useMemo, useState } from "react";
import { FlaskConical, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluateListing, RelaxationIgnore } from "@/lib/matchEngine";
import { Listing, RoommateProfile } from "@/lib/types";

export function DealbreakerOverridePanel({
  listing,
  profiles,
}: {
  listing: Listing;
  profiles: RoommateProfile[];
}) {
  const [override, setOverride] = useState<RelaxationIgnore | null>(null);

  const baseEvaluation = useMemo(
    () => evaluateListing(listing, profiles),
    [listing, profiles]
  );

  const previewEvaluation = useMemo(
    () => (override ? evaluateListing(listing, profiles, override) : null),
    [listing, profiles, override]
  );

  const violations = baseEvaluation.hardConstraints.violations;
  const uniqueViolations = Array.from(
    new Map(violations.map((v) => [`${v.roommateId}:${v.constraint}`, v])).values()
  );

  return (
    <div className="space-y-1.5">
      <ul className="space-y-0.5">
        {violations.slice(0, 3).map((v, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            <span className="font-medium text-destructive">{v.roommateName}:</span> {v.detail}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {uniqueViolations.map((v, i) => {
          const isActive =
            override?.roommateId === v.roommateId && override?.constraint === v.constraint;
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setOverride(isActive ? null : { roommateId: v.roommateId, constraint: v.constraint })
              }
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium transition-colors ${
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:bg-muted"
              }`}
            >
              <FlaskConical className="h-2.5 w-2.5" />
              {isActive ? "Waiving" : "Try waiving"} {v.roommateName}&apos;s {v.label.toLowerCase()}
              {isActive && <X className="h-2.5 w-2.5" />}
            </button>
          );
        })}
      </div>

      {previewEvaluation && (
        <div className="mt-1.5 rounded-md border border-primary/20 bg-primary/5 p-2 text-xs">
          {previewEvaluation.hardConstraints.passed ? (
            <p className="flex items-center gap-1 font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> With that waived, this listing would pass —{" "}
              {previewEvaluation.combinedScorePercent}% combined match.
            </p>
          ) : (
            <p className="flex items-center gap-1 font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Still blocked by{" "}
              {previewEvaluation.hardConstraints.violations.length} other issue
              {previewEvaluation.hardConstraints.violations.length === 1 ? "" : "s"}, even with
              that one waived.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
