"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Listing } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function NetCostCalculator({
  listing,
  roommateCount,
}: {
  listing: Listing;
  roommateCount: number;
}) {
  const [maintenanceFee, setMaintenanceFee] = useState(
    String(Math.round((listing.monthlyRentTotal * 0.08) / 500) * 500)
  );
  const [maidCookMonthly, setMaidCookMonthly] = useState("3000");
  const [hasInHouseGym, setHasInHouseGym] = useState(false);
  const [externalGymCost, setExternalGymCost] = useState("1500");

  const baseRentPerPerson = listing.monthlyRentTotal / roommateCount;

  const netCostPerPerson = useMemo(() => {
    const maintenance = (Number(maintenanceFee) || 0) / roommateCount;
    const maidCook = Number(maidCookMonthly) || 0;
    const gymCost = hasInHouseGym ? 0 : Number(externalGymCost) || 0;
    return baseRentPerPerson + maintenance + maidCook + gymCost;
  }, [baseRentPerPerson, maintenanceFee, maidCookMonthly, hasInHouseGym, externalGymCost, roommateCount]);

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calculator className="h-4 w-4" /> Rent alone rarely tells the whole story — add the
        recurring extras to see the real per-person cost.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Society / maintenance, total per month (₹)</Label>
          <Input
            type="number"
            min={0}
            step={500}
            value={maintenanceFee}
            onChange={(e) => setMaintenanceFee(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Maid/cook, per person per month (₹)</Label>
          <Input
            type="number"
            min={0}
            step={500}
            value={maidCookMonthly}
            onChange={(e) => setMaidCookMonthly(e.target.value)}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-input px-3.5 py-2.5">
        <span className="text-sm font-medium">This building has an in-house gym</span>
        <Switch checked={hasInHouseGym} onCheckedChange={setHasInHouseGym} />
      </label>

      {!hasInHouseGym && (
        <div className="space-y-1.5">
          <Label>External gym membership, per person per month (₹)</Label>
          <Input
            type="number"
            min={0}
            step={100}
            value={externalGymCost}
            onChange={(e) => setExternalGymCost(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/60 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Base rent / person</p>
          <p className="text-lg font-bold tabular-nums">{formatINR(Math.round(baseRentPerPerson))}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">True net cost / person</p>
          <p className="text-lg font-bold tabular-nums text-primary">
            {formatINR(Math.round(netCostPerPerson))}
          </p>
        </div>
      </div>
    </div>
  );
}
