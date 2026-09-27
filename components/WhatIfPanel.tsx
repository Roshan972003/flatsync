"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { evaluateAllListings, withRelaxedConstraints } from "@/lib/matchEngine";
import { Listing, RoommateProfile } from "@/lib/types";

export function WhatIfPanel({
  listings,
  profiles,
  baselinePassingCount,
}: {
  listings: Listing[];
  profiles: RoommateProfile[];
  baselinePassingCount: number;
}) {
  const [extraCommuteMinutes, setExtraCommuteMinutes] = useState(0);
  const [extraBudgetPercent, setExtraBudgetPercent] = useState(0);

  const previewPassingCount = useMemo(() => {
    if (extraCommuteMinutes === 0 && extraBudgetPercent === 0) {
      return baselinePassingCount;
    }
    const relaxedProfiles = withRelaxedConstraints(profiles, {
      extraCommuteMinutes,
      extraBudgetPercent,
    });
    return evaluateAllListings(listings, relaxedProfiles).passing.length;
  }, [listings, profiles, extraCommuteMinutes, extraBudgetPercent, baselinePassingCount]);

  const delta = previewPassingCount - baselinePassingCount;
  const isAdjusted = extraCommuteMinutes > 0 || extraBudgetPercent > 0;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> What if everyone bent a little?
        </CardTitle>
        <CardDescription>
          Drag these to preview what loosening a shared rule would unlock — nobody&apos;s
          actual answers change until you say so.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Everyone accepts a longer commute</span>
            <span className="font-semibold tabular-nums">+{extraCommuteMinutes} min</span>
          </div>
          <Slider
            min={0}
            max={20}
            step={5}
            value={[extraCommuteMinutes]}
            onValueChange={([v]) => setExtraCommuteMinutes(v)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Everyone stretches their budget</span>
            <span className="font-semibold tabular-nums">+{extraBudgetPercent}%</span>
          </div>
          <Slider
            min={0}
            max={20}
            step={5}
            value={[extraBudgetPercent]}
            onValueChange={([v]) => setExtraBudgetPercent(v)}
          />
        </div>

        <motion.div
          key={previewPassingCount}
          initial={{ opacity: 0.4, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-3.5 py-2.5"
        >
          <span className="text-sm text-muted-foreground">
            {isAdjusted ? "With these changes:" : "At your current answers:"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tabular-nums">{previewPassingCount}</span>
            <span className="text-xs text-muted-foreground">listing{previewPassingCount === 1 ? "" : "s"} pass</span>
            {delta > 0 && (
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3 w-3" /> +{delta}
              </Badge>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
