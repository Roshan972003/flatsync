"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Scale,
  Satellite,
  Loader2,
  WifiOff,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { ConstraintConflictAlert } from "@/components/ConstraintConflictAlert";
import { AddListingDialog } from "@/components/AddListingDialog";
import { WhatIfPanel } from "@/components/WhatIfPanel";
import { ShareSummaryButton } from "@/components/ShareSummaryButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  evaluateAllListings,
  findConstraintConflictCombos,
  suggestRelaxations,
} from "@/lib/matchEngine";
import { useFlatSyncStore } from "@/lib/store";
import { applyLiveCommuteTimes, useLiveCommuteTimes } from "@/lib/useLiveCommute";
import { ListingEvaluation, RoommateId } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

function CommuteDataBadge({ status }: { status: "loading" | "live" | "cache" | "unavailable" }) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Fetching live commute times…
      </span>
    );
  }
  if (status === "unavailable") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
        <WifiOff className="h-3 w-3" /> Commute times are estimates (routing service unreachable)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs text-success">
      <Satellite className="h-3 w-3" /> Commute times from live routing data
    </span>
  );
}

type SortKey = "combined" | "rent" | "fairness" | RoommateId;

function getSortValue(evaluation: ListingEvaluation, key: SortKey): number {
  if (key === "combined") return evaluation.combinedScorePercent;
  if (key === "rent") return evaluation.listing.monthlyRentTotal;
  if (key === "fairness") return evaluation.fairnessGap;
  const re = evaluation.roommateEvaluations.find((r) => r.roommateId === key);
  return re?.scorePercent ?? 0;
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeKey === sortKey;
  return (
    <th className="px-4 py-3 font-semibold">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1 transition-colors hover:text-primary",
          isActive && "text-primary"
        )}
      >
        {label}
        {isActive ? (
          direction === "desc" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </button>
    </th>
  );
}

export function ComparisonDashboard({ onBack }: { onBack: () => void }) {
  const profiles = useFlatSyncStore((s) => s.profiles);
  const resetAll = useFlatSyncStore((s) => s.resetAll);
  const storeListings = useFlatSyncStore((s) => s.listings);
  const votes = useFlatSyncStore((s) => s.votes);
  const setVote = useFlatSyncStore((s) => s.setVote);
  const [expandedMatrix, setExpandedMatrix] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("combined");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const profileList = useMemo(() => Object.values(profiles), [profiles]);
  const roommates = useMemo(
    () => profileList.map((p) => ({ id: p.id, name: p.name })),
    [profileList]
  );
  const commuteState = useLiveCommuteTimes();

  const listings = useMemo(
    () => applyLiveCommuteTimes(storeListings, commuteState.data),
    [storeListings, commuteState.data]
  );

  const { passing, failing } = useMemo(() => {
    return evaluateAllListings(listings, profileList);
  }, [listings, profileList]);

  const suggestions = useMemo(() => {
    if (passing.length > 0) return [];
    return suggestRelaxations(listings, profileList);
  }, [passing.length, listings, profileList]);

  const combos = useMemo(() => {
    if (passing.length > 0) return [];
    return findConstraintConflictCombos(failing);
  }, [passing.length, failing]);

  const topThree = passing.slice(0, 3);
  const topThreeIds = new Set(topThree.map((e) => e.listing.id));

  const sortedForMatrix = useMemo(() => {
    const dir = sortDir === "desc" ? -1 : 1;
    return [...passing].sort(
      (a, b) => (getSortValue(a, sortKey) - getSortValue(b, sortKey)) * dir
    );
  }, [passing, sortKey, sortDir]);

  const visibleRows = expandedMatrix ? sortedForMatrix : sortedForMatrix.slice(0, 3);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Your trade-off breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            {passing.length > 0
              ? `${passing.length} of ${listings.length} listings pass everyone's dealbreakers. Here's the honest picture on each.`
              : `None of the ${listings.length} listings pass everyone's dealbreakers yet.`}
          </p>
          <div className="mt-2">
            <CommuteDataBadge status={commuteState.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddListingDialog />
          {topThree.length > 0 && <ShareSummaryButton topListings={topThree} />}
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Edit answers
          </Button>
          <Button variant="ghost" size="sm" onClick={resetAll}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Start over
          </Button>
        </div>
      </div>

      <WhatIfPanel
        listings={listings}
        profiles={profileList}
        baselinePassingCount={passing.length}
      />

      {passing.length === 0 && (
        <ConstraintConflictAlert failing={failing} suggestions={suggestions} combos={combos} />
      )}

      {topThree.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Top {topThree.length} recommended listing{topThree.length > 1 ? "s" : ""}
          </h3>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {topThree.map((evaluation, i) => (
              <ListingCard
                key={evaluation.listing.id}
                evaluation={evaluation}
                rank={i + 1}
                roommates={roommates}
                votes={votes[evaluation.listing.id] ?? {}}
                onVote={(roommateId, vote) => setVote(evaluation.listing.id, roommateId, vote)}
              />
            ))}
          </div>
        </section>
      )}

      {passing.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Comparative matrix
            </h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpDown className="h-3 w-3" /> Click a column to sort
              </span>
              {passing.length > 3 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setExpandedMatrix((v) => !v)}
                >
                  {expandedMatrix ? "Hide" : `Show all ${passing.length}`}
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="scrollbar-thin overflow-x-auto p-0">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="px-4 py-3 font-semibold">Listing</th>
                    <SortableHeader
                      label="Total rent"
                      sortKey="rent"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                    {profileList.map((p) => (
                      <SortableHeader
                        key={p.id}
                        label={p.name}
                        sortKey={p.id}
                        activeKey={sortKey}
                        direction={sortDir}
                        onSort={handleSort}
                      />
                    ))}
                    <SortableHeader
                      label="Combined"
                      sortKey="combined"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Fairness gap"
                      sortKey="fairness"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((evaluation) => (
                    <tr
                      key={evaluation.listing.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        topThreeIds.has(evaluation.listing.id) && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium">
                          <span>{evaluation.listing.imageEmoji}</span>
                          {evaluation.listing.name}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {evaluation.listing.locality}
                        </p>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatINR(evaluation.listing.monthlyRentTotal)}
                      </td>
                      {evaluation.roommateEvaluations.map((re) => (
                        <td key={re.roommateId} className="px-4 py-3">
                          <Badge
                            variant={
                              re.scorePercent >= 75
                                ? "success"
                                : re.scorePercent >= 50
                                ? "secondary"
                                : "warning"
                            }
                          >
                            {re.scorePercent}%
                          </Badge>
                        </td>
                      ))}
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {evaluation.combinedScorePercent}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs",
                            evaluation.fairnessGap <= 15
                              ? "text-success"
                              : evaluation.fairnessGap <= 30
                              ? "text-muted-foreground"
                              : "text-warning"
                          )}
                        >
                          <Scale className="h-3 w-3" />
                          {evaluation.fairnessGap}pt
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}

      {failing.length > 0 && passing.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Eliminated listings ({failing.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {failing.map((evaluation) => (
              <Card key={evaluation.listing.id} className="border-dashed opacity-80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {evaluation.listing.imageEmoji} {evaluation.listing.name}
                  </CardTitle>
                  <CardDescription>{evaluation.listing.locality}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-0.5">
                    {evaluation.hardConstraints.violations.slice(0, 3).map((v, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        <span className="font-medium text-destructive">{v.roommateName}:</span>{" "}
                        {v.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
