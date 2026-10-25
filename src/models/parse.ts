import { describePortion, FOODS, portion } from "./foods.ts";
import type { Amount, Food, Portion } from "./types.ts";

const STOP = new Set(["of", "and", "with", "the", "a", "an"]);

export type ParsedItem = {
  food: Food;
  source: string;
  amount: Amount;
  portion: Portion;
  detail: string;
  score: number;
};

export type PlateParse = {
  items: ParsedItem[];
  unmatched: string[];
};

function norm(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreFood(query: string, food: Food) {
  const q = norm(query);
  if (!q) return 0;
  const names = [food.name, ...food.aliases].map(norm);
  let best = 0;
  for (const name of names) {
    if (!name) continue;
    if (name === q) {
      best = Math.max(best, 100);
      continue;
    }
    if (name.startsWith(q) || q.startsWith(name)) {
      best = Math.max(best, 88);
      continue;
    }
    if (name.includes(q) || q.includes(name)) {
      best = Math.max(best, 76);
      continue;
    }
    const qt = q.split(" ").filter((word) => word.length > 1 && !STOP.has(word));
    const nt = name.split(" ").filter((word) => word.length > 1);
    if (!qt.length || !nt.length) continue;
    const overlap = qt.filter((word) => nt.includes(word)).length;
    best = Math.max(best, Math.round((overlap / Math.max(nt.length, qt.length)) * 70));
  }
  return best;
}

function rank(query: string) {
  let best: { food: Food; score: number } | null = null;
  for (const food of FOODS) {
    const score = scoreFood(query, food);
    if (!best || score > best.score || (score === best.score && food.name.length < best.food.name.length)) {
      best = { food, score };
    }
  }
  return best;
}

function bestMatch(query: string) {
  const direct = rank(query);
  if (direct && direct.score >= 42) return direct;
  const stripped = query.replace(/\b([a-z]{3,})s\b/gi, "$1");
  if (stripped !== query) {
    const again = rank(stripped);
    if (again && again.score >= 42) return again;
  }
  return null;
}

function canonicalUnit(unit: string | null) {
  if (!unit) return null;
  const u = unit.toLowerCase();
  if (u === "g" || u.startsWith("gram")) return "g";
  if (u === "kg") return "kg";
  if (u === "oz" || u.startsWith("ounce")) return "oz";
  if (u === "lb" || u === "lbs" || u.startsWith("pound")) return "lb";
  if (u === "ml" || u.startsWith("milli")) return "ml";
  if (u.startsWith("cup")) return "cup";
  if (u === "tbsp" || u.startsWith("tablespoon")) return "tbsp";
  if (u === "tsp" || u.startsWith("teaspoon")) return "tsp";
  if (u.startsWith("slice")) return "slice";
  if (u.startsWith("piece")) return "piece";
  if (u.startsWith("serving")) return "serving";
  if (u.startsWith("bowl")) return "bowl";
  return null;
}

function servingsForUnit(qty: number, unit: string, food: Food) {
  const label = food.servingLabel.toLowerCase();
  if (unit === "cup") {
    if (label.includes("1/2 cup")) return qty * 2;
    if (label.includes("1/4 cup")) return qty * 4;
    return qty;
  }
  if (unit === "tbsp") {
    if (label.includes("2 tbsp")) return qty / 2;
    return qty;
  }
  if (unit === "slice" && label.includes("2 slices")) return qty / 2;
  if (unit === "piece" && label.includes("2 ")) return qty / 2;
  return qty;
}

function amountFor(qty: number, unit: string | null, food: Food): Amount | null {
  const u = canonicalUnit(unit);
  if (u === "g") return { grams: qty };
  if (u === "kg") return { grams: qty * 1000 };
  if (u === "oz") return { grams: qty * 28.3495 };
  if (u === "lb") return { grams: qty * 453.592 };
  if (u === "ml") return { grams: qty };
  const servings = u == null ? qty : servingsForUnit(qty, u, food);
  if (servings <= 0 || servings > 30) return null;
  return { servings };
}

function withUnit(qty: number, rest: string) {
  const match = rest.match(
    /^(g|grams?|kg|oz|ounces?|lbs?|pounds?|cups?|tbsp|tablespoons?|tsp|teaspoons?|slices?|pieces?|servings?|bowls?|ml|milliliters?)\b\s*(?:of\s+)?/i,
  );
  if (!match) return { qty, unit: null as string | null, rest: rest.replace(/^of\s+/i, "").trim() };
  return { qty, unit: match[1].toLowerCase(), rest: rest.slice(match[0].length).trim() };
}

function takeAmount(text: string) {
  let source = text.trim().replace(/^(a|an)\s+/i, "1 ");
  const attached = source.match(/^(\d+(?:\.\d+)?)\s*(g|kg|oz|lbs?|ml)\b\s*/i);
  if (attached) {
    return { qty: Number(attached[1]), unit: attached[2].toLowerCase(), rest: source.slice(attached[0].length).trim() };
  }
  const mixed = source.match(/^(\d+)\s+(\d+)\/(\d+)\s*/);
  if (mixed && Number(mixed[3]) !== 0) {
    const qty = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    return withUnit(qty, source.slice(mixed[0].length));
  }
  const fraction = source.match(/^(\d+)\/(\d+)\s*/);
  if (fraction && Number(fraction[2]) !== 0) {
    return withUnit(Number(fraction[1]) / Number(fraction[2]), source.slice(fraction[0].length));
  }
  const number = source.match(/^(\d+(?:\.\d+)?)\s*/);
  if (number) return withUnit(Number(number[1]), source.slice(number[0].length));

  const trail = source.match(
    /^(.*?)(?:\s+)(\d+(?:\.\d+)?)\s*(g|kg|oz|lbs?|ml|cups?|tbsp|tsp|slices?|pieces?|servings?)\s*$/i,
  );
  if (trail?.[1].trim()) {
    return { qty: Number(trail[2]), unit: trail[3].toLowerCase(), rest: trail[1].trim() };
  }
  return { qty: 1, unit: null as string | null, rest: source };
}

function parseChunk(chunk: string): ParsedItem | null {
  const taken = takeAmount(chunk);
  const query = taken.rest.replace(/^of\s+/i, "").trim();
  if (!query) return null;
  const match = bestMatch(query);
  if (!match) return null;
  const amount = amountFor(taken.qty, taken.unit, match.food);
  if (!amount) return null;
  if (amount.grams != null && (amount.grams <= 0 || amount.grams > 2000)) return null;
  const served = portion(match.food, amount);
  return {
    food: match.food,
    source: chunk.trim(),
    amount,
    portion: served,
    detail: describePortion(match.food, amount, served),
    score: match.score,
  };
}

export function parsePlate(input: string): PlateParse {
  const whole = input.trim();
  if (!whole) return { items: [], unmatched: [] };
  const chunks = whole
    .split(/\s*(?:,|\n|&|\+|\band\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const items: ParsedItem[] = [];
  const unmatched: string[] = [];
  for (const chunk of chunks) {
    const item = parseChunk(chunk);
    if (item) items.push(item);
    else unmatched.push(chunk);
  }
  return { items, unmatched };
}

export function searchFoods(query: string) {
  const q = query.trim();
  if (!q) {
    return ["egg", "chicken-breast", "white-rice", "oats", "greek-yogurt", "banana", "salmon", "avocado"]
      .map((id) => FOODS.find((food) => food.id === id))
      .filter((food): food is Food => food != null);
  }
  return FOODS.map((food) => ({ food, score: scoreFood(q, food) }))
    .filter((item) => item.score >= 35)
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length)
    .slice(0, 8)
    .map((item) => item.food);
}
