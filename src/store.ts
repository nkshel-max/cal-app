import { useEffect, useState } from "react";
import { dateKey } from "./models/dates.ts";
import type { Entry, Profile, StoreData } from "./models/types.ts";

const KEY = "caltek.v1";
const LEGACY_KEY = "nara.v1";

const EMPTY: StoreData = { profile: null, logs: {} };

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Profile;
  return (
    typeof profile.name === "string" &&
    (profile.sex === "female" || profile.sex === "male") &&
    typeof profile.age === "number" &&
    typeof profile.heightCm === "number" &&
    typeof profile.weightKg === "number" &&
    typeof profile.activity === "string" &&
    typeof profile.goal === "string" &&
    typeof profile.macroStyle === "string"
  );
}

function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as StoreData;
    return {
      profile: isProfile(parsed.profile)
        ? {
            ...parsed.profile,
            units: parsed.profile.units === "imperial" ? "imperial" : "metric",
            customKcal: typeof parsed.profile.customKcal === "number" ? parsed.profile.customKcal : null,
          }
        : null,
      logs: parsed.logs && typeof parsed.logs === "object" ? parsed.logs : {},
    };
  } catch {
    return EMPTY;
  }
}

export function useJournal() {
  const [data, setData] = useState<StoreData>(load);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(data));
    localStorage.removeItem(LEGACY_KEY);
  }, [data, ready]);

  return {
    data,
    setProfile(profile: Profile) {
      setData((current) => ({ ...current, profile }));
    },
    addEntries(date: string, entries: Entry[]) {
      if (!entries.length) return;
      setData((current) => ({
        ...current,
        logs: {
          ...current.logs,
          [date]: [...(current.logs[date] ?? []), ...entries],
        },
      }));
    },
    removeEntry(date: string, id: string) {
      setData((current) => ({
        ...current,
        logs: {
          ...current.logs,
          [date]: (current.logs[date] ?? []).filter((entry) => entry.id !== id),
        },
      }));
    },
    reset() {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEY);
      setData(EMPTY);
    },
    today: dateKey(),
  };
}
