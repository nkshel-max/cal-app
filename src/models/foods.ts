import { trimNum } from "./dates.ts";
import type { Amount, Entry, Food, MealId, Portion } from "./types.ts";

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Common foods. Values are typical USDA-style servings, rounded for a journal. */
export const FOODS: Food[] = [
  { id: "egg", name: "Egg", aliases: ["egg", "eggs", "large egg"], group: "protein", servingLabel: "1 large", grams: 50, kcal: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
  { id: "egg-white", name: "Egg white", aliases: ["egg white", "egg whites"], group: "protein", servingLabel: "1 white", grams: 33, kcal: 17, protein: 3.6, carbs: 0.2, fat: 0 },
  { id: "chicken-breast", name: "Chicken breast", aliases: ["chicken", "chicken breast", "grilled chicken"], group: "protein", servingLabel: "100 g", grams: 100, kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "salmon", name: "Salmon", aliases: ["salmon", "baked salmon"], group: "protein", servingLabel: "100 g", grams: 100, kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "tuna", name: "Tuna, canned", aliases: ["tuna", "canned tuna"], group: "protein", servingLabel: "100 g", grams: 100, kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { id: "shrimp", name: "Shrimp", aliases: ["shrimp", "prawns"], group: "protein", servingLabel: "100 g", grams: 100, kcal: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { id: "turkey", name: "Turkey breast", aliases: ["turkey", "turkey breast"], group: "protein", servingLabel: "100 g", grams: 100, kcal: 135, protein: 30, carbs: 0, fat: 1 },
  { id: "beef", name: "Lean ground beef", aliases: ["beef", "ground beef", "mince"], group: "protein", servingLabel: "100 g cooked", grams: 100, kcal: 215, protein: 26, carbs: 0, fat: 12 },
  { id: "tofu", name: "Firm tofu", aliases: ["tofu"], group: "protein", servingLabel: "100 g", grams: 100, kcal: 144, protein: 17, carbs: 3, fat: 9 },
  { id: "greek-yogurt", name: "Greek yogurt", aliases: ["greek yogurt", "yogurt", "yoghurt"], group: "protein", servingLabel: "1 cup", grams: 170, kcal: 100, protein: 17, carbs: 6, fat: 0.7 },
  { id: "cottage-cheese", name: "Cottage cheese", aliases: ["cottage cheese"], group: "protein", servingLabel: "1/2 cup", grams: 113, kcal: 90, protein: 12, carbs: 4, fat: 2.5 },
  { id: "whey", name: "Whey protein", aliases: ["whey", "protein shake", "protein powder", "shake"], group: "protein", servingLabel: "1 scoop", grams: 30, kcal: 120, protein: 24, carbs: 3, fat: 1.5 },
  { id: "bacon", name: "Bacon", aliases: ["bacon"], group: "protein", servingLabel: "2 slices", grams: 16, kcal: 86, protein: 6, carbs: 0.2, fat: 6.6 },
  { id: "sausage", name: "Breakfast sausage", aliases: ["sausage", "sausages"], group: "protein", servingLabel: "2 links", grams: 50, kcal: 160, protein: 8, carbs: 1, fat: 14 },
  { id: "white-rice", name: "White rice", aliases: ["rice", "white rice", "steamed rice"], group: "carb", servingLabel: "1 cup cooked", grams: 158, kcal: 206, protein: 4.3, carbs: 45, fat: 0.4 },
  { id: "brown-rice", name: "Brown rice", aliases: ["brown rice"], group: "carb", servingLabel: "1 cup cooked", grams: 195, kcal: 216, protein: 5, carbs: 45, fat: 1.8 },
  { id: "oats", name: "Oats", aliases: ["oats", "oatmeal", "porridge"], group: "carb", servingLabel: "1/2 cup dry", grams: 40, kcal: 150, protein: 5, carbs: 27, fat: 2.5 },
  { id: "pasta", name: "Pasta", aliases: ["pasta", "noodles", "spaghetti"], group: "carb", servingLabel: "1 cup cooked", grams: 140, kcal: 220, protein: 8, carbs: 43, fat: 1.3 },
  { id: "quinoa", name: "Quinoa", aliases: ["quinoa"], group: "carb", servingLabel: "1 cup cooked", grams: 185, kcal: 222, protein: 8, carbs: 39, fat: 3.6 },
  { id: "sourdough", name: "Sourdough", aliases: ["sourdough", "sourdough bread"], group: "carb", servingLabel: "1 slice", grams: 50, kcal: 130, protein: 5, carbs: 25, fat: 1 },
  { id: "toast", name: "Toast", aliases: ["toast", "bread", "whole wheat bread"], group: "carb", servingLabel: "1 slice", grams: 38, kcal: 80, protein: 4, carbs: 14, fat: 1 },
  { id: "bagel", name: "Bagel", aliases: ["bagel"], group: "carb", servingLabel: "1 bagel", grams: 100, kcal: 270, protein: 10, carbs: 53, fat: 1.5 },
  { id: "tortilla", name: "Flour tortilla", aliases: ["tortilla", "wrap"], group: "carb", servingLabel: "1 medium", grams: 49, kcal: 140, protein: 4, carbs: 24, fat: 3.5 },
  { id: "sweet-potato", name: "Sweet potato", aliases: ["sweet potato"], group: "carb", servingLabel: "1 medium", grams: 130, kcal: 112, protein: 2, carbs: 26, fat: 0.1 },
  { id: "potato", name: "Baked potato", aliases: ["potato", "baked potato"], group: "carb", servingLabel: "1 medium", grams: 173, kcal: 161, protein: 4.3, carbs: 37, fat: 0.2 },
  { id: "banana", name: "Banana", aliases: ["banana", "bananas"], group: "produce", servingLabel: "1 medium", grams: 118, kcal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: "apple", name: "Apple", aliases: ["apple", "apples"], group: "produce", servingLabel: "1 medium", grams: 182, kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: "blueberries", name: "Blueberries", aliases: ["blueberries", "blueberry"], group: "produce", servingLabel: "1 cup", grams: 148, kcal: 84, protein: 1.1, carbs: 21, fat: 0.5 },
  { id: "strawberries", name: "Strawberries", aliases: ["strawberries", "strawberry"], group: "produce", servingLabel: "1 cup", grams: 152, kcal: 49, protein: 1, carbs: 12, fat: 0.5 },
  { id: "broccoli", name: "Broccoli", aliases: ["broccoli"], group: "produce", servingLabel: "1 cup", grams: 156, kcal: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { id: "spinach", name: "Spinach", aliases: ["spinach", "salad", "greens"], group: "produce", servingLabel: "2 cups", grams: 60, kcal: 14, protein: 1.7, carbs: 2.2, fat: 0.2 },
  { id: "avocado", name: "Avocado", aliases: ["avocado"], group: "fat", servingLabel: "1/2 fruit", grams: 68, kcal: 114, protein: 1.3, carbs: 6, fat: 10.5 },
  { id: "olive-oil", name: "Olive oil", aliases: ["olive oil", "oil"], group: "fat", servingLabel: "1 tbsp", grams: 14, kcal: 119, protein: 0, carbs: 0, fat: 13.5 },
  { id: "peanut-butter", name: "Peanut butter", aliases: ["peanut butter", "pb"], group: "fat", servingLabel: "2 tbsp", grams: 32, kcal: 188, protein: 8, carbs: 6, fat: 16 },
  { id: "almonds", name: "Almonds", aliases: ["almonds", "almond"], group: "fat", servingLabel: "1 oz", grams: 28, kcal: 164, protein: 6, carbs: 6, fat: 14 },
  { id: "cheddar", name: "Cheddar", aliases: ["cheddar", "cheese"], group: "fat", servingLabel: "1 oz", grams: 28, kcal: 114, protein: 7, carbs: 1, fat: 9 },
  { id: "hummus", name: "Hummus", aliases: ["hummus"], group: "fat", servingLabel: "2 tbsp", grams: 30, kcal: 70, protein: 2, carbs: 6, fat: 4.5 },
  { id: "granola", name: "Granola", aliases: ["granola"], group: "carb", servingLabel: "1/2 cup", grams: 60, kcal: 260, protein: 6, carbs: 40, fat: 9 },
  { id: "protein-bar", name: "Protein bar", aliases: ["protein bar", "bar"], group: "meal", servingLabel: "1 bar", grams: 60, kcal: 220, protein: 20, carbs: 24, fat: 8 },
  { id: "pizza", name: "Cheese pizza", aliases: ["pizza", "pizza slice"], group: "meal", servingLabel: "1 slice", grams: 107, kcal: 285, protein: 12, carbs: 36, fat: 10 },
  { id: "burger", name: "Cheeseburger", aliases: ["burger", "cheeseburger", "hamburger"], group: "meal", servingLabel: "1 burger", grams: 150, kcal: 350, protein: 18, carbs: 30, fat: 16 },
  { id: "fries", name: "French fries", aliases: ["fries", "french fries", "chips"], group: "meal", servingLabel: "medium", grams: 117, kcal: 365, protein: 4, carbs: 48, fat: 17 },
  { id: "pancakes", name: "Pancakes", aliases: ["pancakes", "pancake"], group: "meal", servingLabel: "2 pancakes", grams: 160, kcal: 220, protein: 6, carbs: 38, fat: 5 },
  { id: "ice-cream", name: "Vanilla ice cream", aliases: ["ice cream", "icecream"], group: "meal", servingLabel: "1/2 cup", grams: 66, kcal: 137, protein: 2.3, carbs: 16, fat: 7 },
  { id: "dark-chocolate", name: "Dark chocolate", aliases: ["chocolate", "dark chocolate"], group: "meal", servingLabel: "1 square", grams: 10, kcal: 55, protein: 0.7, carbs: 5, fat: 3.5 },
  { id: "rice-cake", name: "Rice cake", aliases: ["rice cake", "rice cakes"], group: "carb", servingLabel: "1 cake", grams: 9, kcal: 35, protein: 0.7, carbs: 7, fat: 0.3 },
  { id: "latte", name: "Latte", aliases: ["latte", "coffee latte"], group: "drink", servingLabel: "12 oz", grams: 300, kcal: 180, protein: 9, carbs: 14, fat: 9 },
  { id: "coffee", name: "Black coffee", aliases: ["coffee", "black coffee", "americano"], group: "drink", servingLabel: "8 oz", grams: 240, kcal: 2, protein: 0.3, carbs: 0, fat: 0 },
  { id: "milk", name: "Milk, 2%", aliases: ["milk"], group: "drink", servingLabel: "1 cup", grams: 244, kcal: 122, protein: 8, carbs: 12, fat: 4.8 },
  { id: "orange-juice", name: "Orange juice", aliases: ["orange juice", "oj", "juice"], group: "drink", servingLabel: "1 cup", grams: 248, kcal: 112, protein: 1.7, carbs: 26, fat: 0.5 },
  { id: "cola", name: "Cola", aliases: ["cola", "coke", "soda"], group: "drink", servingLabel: "12 oz", grams: 355, kcal: 140, protein: 0, carbs: 39, fat: 0 },
  { id: "beer", name: "Beer", aliases: ["beer"], group: "drink", servingLabel: "12 oz", grams: 355, kcal: 153, protein: 1.6, carbs: 13, fat: 0 },
  { id: "wine", name: "Red wine", aliases: ["wine", "red wine"], group: "drink", servingLabel: "5 oz", grams: 147, kcal: 125, protein: 0.1, carbs: 4, fat: 0 },
];

export function portion(food: Food, amount: Amount): Portion {
  const servings = amount.grams != null ? amount.grams / food.grams : (amount.servings ?? 1);
  const safe = Number.isFinite(servings) && servings > 0 ? servings : 1;
  const grams = amount.grams != null ? amount.grams : food.grams * safe;
  return {
    servings: Math.round(safe * 100) / 100,
    grams: Math.round(grams),
    kcal: Math.round(food.kcal * safe),
    protein: round1(food.protein * safe),
    carbs: round1(food.carbs * safe),
    fat: round1(food.fat * safe),
  };
}

export function describePortion(food: Food, amount: Amount, served: Portion) {
  if (amount.grams != null) return `${Math.round(amount.grams)} g`;
  return `${trimNum(served.servings)} × ${food.servingLabel}`;
}

export function entryFromFood(food: Food, meal: MealId, amount: Amount): Entry {
  const served = portion(food, amount);
  return {
    id: crypto.randomUUID(),
    foodId: food.id,
    name: food.name,
    meal,
    ...served,
    detail: describePortion(food, amount, served),
  };
}

export function entryCustom(input: {
  name: string;
  meal: MealId;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}): Entry {
  return {
    id: crypto.randomUUID(),
    foodId: null,
    name: input.name.trim() || "Custom food",
    meal: input.meal,
    servings: 1,
    grams: 0,
    kcal: Math.max(0, Math.round(input.kcal)),
    protein: round1(Math.max(0, input.protein)),
    carbs: round1(Math.max(0, input.carbs)),
    fat: round1(Math.max(0, input.fat)),
    detail: "Custom",
  };
}

export function totals(entries: Entry[]) {
  return entries.reduce(
    (sum, entry) => ({
      kcal: sum.kcal + entry.kcal,
      protein: sum.protein + entry.protein,
      carbs: sum.carbs + entry.carbs,
      fat: sum.fat + entry.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
