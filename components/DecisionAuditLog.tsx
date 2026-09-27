"use client";

import { useMemo, useState } from "react";
import { History, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { evaluateListing } from "@/lib/matchEngine";
import { Listing, RoommateProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DecisionAuditLog({
  listings,
  profiles,
}: {
  listings: Listing[];
  profiles: RoommateProfile[];
}) {
  const [open, setOpen] = useState(false);

  const entries = useMemo(
    () =>
      listings.map((listing, i) => ({
        index: i + 1,
        evaluation: evaluateListing(listing, profiles),
      })),
    [listings, profiles]
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <History className="h-4 w-4" /> Decision Audit History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decision Audit History</DialogTitle>
            <DialogDescription>
              Every listing checked this round, and exactly why it was kept or rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="scrollbar-thin max-h-[60vh] space-y-2 overflow-y-auto">
            {entries.map(({ index, evaluation }) => {
              const passed = evaluation.hardConstraints.passed;
              return (
                <div
                  key={evaluation.listing.id}
                  className={cn(
                    "rounded-lg border p-3",
                    passed ? "border-success/30 bg-success/5" : "border-destructive/20 bg-destructive/5"
                  )}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {passed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    Listing #{index} — {evaluation.listing.imageEmoji} {evaluation.listing.name}
                  </div>
                  {passed ? (
                    <p className="mt-1 pl-6 text-xs text-muted-foreground">
                      Passed all hard constraints — {evaluation.combinedScorePercent}% combined
                      match score.
                    </p>
                  ) : (
                    <ul className="mt-1 space-y-0.5 pl-6">
                      {evaluation.hardConstraints.violations.map((v, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          Rejected — <span className="font-medium text-foreground">{v.roommateName}&apos;s{" "}
                          {v.label}</span> failed: {v.detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
