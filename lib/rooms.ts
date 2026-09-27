import { RoomKey } from "./types";

export interface RoomDefinition {
  key: RoomKey;
  label: string;
  weight: number;
  hasEnsuiteBath: boolean;
}

/**
 * Generic 3BHK room layout used to differentially split rent by room size
 * and bath access, instead of assuming an even three-way split. Weights are
 * relative floor-area + amenity proxies, not surveyed from a real unit.
 */
export const ROOM_DEFINITIONS: RoomDefinition[] = [
  { key: "master", label: "Master Bedroom + En-suite", weight: 1.4, hasEnsuiteBath: true },
  { key: "bedroom2", label: "Bedroom 2", weight: 1.0, hasEnsuiteBath: false },
  { key: "bedroom3", label: "Bedroom 3", weight: 0.9, hasEnsuiteBath: false },
];

export function splitRentByRooms(
  totalRent: number,
  assignments: { roomKey: RoomKey }[]
): number[] {
  const weights = assignments.map(
    (a) => ROOM_DEFINITIONS.find((r) => r.key === a.roomKey)?.weight ?? 1
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const rawShares = weights.map((w) => (totalRent * w) / totalWeight);
  const roundedShares = rawShares.map((s) => Math.round(s));

  // Nudge the largest share so the parts sum exactly to totalRent (rounding
  // can leave the total off by a rupee or two).
  const roundedTotal = roundedShares.reduce((sum, s) => sum + s, 0);
  const diff = totalRent - roundedTotal;
  if (diff !== 0) {
    const maxIndex = roundedShares.indexOf(Math.max(...roundedShares));
    roundedShares[maxIndex] += diff;
  }

  return roundedShares;
}
