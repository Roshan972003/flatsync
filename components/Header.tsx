"use client";

import { motion } from "framer-motion";
import { Home, Check, Circle } from "lucide-react";
import { useFlatSyncStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { RoommateId } from "@/lib/types";

const ORDER: RoommateId[] = ["riya", "meera", "kavita"];

export function Header() {
  const profiles = useFlatSyncStore((s) => s.profiles);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-none tracking-tight">FlatSync</p>
            <p className="text-xs text-muted-foreground">
              Decide together, before you fall in love with a flat.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {ORDER.map((id) => {
            const profile = profiles[id];
            return (
              <motion.div
                key={id}
                layout
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3",
                  profile.completed
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-muted/60 text-muted-foreground"
                )}
              >
                {profile.completed ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0" />
                )}
                <span>{profile.name}</span>
                <span className="hidden opacity-70 sm:inline">
                  {profile.completed ? "Done" : "Pending"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
