"use client";

import { useMemo, useState } from "react";
import { BedDouble, ShowerHead } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROOM_DEFINITIONS, splitRentByRooms } from "@/lib/rooms";
import { Listing, RoomKey, RoommateId } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function RoomRentSplitter({
  listing,
  roommates,
}: {
  listing: Listing;
  roommates: { id: RoommateId; name: string }[];
}) {
  const [assignments, setAssignments] = useState<Record<RoommateId, RoomKey>>(() => {
    const initial: Record<string, RoomKey> = {};
    roommates.forEach((r, i) => {
      initial[r.id] = ROOM_DEFINITIONS[i]?.key ?? ROOM_DEFINITIONS[0].key;
    });
    return initial as Record<RoommateId, RoomKey>;
  });

  const duplicateRooms = useMemo(() => {
    const counts: Partial<Record<RoomKey, number>> = {};
    Object.values(assignments).forEach((room) => {
      counts[room] = (counts[room] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => (count ?? 0) > 1)
      .map(([room]) => room as RoomKey);
  }, [assignments]);

  const equalShare = Math.round(listing.monthlyRentTotal / roommates.length);

  const weightedShares = useMemo(() => {
    if (duplicateRooms.length > 0) return null;
    const shares = splitRentByRooms(
      listing.monthlyRentTotal,
      roommates.map((r) => ({ roomKey: assignments[r.id] }))
    );
    return roommates.reduce((acc, r, i) => {
      acc[r.id] = shares[i];
      return acc;
    }, {} as Record<RoommateId, number>);
  }, [assignments, duplicateRooms.length, listing.monthlyRentTotal, roommates]);

  if (listing.bedrooms < roommates.length) {
    return (
      <p className="text-sm text-muted-foreground">
        This listing has fewer bedrooms ({listing.bedrooms}) than roommates — room-by-room
        splitting isn&apos;t meaningful here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Instead of splitting rent three ways evenly, assign each person a room and see what a
        size- and amenity-weighted split would look like.
      </p>

      <div className="space-y-2">
        {roommates.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
            <span className="w-16 shrink-0 text-sm font-semibold">{r.name}</span>
            <Select
              value={assignments[r.id]}
              onValueChange={(v) =>
                setAssignments((prev) => ({ ...prev, [r.id]: v as RoomKey }))
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_DEFINITIONS.map((room) => (
                  <SelectItem key={room.key} value={room.key}>
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5" />
                      {room.label}
                      {room.hasEnsuiteBath && <ShowerHead className="h-3 w-3 opacity-60" />}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="w-24 shrink-0 text-right text-sm font-bold tabular-nums">
              {weightedShares ? formatINR(weightedShares[r.id]) : "—"}
            </span>
          </div>
        ))}
      </div>

      {duplicateRooms.length > 0 ? (
        <p className="text-xs text-warning">
          Two people can&apos;t take the same room — pick a different one for each person to
          see the split.
        </p>
      ) : (
        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <p>
            Equal split would be {formatINR(equalShare)} each. With this room assignment, the
            master bedroom&apos;s occupant pays more and bedroom 3&apos;s occupant pays less —
            proportional to room weight, not a flat 1/3 each.
          </p>
        </div>
      )}
    </div>
  );
}
