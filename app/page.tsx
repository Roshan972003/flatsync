"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { RoommateForm } from "@/components/RoommateForm";
import { ComparisonDashboard } from "@/components/ComparisonDashboard";
import { StepIndicator } from "@/components/StepIndicator";
import { WelcomePage } from "@/components/WelcomePage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFlatSyncStore } from "@/lib/store";
import { RoommateId } from "@/lib/types";
import { clearSharedStateFromLocation, readSharedStateFromLocation } from "@/lib/urlState";

const ROOMMATES: { id: RoommateId; label: string }[] = [
  { id: "riya", label: "Riya" },
  { id: "meera", label: "Meera" },
  { id: "kavita", label: "Kavita" },
];

function InputPhase() {
  const profiles = useFlatSyncStore((s) => s.profiles);
  const activeRoommate = useFlatSyncStore((s) => s.activeRoommate);
  const setActiveRoommate = useFlatSyncStore((s) => s.setActiveRoommate);
  const goToStep = useFlatSyncStore((s) => s.goToStep);

  const completedCount = Object.values(profiles).filter((p) => p.completed).length;
  const allDone = completedCount === ROOMMATES.length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              One form. Three people. One clear answer.
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Each of you fills in your own dealbreakers and preferences, separately.
              We&apos;ll cross them against real listings and show exactly what everyone
              gets — and gives up — before anyone gets attached to a flat.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {completedCount}/{ROOMMATES.length} profiles done
            </span>
          </div>
        </div>
        <Progress
          value={(completedCount / ROOMMATES.length) * 100}
          className="mt-4"
        />
      </div>

      <Tabs
        value={activeRoommate}
        onValueChange={(v) => setActiveRoommate(v as RoommateId)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {ROOMMATES.map((r) => (
              <TabsTrigger key={r.id} value={r.id} className="gap-1.5">
                {r.label}
                {profiles[r.id].completed && (
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {ROOMMATES.map((r) => (
          <TabsContent key={r.id} value={r.id}>
            <div className="rounded-2xl border border-border bg-card p-5 pb-24 sm:p-7 sm:pb-24">
              <AnimatePresence mode="wait">
                <RoommateForm roommateId={r.id} />
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-3 py-3">
          <span className="text-sm text-muted-foreground">
            {allDone ? (
              <span className="font-medium text-success">Everyone&apos;s in — ready to match.</span>
            ) : (
              `${completedCount}/${ROOMMATES.length} done — mark each person done when they're ready.`
            )}
          </span>
          <Button
            size="lg"
            disabled={!allDone}
            onClick={() => goToStep(2)}
            className="shrink-0 gap-2"
          >
            Reveal our matches
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EvaluationTransition() {
  const goToStep = useFlatSyncStore((s) => s.goToStep);

  useEffect(() => {
    const timer = setTimeout(() => goToStep(3), 1400);
    return () => clearTimeout(timer);
  }, [goToStep]);

  const lines = [
    "Filtering out anything that breaks a dealbreaker...",
    "Scoring the survivors against everyone's preferences...",
    "Building your trade-off breakdown...",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-6 py-24 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      >
        <Loader2 className="h-10 w-10 text-primary" />
      </motion.div>
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.35 }}
            className="text-sm text-muted-foreground"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

export default function Page() {
  const currentStep = useFlatSyncStore((s) => s.currentStep);
  const goToStep = useFlatSyncStore((s) => s.goToStep);
  const loadDemoScenario = useFlatSyncStore((s) => s.loadDemoScenario);
  const hydrateFromShared = useFlatSyncStore((s) => s.hydrateFromShared);
  const [hydrated, setHydrated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const shared = readSharedStateFromLocation();
    if (shared) {
      hydrateFromShared(shared);
      clearSharedStateFromLocation();
      setShowWelcome(false);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen gradient-mesh">
      <Header />
      <main className="container py-8">
        {!hydrated ? null : (
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <motion.div key="welcome">
                <WelcomePage
                  onStart={() => setShowWelcome(false)}
                  onLoadDemo={() => {
                    loadDemoScenario();
                    setShowWelcome(false);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div key="app">
                <StepIndicator currentStep={currentStep} />
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div key="step1" exit={{ opacity: 0 }}>
                      <InputPhase />
                    </motion.div>
                  )}
                  {currentStep === 2 && (
                    <motion.div key="step2">
                      <EvaluationTransition />
                    </motion.div>
                  )}
                  {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <ComparisonDashboard onBack={() => goToStep(1)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
