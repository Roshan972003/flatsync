import { RoommateId, RoommateProfile } from "./types";

export interface SharedState {
  profiles: Record<RoommateId, RoommateProfile>;
  currentStep: 1 | 2 | 3;
}

const PARAM_NAME = "state";

// Note: this returns a plain (unencoded) JSON string. Percent-encoding is
// applied exactly once, by URLSearchParams itself when the URL is built —
// encoding it here too would double-encode the value.
export function encodeSharedState(state: SharedState): string {
  return JSON.stringify(state);
}

// `param` is expected to already be decoded (e.g. via URLSearchParams.get(),
// which decodes automatically) — do not decodeURIComponent it again here.
export function decodeSharedState(param: string): SharedState | null {
  try {
    const parsed = JSON.parse(param);
    if (parsed && typeof parsed === "object" && parsed.profiles && parsed.currentStep) {
      return parsed as SharedState;
    }
    return null;
  } catch {
    return null;
  }
}

export function readSharedStateFromLocation(): SharedState | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(PARAM_NAME);
  if (!raw) return null;
  return decodeSharedState(raw);
}

/** Removes the ?state=... param from the visible URL after it's been applied. */
export function clearSharedStateFromLocation(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM_NAME);
  window.history.replaceState({}, "", url.toString());
}

export function buildShareableUrl(state: SharedState): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(PARAM_NAME, encodeSharedState(state));
  return url.toString();
}
