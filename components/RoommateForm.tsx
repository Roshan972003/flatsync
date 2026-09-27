"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, IndianRupee, MapPin, ArrowUpDown, Accessibility, Bath, PawPrint, ParkingCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlatSyncStore } from "@/lib/store";
import { RoommateId } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const COMMUTE_HUBS: { value: string; label: string }[] = [
  { value: "hinjewadi", label: "Hinjewadi" },
  { value: "kharadi", label: "Kharadi" },
  { value: "koregaonPark", label: "Koregaon Park" },
  { value: "baner", label: "Baner" },
  { value: "kothrud", label: "Kothrud" },
  { value: "viman_nagar", label: "Viman Nagar" },
];

const SOFT_PREFS: {
  key:
    | "proximityToGym"
    | "proximityToMetro"
    | "proximityToFamily"
    | "balconyImportance"
    | "floorPreferenceImportance"
    | "furnishingImportance";
  label: string;
  helper: string;
}[] = [
  { key: "proximityToGym", label: "Proximity to gym", helper: "How much does a short hop to the gym matter?" },
  { key: "proximityToMetro", label: "Proximity to metro", helper: "How much do you value being near a metro station?" },
  { key: "proximityToFamily", label: "Proximity to family / your hub", helper: "How much does distance to your reference point matter?" },
  { key: "balconyImportance", label: "Balcony", helper: "How much do you care about having a balcony?" },
  { key: "floorPreferenceImportance", label: "Floor preference", helper: "How strongly do you want your preferred floor?" },
  { key: "furnishingImportance", label: "Furnishing level", helper: "How much does furnishing level matter?" },
];

export function RoommateForm({ roommateId }: { roommateId: RoommateId }) {
  const profile = useFlatSyncStore((s) => s.profiles[roommateId]);
  const updateProfile = useFlatSyncStore((s) => s.updateProfile);
  const updateHardConstraint = useFlatSyncStore((s) => s.updateHardConstraint);
  const updateSoftPreference = useFlatSyncStore((s) => s.updateSoftPreference);
  const markCompleted = useFlatSyncStore((s) => s.markCompleted);

  const [locationDraft, setLocationDraft] = useState("");

  const addExcludedLocation = () => {
    const value = locationDraft.trim();
    if (!value) return;
    if (
      profile.hardConstraints.excludedLocations.some(
        (l) => l.toLowerCase() === value.toLowerCase()
      )
    ) {
      setLocationDraft("");
      return;
    }
    updateHardConstraint(roommateId, {
      excludedLocations: [...profile.hardConstraints.excludedLocations, value],
    });
    setLocationDraft("");
  };

  const removeExcludedLocation = (loc: string) => {
    updateHardConstraint(roommateId, {
      excludedLocations: profile.hardConstraints.excludedLocations.filter(
        (l) => l !== loc
      ),
    });
  };

  return (
    <motion.div
      key={roommateId}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Label htmlFor={`name-${roommateId}`} className="text-xs uppercase tracking-wide text-primary">
          Filling this in as
        </Label>
        <Input
          id={`name-${roommateId}`}
          value={profile.name}
          onChange={(e) => updateProfile(roommateId, { name: e.target.value })}
          className="mt-1.5 border-primary/30 bg-background text-base font-semibold"
        />
      </div>

      {/* Hard constraints */}
      <section className="space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Dealbreakers
          </h3>
          <p className="text-xs text-muted-foreground">
            Any listing that violates one of these is eliminated automatically — for everyone.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" /> Max monthly contribution
            </Label>
            <Input
              type="number"
              min={0}
              step={500}
              value={profile.hardConstraints.maxBudget}
              onChange={(e) =>
                updateHardConstraint(roommateId, {
                  maxBudget: Number(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              {formatINR(profile.hardConstraints.maxBudget)} / month, your share
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" /> Minimum bathrooms
            </Label>
            <Select
              value={String(profile.hardConstraints.minBathrooms)}
              onValueChange={(v) =>
                updateHardConstraint(roommateId, { minBathrooms: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}+ bathroom{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" /> Commute reference point
            </Label>
            <Select
              value={profile.hardConstraints.commuteDestination}
              onValueChange={(v) =>
                updateHardConstraint(roommateId, { commuteDestination: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUTE_HUBS.map((hub) => (
                  <SelectItem key={hub.value} value={hub.value}>
                    {hub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max commute (minutes)</Label>
            <div className="flex items-center gap-3 pt-1.5">
              <Slider
                min={5}
                max={75}
                step={5}
                value={[profile.hardConstraints.maxCommuteMinutes]}
                onValueChange={([v]) =>
                  updateHardConstraint(roommateId, { maxCommuteMinutes: v })
                }
              />
              <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                {profile.hardConstraints.maxCommuteMinutes}m
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Excluded localities
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Hadapsar — press Enter to add"
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addExcludedLocation();
                }
              }}
            />
          </div>
          {profile.hardConstraints.excludedLocations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.hardConstraints.excludedLocations.map((loc) => (
                <Badge key={loc} variant="secondary" className="gap-1">
                  {loc}
                  <button
                    type="button"
                    onClick={() => removeExcludedLocation(loc)}
                    className="rounded-full hover:bg-black/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-input px-3.5 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Accessibility className="h-4 w-4 text-muted-foreground" /> Lift required
            </span>
            <Switch
              checked={profile.hardConstraints.requiresLift}
              onCheckedChange={(v) =>
                updateHardConstraint(roommateId, { requiresLift: v })
              }
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-input px-3.5 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <PawPrint className="h-4 w-4 text-muted-foreground" /> Pet-friendly required
            </span>
            <Switch
              checked={profile.hardConstraints.petFriendlyRequired}
              onCheckedChange={(v) =>
                updateHardConstraint(roommateId, { petFriendlyRequired: v })
              }
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-input px-3.5 py-3 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <ParkingCircle className="h-4 w-4 text-muted-foreground" /> Dedicated parking required
            </span>
            <Switch
              checked={profile.hardConstraints.parkingRequired}
              onCheckedChange={(v) =>
                updateHardConstraint(roommateId, { parkingRequired: v })
              }
            />
          </label>
        </div>
      </section>

      <Separator />

      {/* Soft preferences */}
      <section className="space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Nice-to-haves
          </h3>
          <p className="text-xs text-muted-foreground">
            Rate 1 (don&apos;t care) to 5 (really matters) — used to rank listings that already pass everyone&apos;s dealbreakers.
          </p>
        </div>

        <div className="space-y-5">
          {SOFT_PREFS.map((pref) => (
            <div key={pref.key} className="space-y-1.5">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <Label>{pref.label}</Label>
                <span className="text-xs text-muted-foreground">{pref.helper}</span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[profile.softPreferences[pref.key]]}
                  onValueChange={([v]) =>
                    updateSoftPreference(roommateId, { [pref.key]: v })
                  }
                />
                <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {profile.softPreferences[pref.key]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Preferred floor</Label>
            <Select
              value={profile.preferredFloor}
              onValueChange={(v) =>
                updateProfile(roommateId, {
                  preferredFloor: v as typeof profile.preferredFloor,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-preference">No preference</SelectItem>
                <SelectItem value="low">Low floor</SelectItem>
                <SelectItem value="mid">Mid floor</SelectItem>
                <SelectItem value="high">High floor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Furnishing level</Label>
            <Select
              value={profile.furnishingLevel}
              onValueChange={(v) =>
                updateProfile(roommateId, {
                  furnishingLevel: v as typeof profile.furnishingLevel,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
                <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                <SelectItem value="fully-furnished">Fully-furnished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Your reference point</Label>
            <Input
              placeholder="e.g. gym / family home"
              value={profile.familyLocation ?? ""}
              onChange={(e) =>
                updateProfile(roommateId, { familyLocation: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            {profile.completed ? "Marked as done" : "Not marked as done yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            Mark yourself done once you&apos;re happy with your answers.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={profile.completed}
            onCheckedChange={(v) => markCompleted(roommateId, v)}
          />
          Done
        </label>
      </div>
    </motion.div>
  );
}
