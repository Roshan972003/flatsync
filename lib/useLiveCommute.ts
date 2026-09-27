"use client";

import { useEffect, useState } from "react";
import { CommuteHubKey, Coordinates, Listing } from "./types";

export type CommuteMatrix = Record<string, Partial<Record<CommuteHubKey, number>>>;

export type CommuteFetchStatus = "loading" | "live" | "cache" | "unavailable";

export interface CommuteFetchState {
  status: CommuteFetchStatus;
  data: CommuteMatrix | null;
}

/**
 * Fetches a real driving-time matrix (listing -> commute hub) from the
 * /api/commute route, which proxies OSRM's public routing service. Falls
 * back silently to the static estimates already baked into each listing if
 * the routing service is unreachable or slow.
 */
export function useLiveCommuteTimes(): CommuteFetchState {
  const [state, setState] = useState<CommuteFetchState>({
    status: "loading",
    data: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/commute")
      .then((res) => res.json())
      .then((json: { commuteMinutes: CommuteMatrix | null; source: CommuteFetchStatus }) => {
        if (cancelled) return;
        setState({
          status: json.commuteMinutes ? json.source : "unavailable",
          data: json.commuteMinutes,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unavailable", data: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * One-off lookup used when a user adds a new listing: computes commute
 * minutes from that listing's coordinates to all six hubs via a single OSRM
 * request. Returns null commuteMinutes (with status "unavailable") if the
 * routing service can't be reached, so the caller can fall back to a
 * reasonable default instead of blocking the add.
 */
export async function fetchCommuteForOrigin(
  origin: Coordinates
): Promise<{ status: CommuteFetchStatus; data: Partial<Record<CommuteHubKey, number>> | null }> {
  try {
    const res = await fetch("/api/commute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin }),
    });
    const json: {
      commuteMinutes: Partial<Record<CommuteHubKey, number>> | null;
      source: CommuteFetchStatus;
    } = await res.json();
    return {
      status: json.commuteMinutes ? json.source : "unavailable",
      data: json.commuteMinutes,
    };
  } catch {
    return { status: "unavailable", data: null };
  }
}

/**
 * Overlays live commute minutes onto the static listings, per listing/hub
 * pair. Any pair the routing service couldn't resolve keeps its original
 * static estimate rather than disappearing.
 */
export function applyLiveCommuteTimes(
  listings: Listing[],
  liveData: CommuteMatrix | null
): Listing[] {
  if (!liveData) return listings;
  return listings.map((listing) => {
    const overrides = liveData[listing.id];
    if (!overrides) return listing;
    return {
      ...listing,
      commuteMinutes: { ...listing.commuteMinutes, ...overrides },
    };
  });
}
