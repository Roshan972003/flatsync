"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { HUB_KEYS, HUB_LABELS } from "@/lib/geo";
import { estimatePeakMinutes } from "@/lib/traffic";
import { Listing } from "@/lib/types";

function severityColor(minutes: number): string {
  if (minutes <= 20) return "bg-success";
  if (minutes <= 40) return "bg-warning";
  return "bg-destructive";
}

export function CommuteMatrix({ listing }: { listing: Listing }) {
  const gymMinutes = Math.round(listing.distanceToGymKm * 6);
  const rows = [
    ...HUB_KEYS.map((hub) => ({
      label: HUB_LABELS[hub],
      offPeak: listing.commuteMinutes[hub],
      seed: `${listing.id}:${hub}`,
    })),
    {
      label: "Nearest gym",
      offPeak: gymMinutes,
      seed: `${listing.id}:gym`,
    },
  ];

  const maxMinutes = Math.max(...rows.map((r) => estimatePeakMinutes(r.offPeak, r.seed)), 1);

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Off-peak times come from live routing data. Peak-hour numbers are an estimate for
        typical Pune rush-hour conditions, not a live traffic feed — treat them as a heads-up,
        not gospel.
      </p>
      <div className="space-y-2.5">
        {rows.map((row) => {
          const peak = estimatePeakMinutes(row.offPeak, row.seed);
          return (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{row.label}</span>
                <span className="text-muted-foreground">
                  {row.offPeak}m off-peak ·{" "}
                  <span className="font-semibold text-foreground">{peak}m peak</span>
                </span>
              </div>
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full opacity-50", severityColor(row.offPeak))}
                  style={{ width: `${(row.offPeak / maxMinutes) * 100}%` }}
                />
                <div
                  className={cn("h-full rounded-full", severityColor(peak))}
                  style={{ width: `${((peak - row.offPeak) / maxMinutes) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
