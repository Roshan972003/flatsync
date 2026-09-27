"use client";

import { useState } from "react";
import { Plus, Loader2, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HUB_KEYS, PUNE_LOCALITIES } from "@/lib/geo";
import { fetchCommuteForOrigin } from "@/lib/useLiveCommute";
import { useFlatSyncStore } from "@/lib/store";
import { CommuteHubKey, Listing } from "@/lib/types";

const DEFAULT_EMOJI = "🏠";
const FALLBACK_COMMUTE_MINUTES = 30;

const initialFormState = {
  name: "",
  localityKey: PUNE_LOCALITIES[0].key,
  monthlyRentTotal: "40000",
  bathrooms: "2",
  bedrooms: "3",
  floor: "2",
  totalFloors: "5",
  furnishing: "semi-furnished" as Listing["furnishing"],
  hasLift: true,
  petFriendly: true,
  hasParking: true,
  hasBalcony: true,
  distanceToMetroKm: "2.0",
  distanceToGymKm: "1.5",
  description: "",
};

export function AddListingDialog() {
  const addListing = useFlatSyncStore((s) => s.addListing);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);

  const resetForm = () => {
    setForm(initialFormState);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Give the listing a name.");
      return;
    }
    const rent = Number(form.monthlyRentTotal);
    if (!rent || rent <= 0) {
      setError("Enter a monthly rent above zero.");
      return;
    }

    const locality = PUNE_LOCALITIES.find((l) => l.key === form.localityKey);
    if (!locality) {
      setError("Pick a locality.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const { data: liveCommute } = await fetchCommuteForOrigin(locality.coordinates);

    const commuteMinutes = HUB_KEYS.reduce((acc, hub) => {
      acc[hub] = liveCommute?.[hub] ?? FALLBACK_COMMUTE_MINUTES;
      return acc;
    }, {} as Record<CommuteHubKey, number>);

    const newListing: Listing = {
      id: `listing-custom-${Date.now()}`,
      name: form.name.trim(),
      locality: locality.label,
      city: "Pune",
      monthlyRentTotal: rent,
      hasLift: form.hasLift,
      floor: Number(form.floor) || 1,
      totalFloors: Number(form.totalFloors) || 1,
      bathrooms: Number(form.bathrooms) || 1,
      bedrooms: Number(form.bedrooms) || 1,
      petFriendly: form.petFriendly,
      hasParking: form.hasParking,
      hasBalcony: form.hasBalcony,
      furnishing: form.furnishing,
      commuteMinutes,
      coordinates: locality.coordinates,
      distanceToMetroKm: Number(form.distanceToMetroKm) || 2,
      distanceToGymKm: Number(form.distanceToGymKm) || 2,
      imageEmoji: DEFAULT_EMOJI,
      description: form.description.trim() || `Added by your group in ${locality.label}.`,
      isCustom: true,
    };

    addListing(newListing);
    setSubmitting(false);
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" /> Add a listing
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a listing</DialogTitle>
          <DialogDescription>
            Pick a real Pune locality and we&apos;ll fetch live commute times to
            everyone&apos;s reference points automatically, same as the built-in listings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Listing name</Label>
              <Input
                placeholder="e.g. Aundh Riverside Residency"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPinned className="h-3.5 w-3.5" /> Locality
              </Label>
              <Select
                value={form.localityKey}
                onValueChange={(v) => setForm((f) => ({ ...f, localityKey: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PUNE_LOCALITIES.map((l) => (
                    <SelectItem key={l.key} value={l.key}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Monthly rent, total (₹)</Label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={form.monthlyRentTotal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlyRentTotal: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bathrooms</Label>
              <Select
                value={form.bathrooms}
                onValueChange={(v) => setForm((f) => ({ ...f, bathrooms: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Bedrooms</Label>
              <Select
                value={form.bedrooms}
                onValueChange={(v) => setForm((f) => ({ ...f, bedrooms: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Furnishing</Label>
              <Select
                value={form.furnishing}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, furnishing: v as Listing["furnishing"] }))
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

            <div className="space-y-1.5">
              <Label>Floor</Label>
              <Input
                type="number"
                min={0}
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Total floors in building</Label>
              <Input
                type="number"
                min={1}
                value={form.totalFloors}
                onChange={(e) => setForm((f) => ({ ...f, totalFloors: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Distance to metro (km)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.distanceToMetroKm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, distanceToMetroKm: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Distance to a gym (km)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.distanceToGymKm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, distanceToGymKm: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["hasLift", "Has a lift"],
                ["petFriendly", "Pet-friendly"],
                ["hasParking", "Dedicated parking"],
                ["hasBalcony", "Has a balcony"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-input px-3.5 py-2.5"
              >
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={form[key]}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                />
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Anything worth flagging about this place..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching real commute times…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add listing
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
