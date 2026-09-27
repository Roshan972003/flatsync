"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoommateId, RoommateProfile } from "./types";

interface FlatSyncState {
  profiles: Record<RoommateId, RoommateProfile>;
  activeRoommate: RoommateId;
  currentStep: 1 | 2 | 3;
  setActiveRoommate: (id: RoommateId) => void;
  updateProfile: (id: RoommateId, patch: Partial<RoommateProfile>) => void;
  updateHardConstraint: (
    id: RoommateId,
    patch: Partial<RoommateProfile["hardConstraints"]>
  ) => void;
  updateSoftPreference: (
    id: RoommateId,
    patch: Partial<RoommateProfile["softPreferences"]>
  ) => void;
  markCompleted: (id: RoommateId, completed: boolean) => void;
  goToStep: (step: 1 | 2 | 3) => void;
  resetAll: () => void;
  allCompleted: () => boolean;
}

const defaultProfiles: Record<RoommateId, RoommateProfile> = {
  riya: {
    id: "riya",
    name: "Riya",
    completed: false,
    hardConstraints: {
      maxBudget: 16000,
      excludedLocations: [],
      maxCommuteMinutes: 40,
      commuteDestination: "koregaonPark",
      requiresLift: false,
      minBathrooms: 1,
      petFriendlyRequired: false,
      parkingRequired: false,
    },
    softPreferences: {
      proximityToGym: 5,
      proximityToMetro: 3,
      proximityToFamily: 4,
      balconyImportance: 3,
      floorPreferenceImportance: 2,
      furnishingImportance: 2,
    },
    gymLocation: "Baner",
    familyLocation: "Koregaon Park",
    preferredFloor: "no-preference",
    furnishingLevel: "semi-furnished",
  },
  meera: {
    id: "meera",
    name: "Meera",
    completed: false,
    hardConstraints: {
      maxBudget: 15000,
      excludedLocations: [],
      maxCommuteMinutes: 45,
      commuteDestination: "hinjewadi",
      requiresLift: true,
      minBathrooms: 2,
      petFriendlyRequired: false,
      parkingRequired: false,
    },
    softPreferences: {
      proximityToGym: 1,
      proximityToMetro: 3,
      proximityToFamily: 2,
      balconyImportance: 3,
      floorPreferenceImportance: 5,
      furnishingImportance: 3,
    },
    preferredFloor: "low",
    furnishingLevel: "semi-furnished",
  },
  kavita: {
    id: "kavita",
    name: "Kavita",
    completed: false,
    hardConstraints: {
      maxBudget: 15500,
      excludedLocations: [],
      maxCommuteMinutes: 30,
      commuteDestination: "hinjewadi",
      requiresLift: false,
      minBathrooms: 1,
      petFriendlyRequired: false,
      parkingRequired: false,
    },
    softPreferences: {
      proximityToGym: 2,
      proximityToMetro: 4,
      proximityToFamily: 1,
      balconyImportance: 2,
      floorPreferenceImportance: 2,
      furnishingImportance: 2,
    },
    preferredFloor: "no-preference",
    furnishingLevel: "unfurnished",
  },
};

export const useFlatSyncStore = create<FlatSyncState>()(
  persist(
    (set, get) => ({
      profiles: defaultProfiles,
      activeRoommate: "riya",
      currentStep: 1,
      setActiveRoommate: (id) => set({ activeRoommate: id }),
      updateProfile: (id, patch) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [id]: { ...state.profiles[id], ...patch },
          },
        })),
      updateHardConstraint: (id, patch) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [id]: {
              ...state.profiles[id],
              hardConstraints: {
                ...state.profiles[id].hardConstraints,
                ...patch,
              },
            },
          },
        })),
      updateSoftPreference: (id, patch) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [id]: {
              ...state.profiles[id],
              softPreferences: {
                ...state.profiles[id].softPreferences,
                ...patch,
              },
            },
          },
        })),
      markCompleted: (id, completed) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [id]: { ...state.profiles[id], completed },
          },
        })),
      goToStep: (step) => set({ currentStep: step }),
      resetAll: () =>
        set({ profiles: defaultProfiles, activeRoommate: "riya", currentStep: 1 }),
      allCompleted: () => {
        const { profiles } = get();
        return Object.values(profiles).every((p) => p.completed);
      },
    }),
    {
      name: "flatsync-storage",
    }
  )
);
