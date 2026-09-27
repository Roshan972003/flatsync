/**
 * There's no live traffic API wired in, so peak-hour commute times are a
 * clearly-labeled heuristic: a deterministic multiplier (1.30x-1.59x) derived
 * from the listing+hub name, not measured. It's meant to set expectations
 * ("this will feel worse at 6pm"), not to be read as precise.
 */
export function estimatePeakMultiplier(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 1.3 + (hash % 30) / 100;
}

export function estimatePeakMinutes(offPeakMinutes: number, seed: string): number {
  return Math.round(offPeakMinutes * estimatePeakMultiplier(seed));
}
