"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, MapPin, IndianRupee, Trophy, MessageSquareQuote, Sparkles, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadarScore } from "@/components/RadarScore";
import { VotePanel } from "@/components/VotePanel";
import { RoomRentSplitter } from "@/components/RoomRentSplitter";
import { NetCostCalculator } from "@/components/NetCostCalculator";
import { CommuteMatrix } from "@/components/CommuteMatrix";
import { PropertyVisitChecklist } from "@/components/PropertyVisitChecklist";
import { BrokerInquiryDialog } from "@/components/BrokerInquiryDialog";
import { Separator } from "@/components/ui/separator";
import { useFlatSyncStore } from "@/lib/store";
import { ListingEvaluation, ListingVotes, RoommateId, VoteValue } from "@/lib/types";
import { buildTradeoffSummary } from "@/lib/matchEngine";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

function RoommateQuickLine({
  evaluation,
}: {
  evaluation: ListingEvaluation["roommateEvaluations"][number];
}) {
  const topWin = evaluation.wins[0];
  const topCompromise = evaluation.compromises[0];

  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-16 shrink-0 font-semibold">{evaluation.roommateName}</span>
      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {topWin && (
          <span className="inline-flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> {topWin}
          </span>
        )}
        {topCompromise && (
          <span className="inline-flex items-center gap-1 text-warning">
            <AlertTriangle className="h-3.5 w-3.5" /> {topCompromise}
          </span>
        )}
        {!topWin && !topCompromise && (
          <span className="text-muted-foreground">No strong signal either way</span>
        )}
      </div>
    </div>
  );
}

export function ListingCard({
  evaluation,
  rank,
  roommates,
  votes,
  onVote,
}: {
  evaluation: ListingEvaluation;
  rank: number;
  roommates: { id: RoommateId; name: string }[];
  votes: ListingVotes;
  onVote: (roommateId: RoommateId, vote: VoteValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const { listing, roommateEvaluations, combinedScorePercent, fairnessGap } = evaluation;
  const tradeoffSummary = useMemo(() => buildTradeoffSummary(evaluation), [evaluation]);
  const checklist = useFlatSyncStore((s) => s.visitChecklists[listing.id] ?? {});
  const setChecklistItem = useFlatSyncStore((s) => s.setChecklistItem);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: rank * 0.08 }}
      >
        <Card className="relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
          {rank === 1 && (
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold text-primary-foreground shadow">
              <Trophy className="h-3 w-3" /> Top pick
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl">
                {listing.imageEmoji}
              </div>
              <div>
                <CardTitle className="text-base">{listing.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {listing.locality}, {listing.city}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Matches 100% of hard constraints
              </Badge>
              <Badge variant="outline" className="gap-1">
                <IndianRupee className="h-3 w-3" /> {formatINR(listing.monthlyRentTotal)}/mo total
              </Badge>
              {fairnessGap <= 15 && (
                <Badge variant="secondary">Evenly balanced</Badge>
              )}
              {evaluation.compromiseFairness.isImbalanced && (
                <Badge variant="warning" className="gap-1">
                  <Scale className="h-3 w-3" /> {evaluation.compromiseFairness.dominantRoommateName}{" "}
                  carries {evaluation.compromiseFairness.dominantSharePercent}% of the compromises
                </Badge>
              )}
              {listing.isCustom && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Added by your group
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <RadarScore roommateEvaluations={roommateEvaluations} />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Combined match score</span>
                  <span className="font-semibold text-foreground">{combinedScorePercent}%</span>
                </div>
                <Progress value={combinedScorePercent} />
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              {roommateEvaluations.map((re) => (
                <RoommateQuickLine key={re.roommateId} evaluation={re} />
              ))}
            </div>

            <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground">
              {tradeoffSummary}
            </p>

            <VotePanel roommates={roommates} votes={votes} onVote={onVote} />

            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(true)}>
                See full trade-off breakdown
              </Button>
              <BrokerInquiryDialog listing={listing} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {listing.imageEmoji} {listing.name}
            </DialogTitle>
            <DialogDescription>
              {listing.locality}, {listing.city} — {formatINR(listing.monthlyRentTotal)}/month total
              ({formatINR(listing.monthlyRentTotal / 3)}/person)
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rooms">Rooms & costs</TabsTrigger>
              <TabsTrigger value="commute">Commute</TabsTrigger>
              <TabsTrigger value="visit">Visit checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5">
              <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Trade-off summary
                  </p>
                  <p className="mt-0.5 text-sm text-foreground/90">{tradeoffSummary}</p>
                </div>
              </div>

              <div className="space-y-5">
                {roommateEvaluations.map((re) => (
                  <div key={re.roommateId} className="rounded-lg border border-border p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{re.roommateName}</p>
                        <Badge
                          variant={
                            re.wins.length > re.compromises.length
                              ? "success"
                              : re.compromises.length > re.wins.length
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[0.65rem]"
                        >
                          {re.wins.length > re.compromises.length
                            ? "Mostly wins"
                            : re.compromises.length > re.wins.length
                            ? "Mostly compromises"
                            : "Balanced"}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {re.scorePercent}% match
                      </span>
                    </div>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {re.breakdown
                        .filter((b) => b.possible > 0)
                        .map((b, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
                              b.status === "win" && "bg-success/10 text-success",
                              b.status === "compromise" && "bg-warning/10 text-warning"
                            )}
                          >
                            {b.status === "win" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <span>
                              {b.label}: {b.detail}
                            </span>
                          </div>
                        ))}
                    </div>
                    {re.compromises.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Gives up:</span>{" "}
                        {re.compromises.join("; ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-5">
              <RoomRentSplitter listing={listing} roommates={roommates} />
              <Separator />
              <NetCostCalculator listing={listing} roommateCount={roommates.length} />
            </TabsContent>

            <TabsContent value="commute">
              <CommuteMatrix listing={listing} />
            </TabsContent>

            <TabsContent value="visit">
              <PropertyVisitChecklist
                checklist={checklist}
                onUpdate={(item, patch) => setChecklistItem(listing.id, item, patch)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
