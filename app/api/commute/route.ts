import { NextResponse } from "next/server";
import { mockListings } from "@/lib/mockListings";
import { HUB_COORDINATES, HUB_KEYS } from "@/lib/geo";
import { CommuteHubKey, Coordinates } from "@/lib/types";

export const dynamic = "force-dynamic";

type CommuteMatrix = Record<string, Partial<Record<CommuteHubKey, number>>>;

interface CommuteCache {
  data: CommuteMatrix;
  timestamp: number;
}

let cache: CommuteCache | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000;
const OSRM_TIMEOUT_MS = 6000;

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ commuteMinutes: cache.data, source: "cache" });
  }

  try {
    const coordsList = [
      ...mockListings.map((l) => l.coordinates),
      ...HUB_KEYS.map((k) => HUB_COORDINATES[k]),
    ];
    const coordsParam = coordsList.map((c) => `${c.lng},${c.lat}`).join(";");
    const sources = mockListings.map((_, i) => i).join(";");
    const destinations = HUB_KEYS.map((_, i) => mockListings.length + i).join(";");

    const url =
      `https://router.project-osrm.org/table/v1/driving/${coordsParam}` +
      `?sources=${sources}&destinations=${destinations}&annotations=duration`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`OSRM responded with status ${response.status}`);
    }

    const json = (await response.json()) as {
      code: string;
      durations?: (number | null)[][];
    };

    if (json.code !== "Ok" || !json.durations) {
      throw new Error("OSRM returned no route matrix");
    }

    const result: CommuteMatrix = {};
    mockListings.forEach((listing, i) => {
      result[listing.id] = {};
      HUB_KEYS.forEach((hub, j) => {
        const seconds = json.durations?.[i]?.[j];
        if (typeof seconds === "number") {
          result[listing.id][hub] = Math.round(seconds / 60);
        }
      });
    });

    cache = { data: result, timestamp: Date.now() };
    return NextResponse.json({ commuteMinutes: result, source: "live" });
  } catch (error) {
    return NextResponse.json({
      commuteMinutes: null,
      source: "unavailable",
      error: error instanceof Error ? error.message : "Unknown routing error",
    });
  }
}

/**
 * Computes commute minutes from a single arbitrary origin (used when a user
 * adds a new listing) to each of the six commute hubs, via one OSRM table
 * request (1 source x 6 destinations).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { origin?: Coordinates };
    const origin = body?.origin;
    if (
      !origin ||
      typeof origin.lat !== "number" ||
      typeof origin.lng !== "number"
    ) {
      return NextResponse.json(
        { commuteMinutes: null, source: "unavailable", error: "Missing origin coordinates" },
        { status: 400 }
      );
    }

    const coordsList = [origin, ...HUB_KEYS.map((k) => HUB_COORDINATES[k])];
    const coordsParam = coordsList.map((c) => `${c.lng},${c.lat}`).join(";");
    const destinations = HUB_KEYS.map((_, i) => i + 1).join(";");

    const url =
      `https://router.project-osrm.org/table/v1/driving/${coordsParam}` +
      `?sources=0&destinations=${destinations}&annotations=duration`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`OSRM responded with status ${response.status}`);
    }

    const json = (await response.json()) as {
      code: string;
      durations?: (number | null)[][];
    };

    if (json.code !== "Ok" || !json.durations) {
      throw new Error("OSRM returned no route matrix");
    }

    const row = json.durations[0];
    const commuteMinutes: Partial<Record<CommuteHubKey, number>> = {};
    HUB_KEYS.forEach((hub, j) => {
      const seconds = row?.[j];
      if (typeof seconds === "number") {
        commuteMinutes[hub] = Math.round(seconds / 60);
      }
    });

    return NextResponse.json({ commuteMinutes, source: "live" });
  } catch (error) {
    return NextResponse.json({
      commuteMinutes: null,
      source: "unavailable",
      error: error instanceof Error ? error.message : "Unknown routing error",
    });
  }
}
