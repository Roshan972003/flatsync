"use client";

import { motion } from "framer-motion";
import { CheckCircle2, HelpCircle, XCircle, PartyPopper, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingVotes, RoommateId, VoteValue } from "@/lib/types";

const VOTE_OPTIONS: { value: VoteValue; label: string; icon: typeof CheckCircle2 }[] = [
  { value: "visit", label: "Ready to visit", icon: CheckCircle2 },
  { value: "maybe", label: "Maybe", icon: HelpCircle },
  { value: "veto", label: "Veto", icon: XCircle },
];

const VOTE_STYLES: Record<VoteValue, string> = {
  visit: "border-success/40 bg-success/10 text-success",
  maybe: "border-warning/40 bg-warning/10 text-warning",
  veto: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function VotePanel({
  roommates,
  votes,
  onVote,
}: {
  roommates: { id: RoommateId; name: string }[];
  votes: ListingVotes;
  onVote: (roommateId: RoommateId, vote: VoteValue) => void;
}) {
  const values = roommates.map((r) => votes[r.id]);
  const allVoted = values.every((v) => v !== undefined);
  const anyVeto = values.some((v) => v === "veto");
  const allVisit = allVoted && values.every((v) => v === "visit");

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Vote on this one
      </p>
      <div className="space-y-1.5">
        {roommates.map((r) => {
          const current = votes[r.id];
          return (
            <div key={r.id} className="flex items-center justify-between gap-2">
              <span className="w-16 shrink-0 text-xs font-medium">{r.name}</span>
              <div className="flex flex-1 gap-1.5">
                {VOTE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isSelected = current === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      onClick={() => onVote(r.id, value)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1 rounded-md border px-1.5 py-1 text-[0.65rem] font-medium transition-colors",
                        isSelected
                          ? VOTE_STYLES[value]
                          : "border-input bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {anyVeto && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1.5 text-xs font-medium text-destructive"
        >
          <Ban className="h-3.5 w-3.5" /> Vetoed — this one&apos;s off the table.
        </motion.p>
      )}
      {allVisit && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 rounded-md bg-success/10 px-2 py-1.5 text-xs font-medium text-success"
        >
          <PartyPopper className="h-3.5 w-3.5" /> Everyone&apos;s ready to visit this one!
        </motion.p>
      )}
    </div>
  );
}
