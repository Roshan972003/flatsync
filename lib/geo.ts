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

export interface LocalityOption {
  key: string;
  label: string;
  coordinates: Coordinates;
}

/**
 * Curated list of real Pune localities with approximate coordinates, used by
 * the "add a listing" form so a new listing's commute times can be computed
 * from a real routing API instead of typed in by hand.
 */
export const PUNE_LOCALITIES: LocalityOption[] = [
  { key: "baner", label: "Baner", coordinates: HUB_COORDINATES.baner },
  { key: "wakad", label: "Wakad", coordinates: { lat: 18.5987, lng: 73.7645 } },
  { key: "kothrud", label: "Kothrud", coordinates: HUB_COORDINATES.kothrud },
  { key: "viman_nagar", label: "Viman Nagar", coordinates: HUB_COORDINATES.viman_nagar },
  { key: "hinjewadi", label: "Hinjewadi", coordinates: HUB_COORDINATES.hinjewadi },
  { key: "koregaon_park", label: "Koregaon Park", coordinates: HUB_COORDINATES.koregaonPark },
  { key: "kharadi", label: "Kharadi", coordinates: HUB_COORDINATES.kharadi },
  { key: "aundh", label: "Aundh", coordinates: { lat: 18.5643, lng: 73.8077 } },
  { key: "deccan", label: "Deccan Gymkhana", coordinates: { lat: 18.5158, lng: 73.8412 } },
  { key: "camp", label: "Camp", coordinates: { lat: 18.5089, lng: 73.8789 } },
  { key: "hadapsar", label: "Hadapsar", coordinates: { lat: 18.5089, lng: 73.926 } },
  { key: "magarpatta", label: "Magarpatta", coordinates: { lat: 18.515, lng: 73.928 } },
  { key: "bavdhan", label: "Bavdhan", coordinates: { lat: 18.5089, lng: 73.7643 } },
  { key: "pimple_saudagar", label: "Pimple Saudagar", coordinates: { lat: 18.5989, lng: 73.8022 } },
  { key: "shivaji_nagar", label: "Shivaji Nagar", coordinates: { lat: 18.5308, lng: 73.8475 } },
];
