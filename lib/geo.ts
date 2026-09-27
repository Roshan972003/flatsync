import { CommuteHubKey, Coordinates } from "./types";

/**
 * Approximate real-world coordinates for each commute reference hub used in
 * the roommate form. Good enough for routing-API purposes; not surveyed
 * addresses.
 */
export const HUB_COORDINATES: Record<CommuteHubKey, Coordinates> = {
  hinjewadi: { lat: 18.5913, lng: 73.7389 },
  kharadi: { lat: 18.5515, lng: 73.9345 },
  koregaonPark: { lat: 18.5362, lng: 73.8938 },
  baner: { lat: 18.559, lng: 73.7868 },
  kothrud: { lat: 18.5074, lng: 73.8077 },
  viman_nagar: { lat: 18.5679, lng: 73.9143 },
};

export const HUB_KEYS = Object.keys(HUB_COORDINATES) as CommuteHubKey[];

export const HUB_LABELS: Record<CommuteHubKey, string> = {
  hinjewadi: "Hinjewadi",
  kharadi: "Kharadi",
  koregaonPark: "Koregaon Park",
  baner: "Baner",
  kothrud: "Kothrud",
  viman_nagar: "Viman Nagar",
};
