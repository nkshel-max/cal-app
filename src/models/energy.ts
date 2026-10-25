import type {
  ActivityId,
  GoalId,
  MacroStyleId,
  MealId,
  Profile,
  Sex,
  Targets,
} from "./types.ts";

export const ACTIVITIES: {
  id: ActivityId;
  label: string;
  detail: string;
  factor: number;
}[] = [
  { id: "sedentary", label: "Sedentary", detail: "Desk day, little exercise", factor: 1.2 },
  { id: "light", label: "Light", detail: "Easy walks, 1–3 sessions", factor: 1.375 },
  { id: "moderate", label: "Moderate", detail: "Training 3–5 days a week", factor: 1.55 },
  { id: "active", label: "Active", detail: "Hard sessions most days", factor: 1.725 },
  { id: "athlete", label: "Athlete", detail: "Physical work or two-a-days", factor: 1.9 },
];

export const GOALS: { id: GoalId; label: string; detail: string; factor: number }[] = [
  { id: "cut", label: "Cut", detail: "About 18% under maintenance", factor: 0.82 },
  { id: "maintain", label: "Maintain", detail: "Match estimated expenditure", factor: 1 },
  { id: "build", label: "Build", detail: "About 12% over maintenance", factor: 1.12 },
];

export const MACRO_STYLES: {
  id: MacroStyleId;
  label: string;
  detail: string;
  protein: number;
  carbs: number;
  fat: number;
}[] = [
  { id: "balanced", label: "Balanced", detail: "30 / 40 / 30", protein: 0.3, carbs: 0.4, fat: 0.3 },
  {
    id: "high-protein",
    label: "High protein",
    detail: "40 / 35 / 25",
    protein: 0.4,
    carbs: 0.35,
    fat: 0.25,
  },
  {
    id: "lower-carb",
    label: "Lower carb",
    detail: "35 / 25 / 40",
    protein: 0.35,
    carbs: 0.25,
    fat: 0.4,
  },
];

export const MEALS: { id: MealId; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

export const DEFAULT_PROFILE: Profile = {
  name: "",
  sex: "female",
  age: 30,
  heightCm: 168,
  weightKg: 68,
  activity: "moderate",
  goal: "maintain",
  macroStyle: "balanced",
  units: "metric",
  customKcal: null,
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** Mifflin–St Jeor basal metabolic rate, in kcal/day. */
export function mifflinStJeor(sex: Sex, kg: number, cm: number, age: number) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function activityById(id: ActivityId) {
  return ACTIVITIES.find((item) => item.id === id) ?? ACTIVITIES[2];
}

export function goalById(id: GoalId) {
  return GOALS.find((item) => item.id === id) ?? GOALS[1];
}

export function macroStyleById(id: MacroStyleId) {
  return MACRO_STYLES.find((item) => item.id === id) ?? MACRO_STYLES[0];
}

export function targetsFor(profile: Profile): Targets {
  const age = clamp(profile.age, 15, 90);
  const cm = clamp(profile.heightCm, 120, 230);
  const kg = clamp(profile.weightKg, 35, 250);
  const bmr = mifflinStJeor(profile.sex, kg, cm, age);
  const activity = activityById(profile.activity);
  const goal = goalById(profile.goal);
  const style = macroStyleById(profile.macroStyle);
  const tdee = bmr * activity.factor;
  const modeled = tdee * goal.factor;
  const custom =
    profile.customKcal != null && profile.customKcal >= 1000 && profile.customKcal <= 6000;
  const kcal = custom ? profile.customKcal : modeled;
  const safeKcal = kcal ?? modeled;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal: Math.round(safeKcal),
    protein: Math.round((safeKcal * style.protein) / 4),
    carbs: Math.round((safeKcal * style.carbs) / 4),
    fat: Math.round((safeKcal * style.fat) / 9),
    custom,
  };
}

export function suggestedMeal(date = new Date()): MealId {
  const hour = date.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}
