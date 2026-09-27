"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingEvaluation } from "@/lib/types";
import { RelaxationSuggestion } from "@/lib/matchEngine";

const CONSTRAINT_LABELS: Record<string, string> = {
  budget: "Budget",
  location: "Excluded location",
  commute: "Commute time",
  lift: "Lift requirement",
  bathrooms: "Bathroom count",
  pet: "Pet-friendliness",
  parking: "Parking",
};

export function ConstraintConflictAlert({
  failing,
  suggestions,
}: {
  failing: ListingEvaluation[];
  suggestions: RelaxationSuggestion[];
}) {
  const violationCounts: Record<string, number> = {};
  for (const evaluation of failing) {
    for (const v of evaluation.hardConstraints.violations) {
      violationCounts[v.constraint] = (violationCounts[v.constraint] ?? 0) + 1;
    }
  }

  const sortedConstraints = Object.entries(violationCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-warning/40 bg-warning/5">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>No listing satisfies everyone&apos;s dealbreakers</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Every one of the {failing.length} listing{failing.length === 1 ? "" : "s"} we checked
              was eliminated by at least one hard constraint. Here&apos;s what&apos;s blocking things,
              most common first — relax one of these to unlock matches.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {sortedConstraints.map(([constraint, count]) => (
              <Badge key={constraint} variant="warning" className="text-[0.7rem]">
                {CONSTRAINT_LABELS[constraint] ?? constraint} — blocked {count}
              </Badge>
            ))}
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Lightbulb className="h-4 w-4" /> Fastest ways to unlock matches
            </p>
            {suggestions.length > 0 ? (
              <ul className="space-y-1.5">
                {suggestions.slice(0, 3).map((s, i) => (
                  <li key={i} className="text-xs text-foreground/80">
                    If <span className="font-semibold">{s.roommateName}</span> is open to{" "}
                    {s.constraintLabel}, {s.additionalListings} more listing
                    {s.additionalListings === 1 ? "" : "s"} would qualify.
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-foreground/80">
                No single person relaxing one constraint unlocks a listing — the same
                dealbreaker is blocking everything for more than one of you at once, so
                this one needs a group conversation rather than a solo compromise.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {failing.map((evaluation) => (
              <div
                key={evaluation.listing.id}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <p className="text-sm font-semibold">
                  {evaluation.listing.imageEmoji} {evaluation.listing.name}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {evaluation.listing.locality}
                  </span>
                </p>
                <ul className="mt-1.5 space-y-1">
                  {evaluation.hardConstraints.violations.map((v, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <span className="font-medium text-destructive">
                        {v.roommateName}:
                      </span>{" "}
                      {v.detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
