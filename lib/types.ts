export type RoommateId = "riya" | "meera" | "kavita";

export type CommuteHubKey =
  | "hinjewadi"
  | "kharadi"
  | "koregaonPark"
  | "baner"
  | "kothrud"
  | "viman_nagar";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HardConstraints {
  maxBudget: number;
  excludedLocations: string[];
  maxCommuteMinutes: number;
  commuteDestination: string;
  requiresLift: boolean;
  minBathrooms: number;
  petFriendlyRequired: boolean;
  parkingRequired: boolean;
}

export interface SoftPreferences {
  proximityToGym: number;
  proximityToMetro: number;
  proximityToFamily: number;
  balconyImportance: number;
  floorPreferenceImportance: number;
  furnishingImportance: number;
}

export interface RoommateProfile {
  id: RoommateId;
  name: string;
  completed: boolean;
  hardConstraints: HardConstraints;
  softPreferences: SoftPreferences;
  gymLocation?: string;
  familyLocation?: string;
  preferredFloor?: "low" | "mid" | "high" | "no-preference";
  furnishingLevel?: "unfurnished" | "semi-furnished" | "fully-furnished";
}

export interface Listing {
  id: string;
  name: string;
  locality: string;
  city: string;
  monthlyRentTotal: number;
  hasLift: boolean;
  floor: number;
  totalFloors: number;
  bathrooms: number;
  petFriendly: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  furnishing: "unfurnished" | "semi-furnished" | "fully-furnished";
  commuteMinutes: Record<CommuteHubKey, number>;
  coordinates: Coordinates;
  distanceToMetroKm: number;
  distanceToGymKm: number;
  imageEmoji: string;
  description: string;
}

export type ConstraintKey =
  | "budget"
  | "location"
  | "commute"
  | "lift"
  | "bathrooms"
  | "pet"
  | "parking";

export interface HardConstraintViolation {
  roommateId: RoommateId;
  roommateName: string;
  constraint: ConstraintKey;
  label: string;
  detail: string;
}

export interface HardConstraintResult {
  passed: boolean;
  violations: HardConstraintViolation[];
}

export interface SoftScoreBreakdownItem {
  label: string;
  earned: number;
  possible: number;
  status: "win" | "compromise" | "neutral";
  detail: string;
}

export interface RoommateEvaluation {
  roommateId: RoommateId;
  roommateName: string;
  score: number;
  maxScore: number;
  scorePercent: number;
  breakdown: SoftScoreBreakdownItem[];
  wins: string[];
  compromises: string[];
}

export interface ListingEvaluation {
  listing: Listing;
  hardConstraints: HardConstraintResult;
  roommateEvaluations: RoommateEvaluation[];
  combinedScore: number;
  combinedScorePercent: number;
  fairnessGap: number;
}
