import {
  ConstraintKey,
  HardConstraintResult,
  HardConstraintViolation,
  Listing,
  ListingEvaluation,
  RoommateEvaluation,
  RoommateId,
  RoommateProfile,
  SoftScoreBreakdownItem,
} from "./types";

const ROOMMATE_COUNT_DIVISOR = 3;

interface RelaxationIgnore {
  roommateId: RoommateId;
  constraint: ConstraintKey;
}

function checkHardConstraints(
  listing: Listing,
  profiles: RoommateProfile[],
  ignore?: RelaxationIgnore
): HardConstraintResult {
  const violations: HardConstraintViolation[] = [];
  const perPersonShare = listing.monthlyRentTotal / ROOMMATE_COUNT_DIVISOR;

  const isIgnored = (roommateId: RoommateId, constraint: ConstraintKey) =>
    ignore?.roommateId === roommateId && ignore?.constraint === constraint;

  for (const profile of profiles) {
    const hc = profile.hardConstraints;

    if (perPersonShare > hc.maxBudget && !isIgnored(profile.id, "budget")) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "budget",
        label: "Over budget",
        detail: `Your share would be ₹${Math.round(
          perPersonShare
        ).toLocaleString("en-IN")}, above your ₹${hc.maxBudget.toLocaleString(
          "en-IN"
        )} cap.`,
      });
    }

    if (
      hc.excludedLocations.some(
        (loc) => loc.toLowerCase() === listing.locality.toLowerCase()
      ) &&
      !isIgnored(profile.id, "location")
    ) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "location",
        label: "Excluded location",
        detail: `${listing.locality} is on your excluded-locations list.`,
      });
    }

    const commuteKey = hc.commuteDestination as keyof Listing["commuteMinutes"];
    const commuteValue = listing.commuteMinutes[commuteKey];
    if (
      typeof commuteValue === "number" &&
      commuteValue > hc.maxCommuteMinutes &&
      !isIgnored(profile.id, "commute")
    ) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "commute",
        label: "Commute too long",
        detail: `${commuteValue} min commute exceeds your ${hc.maxCommuteMinutes} min limit.`,
      });
    }

    if (hc.requiresLift && !listing.hasLift && !isIgnored(profile.id, "lift")) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "lift",
        label: "No lift",
        detail: `This building has no lift and you require one.`,
      });
    }

    if (listing.bathrooms < hc.minBathrooms && !isIgnored(profile.id, "bathrooms")) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "bathrooms",
        label: "Too few bathrooms",
        detail: `Only ${listing.bathrooms} bathroom(s), you need at least ${hc.minBathrooms}.`,
      });
    }

    if (hc.petFriendlyRequired && !listing.petFriendly && !isIgnored(profile.id, "pet")) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "pet",
        label: "Not pet-friendly",
        detail: `You require pet-friendly housing and this listing isn't.`,
      });
    }

    if (hc.parkingRequired && !listing.hasParking && !isIgnored(profile.id, "parking")) {
      violations.push({
        roommateId: profile.id,
        roommateName: profile.name,
        constraint: "parking",
        label: "No parking",
        detail: `You require dedicated parking and this listing has none.`,
      });
    }
  }

  return { passed: violations.length === 0, violations };
}

function floorMatchesPreference(
  listing: Listing,
  preference: RoommateProfile["preferredFloor"]
): boolean {
  if (!preference || preference === "no-preference") return true;
  const ratio = listing.floor / Math.max(listing.totalFloors, 1);
  if (preference === "low") return ratio <= 0.4;
  if (preference === "mid") return ratio > 0.4 && ratio <= 0.75;
  if (preference === "high") return ratio > 0.75;
  return true;
}

function furnishingMatchesPreference(
  listing: Listing,
  preference: RoommateProfile["furnishingLevel"]
): boolean {
  if (!preference) return true;
  return listing.furnishing === preference;
}

function evaluateRoommate(
  listing: Listing,
  profile: RoommateProfile
): RoommateEvaluation {
  const sp = profile.softPreferences;
  const breakdown: SoftScoreBreakdownItem[] = [];

  const gymScore = Math.max(0, 5 - listing.distanceToGymKm);
  const gymEarned = (gymScore / 5) * sp.proximityToGym;
  breakdown.push({
    label: "Proximity to gym",
    earned: gymEarned,
    possible: sp.proximityToGym,
    status:
      sp.proximityToGym === 0
        ? "neutral"
        : gymEarned / sp.proximityToGym >= 0.6
        ? "win"
        : "compromise",
    detail: `${listing.distanceToGymKm.toFixed(1)} km from your gym`,
  });

  const metroScore = Math.max(0, 5 - listing.distanceToMetroKm);
  const metroEarned = (metroScore / 5) * sp.proximityToMetro;
  breakdown.push({
    label: "Proximity to metro",
    earned: metroEarned,
    possible: sp.proximityToMetro,
    status:
      sp.proximityToMetro === 0
        ? "neutral"
        : metroEarned / sp.proximityToMetro >= 0.6
        ? "win"
        : "compromise",
    detail: `${listing.distanceToMetroKm.toFixed(1)} km from nearest metro`,
  });

  const commuteKey = profile.hardConstraints
    .commuteDestination as keyof Listing["commuteMinutes"];
  const commuteMinutes = listing.commuteMinutes[commuteKey] ?? 30;
  const familyScore = Math.max(0, 5 - commuteMinutes / 12);
  const familyEarned = (familyScore / 5) * sp.proximityToFamily;
  breakdown.push({
    label: "Proximity to family/hub",
    earned: familyEarned,
    possible: sp.proximityToFamily,
    status:
      sp.proximityToFamily === 0
        ? "neutral"
        : familyEarned / sp.proximityToFamily >= 0.6
        ? "win"
        : "compromise",
    detail: `${commuteMinutes} min to ${profile.familyLocation ?? "your reference point"}`,
  });

  const balconyEarned = listing.hasBalcony ? sp.balconyImportance : 0;
  breakdown.push({
    label: "Balcony",
    earned: balconyEarned,
    possible: sp.balconyImportance,
    status:
      sp.balconyImportance === 0
        ? "neutral"
        : listing.hasBalcony
        ? "win"
        : "compromise",
    detail: listing.hasBalcony ? "Has a balcony" : "No balcony",
  });

  const floorMatches = floorMatchesPreference(listing, profile.preferredFloor);
  const floorEarned = floorMatches ? sp.floorPreferenceImportance : 0;
  breakdown.push({
    label: "Floor preference",
    earned: floorEarned,
    possible: sp.floorPreferenceImportance,
    status:
      sp.floorPreferenceImportance === 0
        ? "neutral"
        : floorMatches
        ? "win"
        : "compromise",
    detail: `Floor ${listing.floor} of ${listing.totalFloors}`,
  });

  const furnishingMatches = furnishingMatchesPreference(
    listing,
    profile.furnishingLevel
  );
  const furnishingEarned = furnishingMatches ? sp.furnishingImportance : 0;
  breakdown.push({
    label: "Furnishing level",
    earned: furnishingEarned,
    possible: sp.furnishingImportance,
    status:
      sp.furnishingImportance === 0
        ? "neutral"
        : furnishingMatches
        ? "win"
        : "compromise",
    detail: listing.furnishing.replace("-", " "),
  });

  const score = breakdown.reduce((sum, item) => sum + item.earned, 0);
  const maxScore = breakdown.reduce((sum, item) => sum + item.possible, 0);

  const wins = breakdown
    .filter((b) => b.status === "win" && b.possible > 0)
    .map((b) => `${b.label}: ${b.detail}`);
  const compromises = breakdown
    .filter((b) => b.status === "compromise" && b.possible > 0)
    .map((b) => `${b.label}: ${b.detail}`);

  return {
    roommateId: profile.id,
    roommateName: profile.name,
    score,
    maxScore,
    scorePercent: maxScore > 0 ? Math.round((score / maxScore) * 100) : 100,
    breakdown,
    wins,
    compromises,
  };
}

export function evaluateListing(
  listing: Listing,
  profiles: RoommateProfile[]
): ListingEvaluation {
  const hardConstraints = checkHardConstraints(listing, profiles);
  const roommateEvaluations = profiles.map((p) => evaluateRoommate(listing, p));

  const combinedScore = roommateEvaluations.reduce(
    (sum, e) => sum + e.scorePercent,
    0
  );
  const combinedScorePercent = Math.round(
    combinedScore / roommateEvaluations.length
  );

  const percents = roommateEvaluations.map((e) => e.scorePercent);
  const fairnessGap = Math.max(...percents) - Math.min(...percents);

  return {
    listing,
    hardConstraints,
    roommateEvaluations,
    combinedScore,
    combinedScorePercent,
    fairnessGap,
  };
}

export function evaluateAllListings(
  listings: Listing[],
  profiles: RoommateProfile[]
): {
  passing: ListingEvaluation[];
  failing: ListingEvaluation[];
} {
  const evaluations = listings.map((l) => evaluateListing(l, profiles));
  const passing = evaluations
    .filter((e) => e.hardConstraints.passed)
    .sort((a, b) => b.combinedScorePercent - a.combinedScorePercent);
  const failing = evaluations.filter((e) => !e.hardConstraints.passed);
  return { passing, failing };
}

/**
 * A short, plain-language sentence per roommate summarizing what they give up
 * (or don't) on a specific listing, so the trio can discuss trade-offs without
 * re-deriving them from the raw breakdown table.
 */
export function buildTradeoffSummary(evaluation: ListingEvaluation): string {
  const clauses = evaluation.roommateEvaluations.map((re) => {
    const compromiseItems = re.breakdown
      .filter((b) => b.status === "compromise" && b.possible > 0)
      .sort((a, b) => b.possible - a.possible);

    if (compromiseItems.length === 0) {
      return `${re.roommateName} gets everything on their list`;
    }

    const details = compromiseItems.slice(0, 2).map((b) => b.detail);
    return `${re.roommateName} gives up ${details.join(" and ")}`;
  });

  return clauses.join("; ") + ".";
}

export interface RelaxationSuggestion {
  roommateId: RoommateId;
  roommateName: string;
  constraint: ConstraintKey;
  constraintLabel: string;
  additionalListings: number;
}

const CONSTRAINT_DISPLAY_LABELS: Record<ConstraintKey, string> = {
  budget: "raising their budget cap",
  location: "un-excluding a locality",
  commute: "accepting a longer commute",
  lift: "dropping the lift requirement",
  bathrooms: "accepting fewer bathrooms",
  pet: "dropping the pet-friendly requirement",
  parking: "dropping the parking requirement",
};

/**
 * For every (roommate, constraint) pair currently blocking at least one
 * listing, estimates how many additional listings would pass if only that
 * one constraint were lifted for that one roommate — everything else held
 * constant. Surfaced so a stuck trio knows exactly which single compromise
 * unlocks the most options.
 */
export function suggestRelaxations(
  listings: Listing[],
  profiles: RoommateProfile[]
): RelaxationSuggestion[] {
  const baseline = listings.filter(
    (l) => checkHardConstraints(l, profiles).passed
  ).length;

  const pairs = new Map<string, RelaxationIgnore & { roommateName: string }>();
  for (const listing of listings) {
    const result = checkHardConstraints(listing, profiles);
    for (const v of result.violations) {
      const key = `${v.roommateId}:${v.constraint}`;
      if (!pairs.has(key)) {
        pairs.set(key, {
          roommateId: v.roommateId,
          constraint: v.constraint,
          roommateName: v.roommateName,
        });
      }
    }
  }

  const suggestions: RelaxationSuggestion[] = [];
  for (const { roommateId, constraint, roommateName } of pairs.values()) {
    const passingWithRelaxation = listings.filter(
      (l) =>
        checkHardConstraints(l, profiles, { roommateId, constraint }).passed
    ).length;
    const additionalListings = passingWithRelaxation - baseline;
    if (additionalListings > 0) {
      suggestions.push({
        roommateId,
        roommateName,
        constraint,
        constraintLabel: CONSTRAINT_DISPLAY_LABELS[constraint],
        additionalListings,
      });
    }
  }

  return suggestions.sort((a, b) => b.additionalListings - a.additionalListings);
}
