export type Sex = "female" | "male";
export type ActivityId = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type GoalId = "cut" | "maintain" | "build";
export type MacroStyleId = "balanced" | "high-protein" | "lower-carb";
export type MealId = "breakfast" | "lunch" | "dinner" | "snack";
export type UnitSystem = "metric" | "imperial";

export type Profile = {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityId;
  goal: GoalId;
  macroStyle: MacroStyleId;
  units: UnitSystem;
  customKcal: number | null;
};

export type Targets = {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  custom: boolean;
};

export type FoodGroup = "protein" | "carb" | "produce" | "fat" | "meal" | "drink";

export type Food = {
  id: string;
  name: string;
  aliases: string[];
  group: FoodGroup;
  servingLabel: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Entry = {
  id: string;
  foodId: string | null;
  name: string;
  meal: MealId;
  servings: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  detail: string;
};

export type StoreData = {
  profile: Profile | null;
  logs: Record<string, Entry[]>;
};

export type Portion = {
  servings: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Amount = {
  servings?: number;
  grams?: number;
};
