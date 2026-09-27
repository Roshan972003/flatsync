"use client";

import { motion } from "framer-motion";
import { Home, Heart, Users, ListChecks, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS_PREVIEW = [
  {
    icon: Users,
    title: "Everyone answers separately",
    detail: "Riya, Meera and Kavita each fill in their own dealbreakers and nice-to-haves.",
  },
  {
    icon: Sparkles,
    title: "We do the matching",
    detail: "Every listing gets checked against everyone's rules — no exceptions, no guilt.",
  },
  {
    icon: ListChecks,
    title: "You see the honest trade-offs",
    detail: "Who wins, who compromises, and by how much — laid out before anyone visits a flat.",
  },
];

export function WelcomePage({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center px-4 py-10"
    >
      <div className="w-full max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 16 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"
        >
          <Home className="h-8 w-8" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Hey, welcome to FlatSync 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-4 max-w-xl text-base text-muted-foreground"
        >
          Finding a flat with roommates shouldn&apos;t mean someone&apos;s knee, someone&apos;s
          commute, or someone&apos;s gym gets discovered as a dealbreaker <em>after</em>{" "}
          everyone&apos;s already fallen for the place. Let&apos;s sort that out first, together
          — it only takes a few minutes each.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {STEPS_PREVIEW.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <Button size="lg" onClick={onStart} className="gap-2 px-8">
            Let&apos;s find our flat
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3 text-primary" /> Made for the three of you, not just one
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
